import { kvGetJson, kvPutJson, summaryKey, rateLimit } from "@/lib/cf/cache";
import { generateSummary, INTENTS } from "@/lib/cf/ai";
import { enqueue, JOBS } from "@/lib/cf/queue";
import { logEvent, logError } from "@/lib/cf/logger";
import { splitSentences } from "@/lib/text";

export const INTENT_IDS = Object.keys(INTENTS); // general, founder, tech, student, action

/**
 * Deterministic 1-minute summary built ONLY from data we already store (no AI, no
 * network). Guarantees every book page has a playable summary, and is the fallback
 * whenever Workers AI / KV / D1 summaries are unavailable.
 */
export function baselineSummary(book) {
  const source = splitSentences(book.summary || book.description || "");
  const thesis = source[0] || [book.title, book.author && `by ${book.author}`].filter(Boolean).join(" ");
  const keyPoints = Array.isArray(book.keyPoints) ? book.keyPoints.filter(Boolean) : [];
  const takeaways = (keyPoints.length ? keyPoints : source.slice(1, 4)).slice(0, 5);
  const script = [
    [book.title, book.author && `by ${book.author}`].filter(Boolean).join(" ") + ".",
    thesis,
    takeaways.length ? "Key takeaways." : "",
    ...takeaways.map((t, i) => `${i + 1}. ${t.replace(/[.!?]+$/, "")}.`),
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 1100);
  return { thesis, takeaways, quotes: [], script };
}

async function readStored(env, book, lang, intent) {
  const kv = await kvGetJson(env, summaryKey(book.id, lang, intent));
  if (kv) return { ...kv, source: "cache" };
  if (!env.CATALOG_DB) return null;
  try {
    const row = await env.CATALOG_DB.prepare(
      "SELECT summary_json, audio_key FROM book_summaries WHERE book_slug = ? AND lang = ? AND intent = ?"
    ).bind(book.slug, lang, intent).first();
    if (!row) return null;
    const payload = { ...JSON.parse(row.summary_json), audioKey: row.audio_key || null };
    await kvPutJson(env, summaryKey(book.id, lang, intent), payload);
    return { ...payload, source: "d1" };
  } catch (e) {
    // Table missing (migration not applied yet) or bad JSON — behave as a miss.
    logError("readStored", e, { slug: book.slug });
    return null;
  }
}

/**
 * Resolve a summary for (book, lang, intent): KV → D1 → (general) baseline + background
 * enrichment, or (other intents) rate-limited Workers AI generation.
 * @returns {Promise<{ summary: object, source: string, audioUrl: string|null, unavailable?: string }>}
 */
export async function resolveSummary(env, book, lang, intent, { clientId = "anon" } = {}) {
  if (!INTENTS[intent]) intent = "general";
  const audioUrl = (s) => (s && s.audioKey ? `/api/audio/${s.audioKey.replace(/^audio\//, "").split("/").map(encodeURIComponent).join("/")}` : null);

  const stored = await readStored(env, book, lang, intent);
  if (stored) {
    logEvent("ai_cache", { result: "hit", intent, lang });
    return { summary: stored, source: stored.source, audioUrl: audioUrl(stored) };
  }
  logEvent("ai_cache", { result: "miss", intent, lang });

  if (intent === "general") {
    // Serve the baseline now; ask the queue (once per hour) to produce the AI version + audio.
    const flag = `enq:${book.id}:${lang}:${intent}`;
    if (!(await kvGetJson(env, flag))) {
      const r = await enqueue(env, JOBS.SUMMARY, { slug: book.slug, lang, intent, withAudio: true });
      // Also (re)index this book for semantic search — organic backfill as books get viewed.
      await enqueue(env, JOBS.EMBED_BOOK, { slug: book.slug, lang });
      if (r.queued) await kvPutJson(env, flag, 1, 3600);
    }
    return { summary: baselineSummary(book), source: "baseline", audioUrl: null };
  }

  // Non-general angles need generation; protect the AI budget.
  const rl = await rateLimit(env, `sum:${clientId}`, { limit: 20, windowSeconds: 3600 });
  if (!rl.allowed) return { summary: baselineSummary(book), source: "baseline", audioUrl: null, unavailable: "rate_limited" };

  const generated = await generateSummary(env, { ...book, lang }, intent);
  if (!generated) return { summary: baselineSummary(book), source: "baseline", audioUrl: null, unavailable: "ai_unavailable" };

  if (env.CATALOG_DB) {
    try {
      await env.CATALOG_DB.prepare(
        `INSERT INTO book_summaries (book_slug, lang, intent, summary_json, source) VALUES (?, ?, ?, ?, 'ai')
         ON CONFLICT(book_slug, lang, intent) DO UPDATE SET summary_json = excluded.summary_json`
      ).bind(book.slug, lang, intent, JSON.stringify(generated)).run();
    } catch (e) {
      logError("saveSummary", e, { slug: book.slug });
    }
  }
  await kvPutJson(env, summaryKey(book.id, lang, intent), generated);
  return { summary: generated, source: "ai", audioUrl: null };
}

/** Does a stored audio file exist for this book's general summary? (single indexed lookup) */
export async function storedAudioKey(env, slug, lang) {
  if (!env.CATALOG_DB) return null;
  try {
    const row = await env.CATALOG_DB.prepare(
      "SELECT audio_key FROM book_summaries WHERE book_slug = ? AND lang = ? AND intent = 'general'"
    ).bind(slug, lang).first();
    return row?.audio_key || null;
  } catch {
    return null;
  }
}
