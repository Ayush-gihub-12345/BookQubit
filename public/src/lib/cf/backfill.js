import { MODELS } from "./ai.js";
import { logEvent, logError } from "./logger.js";

const CURSOR_KEY = "embed:cursor";

/**
 * Bounded semantic-index backfill, run by the scheduled handler. Each run embeds the next
 * `batch` books (by id, resuming from a KV cursor) in ONE batched Workers AI call and upserts
 * them into Vectorize in ONE call. Cost is capped by `batch` x run frequency, so the catalog
 * can grow to hundreds of thousands of books without a cost spike; new books get picked up
 * because their ids are higher than the cursor. No-op when AI / Vectorize / KV / catalog are absent.
 * @returns {Promise<{ processed: number, cursor: number, done: boolean }>}
 */
export async function runEmbedBackfill(env, { batch = 40 } = {}) {
  if (!env.AI || !env.BOOK_VECTORS || !env.CATALOG_DB || !env.CACHE_KV) return { processed: 0, cursor: 0, done: true, skipped: true };
  try {
    const cursor = parseInt((await env.CACHE_KV.get(CURSOR_KEY)) || "0", 10) || 0;
    const { results } = await env.CATALOG_DB.prepare(
      `SELECT id, slug, lang, title, author, description, summary, tags FROM books
       WHERE id > ?1 ORDER BY id LIMIT ?2`
    ).bind(cursor, batch).all();
    if (!results.length) return { processed: 0, cursor, done: true };

    const texts = results.map((b) =>
      [b.title, b.author, b.description, (b.summary || "").slice(0, 600), b.tags].filter(Boolean).join(". ").slice(0, 1800)
    );
    const out = await env.AI.run(MODELS.embed, { text: texts });
    const vectors = out?.data || [];
    const items = results
      .map((b, i) => (vectors[i] ? { id: `book:${b.slug}:${b.lang}`, values: vectors[i], metadata: { type: "book", slug: b.slug, lang: b.lang } } : null))
      .filter(Boolean);
    if (items.length) await env.BOOK_VECTORS.upsert(items);

    // Only advance past what was actually embedded, so a partial AI response is retried next run.
    const lastOk = items.length === results.length ? results[results.length - 1].id : cursor;
    await env.CACHE_KV.put(CURSOR_KEY, String(lastOk));
    logEvent("job", { type: "embed_backfill", processed: items.length, cursor: lastOk });
    return { processed: items.length, cursor: lastOk, done: false };
  } catch (e) {
    logError("embedBackfill", e);
    return { processed: 0, cursor: 0, done: false, error: true };
  }
}
