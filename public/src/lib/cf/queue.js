import { optional } from "./env.js";
import { logError } from "./logger.js";

// Job types handled by consumer.js
export const JOBS = {
  EMBED_BOOK: "embed_book",
  SUMMARY: "generate_1min_summary",
  IMPORT_GOODREADS: "import_goodreads_csv",
  RECOMPUTE_TASTE: "recompute_user_taste",
};

/**
 * Enqueue a background job. Returns { queued:false } when the queue binding is
 * absent so callers can run a cheap inline fallback (or skip) — never throws.
 */
export async function enqueue(env, type, payload = {}) {
  const q = optional(env, "JOBS_QUEUE");
  if (!q) return { queued: false };
  try {
    await q.send({ type, ...payload });
    return { queued: true };
  } catch (e) {
    logError("enqueue", e, { type });
    return { queued: false };
  }
}
