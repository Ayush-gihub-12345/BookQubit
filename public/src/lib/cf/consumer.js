import { JOBS } from "./queue.js";
import { embedText, generateSummary, synthesizeSpeech } from "./ai.js";
import { upsertVector } from "./vectorize.js";
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

const HANDLERS = {
  [JOBS.EMBED_BOOK]: embedBook,
  [JOBS.SUMMARY]: summarize,
  // Implemented with their API/UI in Phases 5 and 7; acked (not retried) until then.
  [JOBS.IMPORT_GOODREADS]: async () => logEvent("job", { type: JOBS.IMPORT_GOODREADS, status: "not_implemented" }),
  [JOBS.RECOMPUTE_TASTE]: async () => logEvent("job", { type: JOBS.RECOMPUTE_TASTE, status: "not_implemented" }),
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
