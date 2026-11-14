import { cookies, headers } from "next/headers";

const COOKIE = "bq_admin";

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Session token = hash of the real credentials; a request is authenticated
// only if its cookie matches a hash computed from the current env vars, so
// rotating ADMIN_PASSWORD instantly invalidates old sessions.
async function expectedToken() {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return null;
  return sha256(`${user}:${pass}:bookqubit-admin`);
}

export async function verifyAdminCredentials(username, password) {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;
  return username === user && password === pass;
}

// Cross-site request check, applied inside the auth check itself so that
// every admin route that already calls isAdminAuthenticated() (14 of them)
// gets it without being edited.
//
// Browsers attach an `Origin` header to cross-origin requests and to every
// same-origin non-GET one; they omit it on plain same-origin GETs and on
// top-level navigations. So the rule is simply: if an Origin is present, it
// must be this site. A forged form post from another origin carries its own
// Origin and is refused even if the browser were to send the cookie — this
// is the second layer behind SameSite=Strict, for browsers or setups where
// SameSite is not enforced the way we expect. An absent Origin is allowed
// (that's every ordinary navigation and same-origin read).
async function originIsOurs() {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return true;
  const host = h.get("x-forwarded-host") || h.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false; // unparseable Origin (including the literal "null") — refuse
  }
}

export async function isAdminAuthenticated() {
  const expected = await expectedToken();
  if (!expected) return false;
  if (!(await originIsOurs())) return false;
  const store = await cookies();
  return store.get(COOKIE)?.value === expected;
}

export async function setAdminSession() {
  const token = await expectedToken();
  const store = await cookies();
  // Strict, not Lax: Lax still sends the cookie on cross-site top-level
  // navigations. The one trade-off is that following a link to /admin from
  // another site (an email, a chat message) arrives signed-out; typing the
  // URL or using a bookmark is unaffected.
  store.set(COOKIE, token, { httpOnly: true, sameSite: "strict", secure: true, path: "/", maxAge: 60 * 60 * 12 });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
