import { cookies } from "next/headers";

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

export async function isAdminAuthenticated() {
  const expected = await expectedToken();
  if (!expected) return false;
  const store = await cookies();
  return store.get(COOKIE)?.value === expected;
}

export async function setAdminSession() {
  const token = await expectedToken();
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 12 });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}
