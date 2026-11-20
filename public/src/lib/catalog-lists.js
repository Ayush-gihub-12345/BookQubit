// Catalog queries that stay cheap at 100,000+ books. Every function here takes a D1-style `db` and reads through the
// indexes and read models (book_keys, catalog_facets, book_works, authors_fts), never a whole table; results are always
// bounded by LIMIT. They return null when the models they need are absent, so callers can use the older code path.
import { buildFtsQuery } from "./search";

// Deep OFFSETs read every skipped row. Beyond this page, visitors are better served by search and filters.
export const MAX_PAGE = 100;

const AUTHOR_ORDER = {
  "name-desc": "a.name COLLATE NOCASE DESC",
  recent: "a.id DESC",
  birth: "a.birth_year DESC, a.id",
  name: "a.name COLLATE NOCASE ASC",
};

/**
 * One page of authors who have at least one book. Index-backed filters: country (idx_authors_lang_country), name
 * search (authors_fts, from two characters), and the "has books" check (book_keys primary key prefix).
 * Reads about perPage+1 rows however large the table is.
 */
export async function pageAuthors(db, lang, { q, country, sort, page = 1, perPage = 60 } = {}) {
  const run = async (l) => {
    const where = ["a.lang = ?1", "EXISTS (SELECT 1 FROM book_keys k WHERE k.lang = a.lang AND k.kind = 'author' AND k.key = lower(trim(a.name)))"];
    const binds = [l];
    if (country) { binds.push(country); where.push(`a.country = ?${binds.length}`); }
    const term = String(q || "").trim();
    if (term.length >= 2) {
      const fts = buildFtsQuery(term);
      if (fts) { binds.push(fts); where.push(`a.id IN (SELECT rowid FROM authors_fts WHERE authors_fts MATCH ?${binds.length})`); }
    }
    const order = AUTHOR_ORDER[sort] || AUTHOR_ORDER.name;
    const limit = Math.min(Math.max(1, Number(perPage) || 60), 120);
    binds.push(limit + 1, (Math.min(MAX_PAGE, Math.max(1, Number(page))) - 1) * limit);
    const { results } = await db
      .prepare(`SELECT a.id, a.slug, a.name, a.country, a.birth_year, a.image_url, substr(a.bio, 1, 200) AS bio
                FROM authors a WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ?${binds.length - 1} OFFSET ?${binds.length}`)
      .bind(...binds).all();
    return { rows: results.slice(0, limit), hasMore: results.length > limit };
  };
  try {
    let r = await run(lang);
    if (!r.rows.length && Number(page) === 1 && lang !== "en") r = await run("en"); // same language fallback as the rest of the site
    return { authors: r.rows, hasMore: r.hasMore };
  } catch {
    return null;
  }
}

/** Author counts by country from the precomputed facets (a few dozen rows). */
export async function authorCountries(db, lang, limit = 14) {
  try {
    const run = async (l) => (await db
      .prepare("SELECT name, count FROM catalog_facets WHERE lang = ?1 AND kind = 'author_country' ORDER BY count DESC LIMIT ?2")
      .bind(l, limit).all()).results;
    let rows = await run(lang);
    if (!rows.length && lang !== "en") rows = await run("en");
    return rows.length ? rows : null;
  } catch {
    return null;
  }
}

/**
 * Books like this one, ranked by what they share: tags (weighted by how rare the tag is), the same author, the same
 * category. Reads at most CAND rows per tag from the book_keys index for the book's three rarest tags, then ranks in
 * memory, then fetches only the top `limit` rows. Returns [{ id, shared: ["tag", ...], sameAuthor, sameCategory }].
 */
