import { optional } from "./env.js";
import { logError } from "./logger.js";

// KV is used ONLY for AI summary variants and rate limits (see ARCHITECTURE_PLAN.md §2.4).
// Every call is a miss/allow on failure — a KV outage must never break a page.

export const summaryKey = (bookId, lang, intent) => `summary:${bookId}:${lang}:${intent}`;

export async function kvGetJson(env, key) {
  const kv = optional(env, "CACHE_KV");
  if (!kv) return null;
  try {
    return await kv.get(key, "json");
  } catch (e) {
    logError("kvGetJson", e, { key });
    return null;
  }
}

export async function kvPutJson(env, key, value, ttlSeconds = 60 * 60 * 24 * 30) {
  const kv = optional(env, "CACHE_KV");
  if (!kv) return false;
  try {
    // KV requires expirationTtl >= 60.
    await kv.put(key, JSON.stringify(value), { expirationTtl: Math.max(60, ttlSeconds) });
    return true;
  } catch (e) {
    logError("kvPutJson", e, { key });
    return false;
  }
}

/**
 * Fixed-window rate limit. Approximate by design (KV is eventually consistent).
 * Fails OPEN when KV is unavailable.
 * @returns {Promise<{ allowed: boolean, remaining: number }>}
 */
export async function rateLimit(env, id, { limit = 20, windowSeconds = 3600 } = {}) {
  const kv = optional(env, "CACHE_KV");
  if (!kv) return { allowed: true, remaining: limit };
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${id}:${bucket}`;
  try {
    const used = parseInt((await kv.get(key)) || "0", 10);
    if (used >= limit) return { allowed: false, remaining: 0 };
    await kv.put(key, String(used + 1), { expirationTtl: Math.max(60, windowSeconds * 2) });
    return { allowed: true, remaining: limit - used - 1 };
  } catch (e) {
    logError("rateLimit", e, { id });
    return { allowed: true, remaining: limit };
  }
}
