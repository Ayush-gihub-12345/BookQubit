import { JOBS } from "./queue.js";
import { embedText, generateSummary, synthesizeSpeech } from "./ai.js";
import { upsertVector, averageVectors } from "./vectorize.js";
import { kvPutJson, summaryKey } from "./cache.js";
import { logEvent, logError } from "./logger.js";

async function loadBook(env, slug, lang) {
  if (!env.CATALOG_DB) return null;
  return env.CATALOG_DB.prepare("SELECT * FROM books WHERE slug = ? AND lang = ?").bind(slug, lang).first();
}

async function embedBook(env, { slug, lang = "en" }) {
  const book = await loadBook(env, slug, lang);
  if (!book) return;
  const text = [book.title, book.author, book.description, book.summary, book.tags].filter(Boolean).join(". ");
  const v = await embedText(env, text);
  if (v) await upsertVector(env, `book:${slug}:${lang}`, v, { type: "book", slug, lang });
}

async function summarize(env, { slug, lang = "en", intent = "general", withAudio = false }) {
  const book = await loadBook(env, slug, lang);
  if (!book) return;
  const summary = await generateSummary(env, book, intent);
  if (!summary) return;
  let audioKey = null;
  if (withAudio && env.MEDIA_BUCKET && lang === "en") {
    const mp3 = await synthesizeSpeech(env, summary.script);
    if (mp3) {
      audioKey = `audio/summary/${slug}/${lang}/${intent}.mp3`;
      await env.MEDIA_BUCKET.put(audioKey, mp3, { httpMetadata: { contentType: "audio/mpeg" } });
    }
  }
  const payload = { ...summary, audioKey };
  if (env.CATALOG_DB) {
    await env.CATALOG_DB.prepare(
      `INSERT INTO book_summaries (book_slug, lang, intent, summary_json, audio_key, source)
       VALUES (?, ?, ?, ?, ?, 'ai')
       ON CONFLICT(book_slug, lang, intent) DO UPDATE SET summary_json = excluded.summary_json, audio_key = excluded.audio_key`
    ).bind(slug, lang, intent, JSON.stringify(summary), audioKey).run();
  }
  await kvPutJson(env, summaryKey(book.id, lang, intent), payload);
}

// Reader taste = mean of the vectors of books they finished and liked (rating >= 4 or unrated).
// Opted-out / hidden readers get their vector REMOVED, so they can never be matched.
async function recomputeTaste(env, { uid }) {
  if (!uid || !env.DB || !env.BOOK_VECTORS) return;
  const priv = await env.DB.prepare("SELECT hide_activity, discoverable FROM user_privacy WHERE user_id = ?").bind(uid).first().catch(() => null);
  if (priv && (priv.hide_activity || !priv.discoverable)) { await env.BOOK_VECTORS.deleteByIds([`user:${uid}`]); return; }
  const { results } = await env.DB.prepare(
    "SELECT book_slug FROM shelf WHERE user_id = ? AND status = 'read' AND (rating IS NULL OR rating >= 4) ORDER BY updated_at DESC LIMIT 30"
  ).bind(uid).all();
  if (!results.length) return;
  const found = await env.BOOK_VECTORS.getByIds(results.map((r) => `book:${r.book_slug}:en`));
  const taste = averageVectors((found || []).map((v) => v.values));
  if (!taste) return;
  await upsertVector(env, `user:${uid}`, taste, { type: "user", uid });
  await env.DB.prepare(
    "INSERT INTO user_taste (user_id, books_count) VALUES (?1, ?2) ON CONFLICT(user_id) DO UPDATE SET books_count = ?2, updated_at = CURRENT_TIMESTAMP"
  ).bind(uid, results.length).run().catch(() => {});
}

const HANDLERS = {
  [JOBS.EMBED_BOOK]: embedBook,
  [JOBS.SUMMARY]: summarize,
  // Implemented with their API/UI in Phases 5 and 7; acked (not retried) until then.
  [JOBS.IMPORT_GOODREADS]: async () => logEvent("job", { type: JOBS.IMPORT_GOODREADS, status: "not_implemented" }),
  [JOBS.RECOMPUTE_TASTE]: recomputeTaste,
};

/** Queue consumer entry — wired as `queue()` in worker-entry.js. */
export async function handleQueue(batch, env) {
  for (const msg of batch.messages) {
    const { type, ...payload } = msg.body || {};
    const handler = HANDLERS[type];
    if (!handler) {
      logEvent("job", { type, status: "unknown" });
      msg.ack();
      continue;
    }
    try {
      await handler(env, payload);
      logEvent("job", { type, status: "ok" });
      msg.ack();
    } catch (e) {
      logError("queue", e, { type });
      msg.retry();
    }
  }
}
