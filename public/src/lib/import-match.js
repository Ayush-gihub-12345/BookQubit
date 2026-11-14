import { buildFtsQuery } from "@/lib/search";
import { normalizeTitle } from "@/lib/library";
import { logError } from "@/lib/cf/logger";

const tokens = (s) => new Set(String(s || "").toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter((t) => t.length > 2));

/**
 * Match parsed Goodreads rows to catalog books.
 *  1. ONE query for every row that has an ISBN (indexed: idx_books_isbn).
 *  2. Remaining rows: FTS5 title lookup, accepted only when the normalised title is equal AND
 *     the author shares a name token (or the row has no author) — wrong matches are worse than none.
 * Returns an array parallel to `rows`: slug string, or null when unmatched.
 * Query count is bounded: 1 + (#rows without an ISBN match), so callers send small chunks.
 */
export async function matchRows(env, rows) {
  const db = env.CATALOG_DB;
  const out = rows.map(() => null);
  if (!db) return out;

  const isbns = [...new Set(rows.map((r) => r.isbn).filter(Boolean))];
  if (isbns.length) {
    try {
      const { results } = await db.prepare(
        `SELECT isbn, slug FROM books WHERE isbn IN (${isbns.map(() => "?").join(",")}) AND lang = 'en'`
      ).bind(...isbns).all();
      const byIsbn = new Map(results.map((r) => [String(r.isbn).replace(/[^0-9X]/gi, "").toUpperCase(), r.slug]));
      rows.forEach((r, i) => { if (r.isbn && byIsbn.has(r.isbn)) out[i] = byIsbn.get(r.isbn); });
    } catch (e) { logError("matchRows.isbn", e); }
  }

  for (let i = 0; i < rows.length; i++) {
    if (out[i]) continue;
    const want = normalizeTitle(rows[i].title);
    const match = buildFtsQuery(want);
    if (!match) continue;
    try {
      const { results } = await db.prepare(
        `SELECT b.slug, b.title, b.author FROM books_fts f JOIN books b ON b.id = f.rowid
         WHERE books_fts MATCH ?1 AND b.lang = 'en' ORDER BY bm25(books_fts, 8.0, 4.0, 1.0, 1.0, 2.0) LIMIT 5`
      ).bind(`title : (${match})`).all();
      const authorTokens = tokens(rows[i].author);
      const hit = results.find((c) => {
        if (normalizeTitle(c.title) !== want) return false;
        if (!authorTokens.size) return true;
        for (const t of tokens(c.author)) if (authorTokens.has(t)) return true;
        return false;
      });
      if (hit) out[i] = hit.slug;
    } catch (e) { logError("matchRows.title", e); }
  }
  return out;
}
