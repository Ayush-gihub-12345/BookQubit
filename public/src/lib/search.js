import { semanticSearch, rrf } from "@/lib/cf/vectorize";
import { logError } from "@/lib/cf/logger";

/**
 * Turn free text into a safe FTS5 MATCH expression: every term quoted (so operators and
 * punctuation in user input can't change the query), last term as a prefix for
 * search-as-you-type. Returns "" when nothing searchable is left.
 */
export function buildFtsQuery(input, { maxTerms = 8, mode = "and" } = {}) {
  const terms = String(input || "")
    .normalize("NFKC")
    // \p{M} keeps combining marks (Devanagari/Tamil/Arabic vowel signs) inside words;
    // splitting on them would shred every Indic-language query into single letters.
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((t) => t.length > 0)
    .slice(0, maxTerms);
  if (!terms.length) return "";
  return terms
    .map((t, i) => `"${t.replace(/"/g, '""')}"${i === terms.length - 1 ? "*" : ""}`)
    .join(mode === "or" ? " OR " : " ");
}

/** Keyword search over books_fts (bm25-ranked). Returns [] if the table isn't migrated. */
export async function keywordBooks(env, q, lang, limit = 20) {
  if (!env.CATALOG_DB || !buildFtsQuery(q)) return { slugs: [], ok: false };
  const run = (match) =>
    env.CATALOG_DB.prepare(
      `SELECT b.slug FROM books_fts f JOIN books b ON b.id = f.rowid
       WHERE books_fts MATCH ?1 AND b.lang = ?2
       ORDER BY bm25(books_fts, 8.0, 4.0, 1.0, 1.0, 2.0) LIMIT ?3`
    ).bind(match, lang, limit).all();
  try {
    let { results } = await run(buildFtsQuery(q));
    // Natural-language queries ("how to build habits") rarely have every word in one book:
    // if the strict AND query finds nothing, retry matching ANY term (bm25 still ranks it).
    if (!results.length && buildFtsQuery(q).includes('" "')) ({ results } = await run(buildFtsQuery(q, { mode: "or" })));
    return { slugs: results.map((r) => r.slug), ok: true };
  } catch (e) {
    logError("keywordBooks", e); // typically: books_fts not created yet
    return { slugs: [], ok: false };
  }
}

/** Author name search over authors_fts. Returns [] when the table isn't migrated. */
export async function keywordAuthors(env, q, lang, limit = 4) {
  const match = buildFtsQuery(q);
  if (!match || !env.CATALOG_DB) return [];
  try {
    const { results } = await env.CATALOG_DB.prepare(
      `SELECT a.slug, a.name, a.image_url FROM authors_fts f JOIN authors a ON a.id = f.rowid
       WHERE authors_fts MATCH ?1 AND a.lang = ?2 ORDER BY bm25(authors_fts) LIMIT ?3`
    ).bind(match, lang, limit).all();
    return results;
  } catch (e) {
    logError("keywordAuthors", e);
    return [];
  }
}

/** Keyword search over reader quotes (main DB). */
export async function keywordQuotes(env, q, limit = 5) {
  const match = buildFtsQuery(q);
  if (!match || !env.DB) return [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT qt.id, qt.text, qt.book_slug FROM quotes_fts f JOIN quotes qt ON qt.id = f.rowid
       WHERE quotes_fts MATCH ?1 ORDER BY bm25(quotes_fts) LIMIT ?2`
    ).bind(match, limit).all();
    return results;
  } catch (e) {
    logError("keywordQuotes", e);
    return [];
  }
}

/**
 * Hybrid book search: FTS5 keyword + Vectorize semantic, fused with Reciprocal Rank Fusion.
 * Semantic results are optional (no AI/Vectorize → keyword only).
 * @returns {Promise<{ slugs: string[], keywordOk: boolean, semantic: number }>}
 */
export async function hybridBookSlugs(env, q, lang, limit = 12) {
  const [kw, sem] = await Promise.all([
    keywordBooks(env, q, lang, 20),
    q.trim().length >= 3 ? semanticSearch(env, q, { topK: 20, type: "book" }) : Promise.resolve([]),
  ]);
  const semSlugs = sem
    .filter((m) => !m.metadata?.lang || m.metadata.lang === lang)
    .map((m) => m.metadata?.slug)
    .filter(Boolean);
  const fused = rrf([kw.slugs, semSlugs]).slice(0, limit);
  return { slugs: fused, keywordOk: kw.ok, semantic: semSlugs.length };
}
