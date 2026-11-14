import { logError } from "@/lib/cf/logger";

// "Surprise me": one random book that matches optional filters. Designed to stay cheap on a catalog that keeps growing:
//  * no filter that depends on readers (mood, my want-to-read) -> probe from a RANDOM ID. `WHERE id >= ?` on the primary
//    key is O(1) to start, and the first matching row is returned. (ORDER BY RANDOM() would sort the whole table.)
//  * mood / want-to-read -> first collect a small candidate list of slugs from the main database (bounded), then
//    choose among at most ~60 catalog rows.
// Short books first? No: length buckets are plain page-count ranges.

const LENGTH = { short: [1, 249], medium: [250, 450], long: [451, 100000] };
const MIN_RATING = 3.5; // a "great read" feel without needing a rating count column

const clean = (s) => String(s || "").trim().slice(0, 60);

/** Row -> the JSON the modal expects. `hook` is the first strong sentence we already store; nothing is generated. */
export function toSurprise(row) {
  let keyPoints = [];
  try { const k = JSON.parse(row.key_points || "[]"); if (Array.isArray(k)) keyPoints = k; } catch { /* malformed */ }
  const sentence = (row.description || "").split(/(?<=[.!?])\s/)[0] || "";
  const hook = (keyPoints[0] || sentence || "").slice(0, 160) || null;
  return {
    slug: row.slug,
    title: row.title,
    author: row.author || "",
    coverUrl: row.cover_url || null,
    rating: row.rating || null,
    pages: row.page_count || null,
    year: row.published ? Number(String(row.published).slice(0, 4)) || null : null,
    genre: row.category || null,
    hook,
    readingMinutes: row.page_count ? Math.max(5, Math.round(row.page_count * 1.2)) : null,
  };
}

function where({ lang, genre, length, exclude }, extra = []) {
  const parts = ["lang = ?"];
  const binds = [lang];
  if (genre) { parts.push("category = ?"); binds.push(genre); }
  const range = LENGTH[length];
  if (range) { parts.push("page_count BETWEEN ? AND ?"); binds.push(...range); }
  parts.push("(rating IS NULL OR rating >= ?)"); binds.push(MIN_RATING);
  if (exclude.length) { parts.push(`slug NOT IN (${exclude.map(() => "?").join(",")})`); binds.push(...exclude); }
  parts.push(...extra.map((e) => e.sql)); binds.push(...extra.flatMap((e) => e.binds));
  return { sql: parts.join(" AND "), binds };
}

/**
 * @param {{CATALOG_DB:any, DB:any}} env
 * @param {{ lang?:string, mood?:string, genre?:string, length?:string, source?:string, exclude?:string[], userId?:string|null }} q
 * @returns {Promise<object|null>} the book, null when nothing matches, or { needsSignIn: true }
 */
export async function pickSurprise(env, q) {
  const db = env.CATALOG_DB;
  if (!db) return null;
  const f = {
    lang: clean(q.lang) || "en",
    genre: clean(q.genre),
    length: LENGTH[q.length] ? q.length : "",
    exclude: (q.exclude || []).map(clean).filter(Boolean).slice(0, 30),
  };
  const mood = clean(q.mood);
  const cols = "slug, title, author, cover_url, rating, page_count, published, category, description, key_points";

  try {
    // Candidate lists come from the main DB (small, bounded).
    let candidates = null;
    if (q.source === "shelf") {
      if (!q.userId) return { needsSignIn: true };
      const { results } = await env.DB.prepare("SELECT book_slug FROM shelf WHERE user_id = ?1 AND status = 'want' LIMIT 200").bind(q.userId).all();
      candidates = results.map((r) => r.book_slug);
    }
    if (mood) {
      // Reader-tagged moods live in shelf.moods as a JSON array of names.
      const { results } = await env.DB.prepare("SELECT DISTINCT book_slug FROM shelf WHERE moods LIKE ?1 LIMIT 120").bind(`%"${mood.replace(/[%_"]/g, "")}"%`).all();
      const moodSlugs = new Set(results.map((r) => r.book_slug));
      candidates = candidates ? candidates.filter((s) => moodSlugs.has(s)) : [...moodSlugs];
    }

    if (candidates) {
      if (!candidates.length) return null;
      const pool = candidates.slice(0, 60);
      const w = where(f, [{ sql: `slug IN (${pool.map(() => "?").join(",")})`, binds: pool }]);
      const row = await db.prepare(`SELECT ${cols} FROM books WHERE ${w.sql} ORDER BY RANDOM() LIMIT 1`).bind(...w.binds).first();
      return row ? toSurprise(row) : null;
    }

    // No reader-dependent filter: random-id probe, wrapping once.
    const bounds = await db.prepare("SELECT MIN(id) AS lo, MAX(id) AS hi FROM books WHERE lang = ?1").bind(f.lang).first();
    if (!bounds || !bounds.hi) return null;
    const r = bounds.lo + Math.floor(Math.random() * (bounds.hi - bounds.lo + 1));
    const w = where(f);
    let row = await db.prepare(`SELECT ${cols} FROM books WHERE id >= ? AND ${w.sql} ORDER BY id LIMIT 1`).bind(r, ...w.binds).first();
    if (!row) row = await db.prepare(`SELECT ${cols} FROM books WHERE id < ? AND ${w.sql} ORDER BY id DESC LIMIT 1`).bind(r, ...w.binds).first();
    return row ? toSurprise(row) : null;
  } catch (e) {
    logError("pickSurprise", e);
    return null;
  }
}
