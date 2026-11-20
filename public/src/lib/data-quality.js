// Catalog data-quality report for admins. One pass over `books` collects every per-book metric together (about N rows
// read once, not once per metric), plus a few bounded aggregates over authors and the edition table. It is run on demand
// from Admin -> Data quality and the result is cached for a day, so it costs one scan per run, never per visit.
const ISBN13 = "97[89][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]";

export async function computeQuality(db, lang = "en") {
  const one = (sql, ...a) => db.prepare(sql).bind(...a).first();
  const list = async (sql, ...a) => (await db.prepare(sql).bind(...a).all()).results;
  const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback; } };

  const m = await one(
    `SELECT COUNT(*) AS books,
            SUM(CASE WHEN cover_url IS NULL OR trim(cover_url) = '' THEN 1 ELSE 0 END) AS no_cover,
            SUM(CASE WHEN description IS NULL OR length(trim(description)) < 40 THEN 1 ELSE 0 END) AS thin_description,
            SUM(CASE WHEN author IS NULL OR trim(author) = '' THEN 1 ELSE 0 END) AS no_author,
            SUM(CASE WHEN publisher IS NULL OR trim(publisher) = '' THEN 1 ELSE 0 END) AS no_publisher,
            SUM(CASE WHEN category IS NULL OR trim(category) = '' THEN 1 ELSE 0 END) AS no_category,
            SUM(CASE WHEN page_count IS NULL OR page_count <= 0 THEN 1 ELSE 0 END) AS no_pages,
            SUM(CASE WHEN isbn IS NOT NULL AND trim(isbn) != '' AND replace(isbn, '-', '') NOT GLOB '${ISBN13}' THEN 1 ELSE 0 END) AS bad_isbn,
            SUM(CASE WHEN tags IS NULL OR tags IN ('', '[]') THEN 1 ELSE 0 END) AS no_tags
     FROM books WHERE lang = ?1`, lang);

  const dupWorks = await safe(() => one("SELECT COUNT(*) AS n FROM (SELECT 1 FROM book_works WHERE lang = ?1 GROUP BY work_key HAVING COUNT(*) > 1)", lang), null);
  const orphanAuthors = await safe(() => one(
    `SELECT COUNT(*) AS n FROM authors a WHERE a.lang = ?1 AND NOT EXISTS
       (SELECT 1 FROM book_keys k WHERE k.lang = a.lang AND k.kind = 'author' AND k.key = lower(trim(a.name)))`, lang), null);
  const noPhoto = await safe(() => one("SELECT COUNT(*) AS n FROM authors WHERE lang = ?1 AND (image_url IS NULL OR trim(image_url) = '')", lang), null);

  // A few concrete rows to fix, each a bounded LIMIT query.
  const samples = {
    no_cover: await safe(() => list("SELECT id, slug, title FROM books WHERE lang = ?1 AND (cover_url IS NULL OR trim(cover_url) = '') LIMIT 8", lang), []),
    thin_description: await safe(() => list("SELECT id, slug, title FROM books WHERE lang = ?1 AND (description IS NULL OR length(trim(description)) < 40) LIMIT 8", lang), []),
    bad_isbn: await safe(() => list(`SELECT id, slug, title, isbn FROM books WHERE lang = ?1 AND isbn IS NOT NULL AND trim(isbn) != '' AND replace(isbn, '-', '') NOT GLOB '${ISBN13}' LIMIT 8`, lang), []),
    duplicates: await safe(() => list(
      `SELECT w.work_key, COUNT(*) AS n, MIN(b.id) AS id, MIN(b.slug) AS slug, MIN(b.title) AS title FROM book_works w JOIN books b ON b.id = w.book_id
       WHERE w.lang = ?1 GROUP BY w.work_key HAVING COUNT(*) > 1 ORDER BY n DESC LIMIT 8`, lang), []),
  };

  const total = Number(m?.books || 0);
  const n = (v) => Number(v || 0);
  const checks = [
    ["no_cover", "Books without a cover", n(m?.no_cover)],
    ["thin_description", "Books with no or a very short description", n(m?.thin_description)],
    ["bad_isbn", "Books whose ISBN is not a valid ISBN-13", n(m?.bad_isbn)],
    ["no_author", "Books without an author", n(m?.no_author)],
    ["no_publisher", "Books without a publisher", n(m?.no_publisher)],
    ["no_category", "Books without a category", n(m?.no_category)],
    ["no_tags", "Books without tags", n(m?.no_tags)],
    ["no_pages", "Books without a page count", n(m?.no_pages)],
    ["duplicates", "Works with more than one edition", dupWorks ? n(dupWorks.n) : null],
    ["orphan_authors", "Authors with no book", orphanAuthors ? n(orphanAuthors.n) : null],
    ["no_photo", "Authors without a photo", noPhoto ? n(noPhoto.n) : null],
  ].map(([key, label, count]) => ({ key, label, count, pct: total && count != null ? Math.round((count / total) * 1000) / 10 : null }));

  // A 0-100 score: the share of books that pass the five checks that affect a visitor most (cover, description, author, category, ISBN).
  const bad = n(m?.no_cover) + n(m?.thin_description) + n(m?.no_author) + n(m?.no_category) + n(m?.bad_isbn);
  const score = total ? Math.max(0, Math.round(100 - (bad / (total * 5)) * 100)) : null;
  return { computedAt: new Date().toISOString(), lang, books: total, score, checks, samples };
}
