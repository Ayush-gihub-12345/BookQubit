// SQL that (re)builds the catalog read models (see migrations/catalog/0002 and 0003 and docs/adr/0001, 0002).
// Plain strings only, so the Worker, the admin route, the tests and scripts/rebuild-read-models.mjs all run the same
// statements.
//
// Two ways to run it:
//   REBUILD_STATEMENTS   everything in one atomic batch: fine up to a few tens of thousands of books.
//   rebuildPlan(maxId)   the same work split into id-range chunks of ~5,000 books, so no single statement or transaction
//                        is large (D1 limits how long one query may run). Between the first and last step the models are
//                        marked "not ready" (their meta row is deleted), so the site keeps using the live queries and
//                        never reads a half-built model.

// A JSON array built from a comma-separated list ("Ken Follett, John Lee"). Quotes, backslashes and control
// characters are stripped first so the result is always valid JSON; json_valid() guards the rest.
const AUTHOR_JSON = `'["' || replace(replace(replace(replace(replace(replace(b.author, char(92), ''), '"', ''), char(10), ' '), char(13), ' '), char(9), ' '), ',', '","') || '"]'`;
const authorArray = `CASE WHEN json_valid(${AUTHOR_JSON}) THEN ${AUTHOR_JSON} ELSE '[]' END`;
const tagArray = `CASE WHEN b.tags IS NOT NULL AND json_valid(b.tags) THEN b.tags ELSE '[]' END`;

const CLEAR = [
  "DELETE FROM read_model_meta WHERE name = 'catalog'", // first: readers stop trusting the models while they are rebuilt
  "DELETE FROM book_keys",
  "DELETE FROM catalog_facets",
  "DELETE FROM book_works",
];

/** Per-book lookups for books with id in (lo, hi]; with no range, for every book. Ids are integers, inlined safely. */
export function keyInserts(lo = null, hi = null) {
  const r = lo == null ? "" : ` AND b.id > ${Number(lo) | 0} AND b.id <= ${Number(hi) | 0}`;
  const rAnd = lo == null ? "" : ` AND id > ${Number(lo) | 0} AND id <= ${Number(hi) | 0}`;
  return [
    `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
     SELECT b.lang, 'tag', lower(trim(j.value)), b.id FROM books b, json_each(${tagArray}) j
     WHERE j.type = 'text' AND trim(j.value) != ''${r}`,
    `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
     SELECT b.lang, 'author', lower(trim(j.value)), b.id FROM books b, json_each(${authorArray}) j
     WHERE b.author IS NOT NULL AND trim(j.value) != ''${r}`,
    `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
     SELECT lang, 'publisher', lower(trim(publisher)), id FROM books WHERE publisher IS NOT NULL AND trim(publisher) != ''${rAnd}`,
    `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
     SELECT lang, 'format', lower(trim(format)), id FROM books WHERE format IS NOT NULL AND trim(format) != ''${rAnd}`,
    // editions of one work: same language, same normalised title, same first author
    `INSERT OR IGNORE INTO book_works (lang, work_key, book_id)
     SELECT lang,
            lower(trim(title)) || '|' || lower(trim(CASE WHEN instr(COALESCE(author, ''), ',') > 0 THEN substr(author, 1, instr(author, ',') - 1) ELSE COALESCE(author, '') END)),
            id
     FROM books WHERE title IS NOT NULL AND trim(title) != ''${rAnd}`,
    // tag counts, keeping the tags' original spelling for display; chunks add their counts into the same rows
    `INSERT INTO catalog_facets (lang, kind, name, count)
     SELECT b.lang, 'tag', j.value, COUNT(*) FROM books b, json_each(${tagArray}) j
     WHERE j.type = 'text' AND j.value != ''${r}
     GROUP BY b.lang, j.value
     ON CONFLICT(lang, kind, name) DO UPDATE SET count = count + excluded.count`,
  ];
}

/** Counts and distinct keys; each is one grouped pass, run after every key insert has finished. */
export const FACET_STATEMENTS = [
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'category', category, COUNT(*) FROM books WHERE category IS NOT NULL AND category != '' GROUP BY lang, category`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'collection', collection, COUNT(*) FROM books WHERE collection IS NOT NULL AND collection != '' GROUP BY lang, collection`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'country', country, COUNT(*) FROM books WHERE country IS NOT NULL AND country != '' GROUP BY lang, country`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'author_country', country, COUNT(*) FROM authors WHERE country IS NOT NULL AND country != '' GROUP BY lang, country`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'publisher', key, COUNT(*) FROM book_keys WHERE kind = 'publisher' GROUP BY lang, key`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'format', key, COUNT(*) FROM book_keys WHERE kind = 'format' GROUP BY lang, key`,
];

export const FINISH = `INSERT OR REPLACE INTO read_model_meta (name, built_at, max_id, books)
   SELECT 'catalog', CURRENT_TIMESTAMP, COALESCE(MAX(id), 0), COUNT(*) FROM books`;

/** Everything in one atomic batch. */
export const REBUILD_STATEMENTS = [...CLEAR, ...keyInserts(), ...FACET_STATEMENTS, FINISH];

/**
 * The same work as ordered steps, each a list of statements to run together: clear, one step per id range, then the
 * facets and the meta row.
 */
export function rebuildPlan(maxId, chunk = 5000) {
  const steps = [CLEAR];
  for (let lo = 0; lo < Number(maxId); lo += chunk) steps.push(keyInserts(lo, lo + chunk));
  steps.push(FACET_STATEMENTS, [FINISH]);
  return steps;
}
