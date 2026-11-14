import { verifyUser } from "@/lib/auth-server";

// Verifying a Firebase ID token is a network call. A reader's session fires many requests
// (progress, shelves, stats), so a verified token is remembered in this isolate for 5 minutes
// instead of re-verifying each time. Memory-only: no KV/D1 writes, bounded size, safe to lose.
const TTL_MS = 5 * 60 * 1000;
const MAX = 500;
const seen = new Map();

async function tokenKey(token) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Authenticate an API request via `Authorization: Bearer <Firebase ID token>`.
 * Returns { uid, name, photo, email } or null. Never throws.
 */
export async function requireUser(request) {
  try {
    const m = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
    if (!m) return null;
    const key = await tokenKey(m[1]);
    const hit = seen.get(key);
    if (hit && hit.exp > Date.now()) return hit.user;
    const user = await verifyUser(m[1]);
    if (!user) { seen.delete(key); return null; }
    if (seen.size >= MAX) seen.delete(seen.keys().next().value);
    seen.set(key, { user, exp: Date.now() + TTL_MS });
    return user;
  } catch {
    return null;
  }
}

export const unauthorized = () => Response.json({ error: "unauthorized" }, { status: 401 });
