// Server-side Firebase ID-token verification via the Identity Toolkit REST
// API — no Admin SDK needed (works on Workers).
//
// The fallback mirrors src/lib/firebase.js's — NEXT_PUBLIC_* vars are inlined
// at BUILD time, in server code same as client code, so if the Cloudflare
// build environment is ever missing this variable, `key` bakes in as
// `undefined` permanently and every signed-in user's POST/DELETE here starts
// 401ing (verifyUser returns null before ever calling the token-check API) —
// while sign-in itself keeps working fine, since that only needs the client
// SDK. This is the Firebase web API key, public by design; see firebase.js.

// Short-lived, per-isolate memo of successful verifications.
//
// Every verifyUser() call is an outbound round-trip to Google. That was
// tolerable while only mutations verified, but the user-scoped GET endpoints
// now verify too (see src/lib/api-auth.js) and several of them are POLLED:
// Navbar re-checks notifications, ContinueReading re-reads the shelf. Without
// a memo, opening the site would fire a handful of identical lookups within
// seconds of each other.
//
// Keyed by a SHA-256 of the token so the raw credential is not held as a Map
// key, and capped so a burst of distinct tokens cannot grow it without bound.
// 60s is deliberately far below a Firebase ID token's ~1h lifetime: this is a
// stampede guard, not a session store, and it must never be the reason a
// revoked token keeps working for long. Only successes are memoized —
// failures stay uncached so a retry re-checks immediately.
const VERIFY_TTL_MS = 60_000;
const VERIFY_MAX = 500;
const verifyCache = new Map();

async function tokenKey(idToken) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(idToken));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function memoGet(key) {
  const hit = verifyCache.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.exp) {
    verifyCache.delete(key);
    return undefined;
  }
  return hit.user;
}

function memoSet(key, user) {
  if (verifyCache.has(key)) verifyCache.delete(key);
  else if (verifyCache.size >= VERIFY_MAX) verifyCache.delete(verifyCache.keys().next().value);
  verifyCache.set(key, { user, exp: Date.now() + VERIFY_TTL_MS });
}

// Returns the verified user, or null for anything that didn't verify.
//
// This is the lenient form, and it is what every existing mutation route
// calls (api/shelf, api/follow, api/quotes, api/discussions/*, api/auth/*).
// Those routes answer a null with 401, so keeping the contract means a
// transient Google outage still reads as "unauthorized" there — not ideal,
// but unchanged, and changing it would turn an outage into an unhandled 500
// across fifteen handlers. Use verifyUserStrict() in new code.
export async function verifyUser(idToken) {
  try {
    return await verifyUserStrict(idToken);
  } catch {
    return null;
  }
}

// Same verification, but THROWS when the check could not be carried out at
// all (network failure, or 5xx/429 from Google) rather than reporting it as
// a rejected token. `requireUser` in src/lib/api-auth.js turns that into a
// 503 instead of a 401, because telling the browser "unauthorized" during an
// upstream outage invites a needless sign-out. A 400 from Identity Toolkit —
// what a forged, malformed or expired token actually produces — returns null.
export async function verifyUserStrict(idToken) {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBKSZnmcB7AOvJCMSz087kheEp7NDAtwEU";
  if (!key || !idToken) return null;

  const cacheKey = await tokenKey(idToken);
  const memoized = memoGet(cacheKey);
  if (memoized) return memoized;

  let res;
  try {
    res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
  } catch (err) {
    throw new Error(`token verification unavailable: ${err}`);
  }
  if (res.status >= 500 || res.status === 429) {
    throw new Error(`token verification unavailable: Identity Toolkit returned ${res.status}`);
  }
  if (!res.ok) return null;
  const data = await res.json();
  const u = data.users?.[0];
  if (!u) return null;
  const user = {
    uid: u.localId, name: u.displayName || u.email?.split("@")[0] || "Reader", photo: u.photoUrl || null,
    // Trusted server-side from the verified token — never take an email
    // address from the request body for anything that sends mail, or a
    // signed-in user could direct a verification code at any address.
    email: u.email || null,
  };
  memoSet(cacheKey, user);
  return user;
}
