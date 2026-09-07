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
export async function verifyUser(idToken) {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBKSZnmcB7AOvJCMSz087kheEp7NDAtwEU";
  if (!key || !idToken) return null;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const u = data.users?.[0];
  if (!u) return null;
  return {
    uid: u.localId, name: u.displayName || u.email?.split("@")[0] || "Reader", photo: u.photoUrl || null,
    // Trusted server-side from the verified token — never take an email
    // address from the request body for anything that sends mail, or a
    // signed-in user could direct a verification code at any address.
    email: u.email || null,
  };
}