export async function similarBooks(db, lang, book, { limit = 12, perTag = 300 } = {}) {
  try {
    let tags = [];
    try { tags = JSON.parse(book.tags || "[]"); } catch { tags = []; }
    tags = [...new Set(tags.filter((t) => typeof t === "string").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 12);
    const score = new Map(); // id -> { s, shared: [] }
    const bump = (id, w, why, flag) => { const e = score.get(id) || { s: 0, shared: [] }; e.s += w; if (why) e.shared.push(why); if (flag) e[flag] = true; score.set(id, e); };

    if (tags.length) {
      // rarest tags carry the most information and cost the fewest rows
      const counts = (await db.prepare(`SELECT name, count FROM catalog_facets WHERE lang = ?1 AND kind = 'tag' AND lower(name) IN (${tags.map((_, i) => `?${i + 2}`).join(",")})`)
        .bind(lang, ...tags).all()).results;
      const by = new Map(counts.map((r) => [String(r.name).toLowerCase(), r.count]));
      const picked = [...tags].sort((a, b) => (by.get(a) ?? 1e9) - (by.get(b) ?? 1e9)).slice(0, 3);
      for (const t of picked) {
        const w = 1 + 1 / Math.log2(2 + (by.get(t) || 1));
        const { results } = await db.prepare("SELECT book_id FROM book_keys WHERE lang = ?1 AND kind = 'tag' AND key = ?2 LIMIT ?3").bind(lang, t, perTag).all();
        for (const r of results) if (r.book_id !== book.id) bump(r.book_id, w, t);
      }
    }
    const first = String(book.author || "").split(",")[0].trim().toLowerCase();
    if (first) {
      const { results } = await db.prepare("SELECT book_id FROM book_keys WHERE lang = ?1 AND kind = 'author' AND key = ?2 LIMIT 60").bind(lang, first).all();
      for (const r of results) if (r.book_id !== book.id) bump(r.book_id, 2, null, "author");
    }
    if (book.category) {
      const { results } = await db.prepare("SELECT id FROM books WHERE lang = ?1 AND category = ?2 AND id != ?3 ORDER BY rating DESC LIMIT 40").bind(lang, book.category, book.id).all();
      for (const r of results) bump(r.id, 0.6, null, "category");
    }
    const top = [...score.entries()].sort((a, b) => b[1].s - a[1].s).slice(0, limit);
    return top.map(([id, e]) => ({ id, shared: [...new Set(e.shared)], sameAuthor: !!e.author, sameCategory: !!e.category, score: e.s }));
  } catch {
    return null;
  }
}

/** Other editions of the same work (same language, same normalised title and first author), excluding the book itself. */
export async function otherEditions(db, lang, bookId, limit = 12) {
  try {
    const own = await db.prepare("SELECT work_key FROM book_works WHERE book_id = ?1 AND lang = ?2").bind(bookId, lang).first();
    if (!own) return [];
    const { results } = await db
      .prepare(`SELECT b.id, b.slug, b.title, b.author, b.publisher, b.published, b.format, b.page_count, b.isbn, b.cover_url
                FROM book_works w JOIN books b ON b.id = w.book_id
                WHERE w.lang = ?1 AND w.work_key = ?2 AND w.book_id != ?3 ORDER BY b.published, b.id LIMIT ?4`)
      .bind(lang, own.work_key, bookId, limit).all();
    return results;
  } catch {
    return [];
  }
}

/** The series a book belongs to, with its neighbours: { series, position, total, prev, next } or null. */
export async function seriesOf(db, lang, bookId) {
  try {
    const link = await db
      .prepare(`SELECT s.id, s.slug, s.name, bs.position FROM book_series bs JOIN series s ON s.id = bs.series_id WHERE bs.book_id = ?1 LIMIT 1`)
      .bind(bookId).first();
    if (!link) return null;
    const { results } = await db
      .prepare(`SELECT b.id, b.slug, b.title, b.cover_url, bs.position FROM book_series bs JOIN books b ON b.id = bs.book_id
                WHERE bs.series_id = ?1 ORDER BY bs.position, b.id LIMIT 200`)
      .bind(link.id).all();
    const i = results.findIndex((r) => r.id === bookId);
    return {
      series: { id: link.id, slug: link.slug, name: link.name }, position: link.position, total: results.length,
      prev: i > 0 ? results[i - 1] : null, next: i >= 0 && i < results.length - 1 ? results[i + 1] : null, books: results,
    };
  } catch {
    return null;
  }
}
