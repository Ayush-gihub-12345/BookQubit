// SQL that (re)builds the catalog read models (see migrations/catalog/0002_read_models.sql and
// docs/adr/0001-data-architecture.md). Plain strings only, so the Worker, the admin route, the tests and
// scripts/rebuild-read-models.mjs all run the exact same statements.
//
// Applied as ONE batch (a D1 batch is a transaction): readers see the old models or the new ones, never half of each.
// Cost: one pass over `books` plus roughly (tags + 3) writes per book, only when the catalog changes, instead of
// whole-table reads on every cold isolate.

// A JSON array built from a comma-separated list ("Ken Follett, John Lee"). Quotes, backslashes and control
// characters are stripped first so the result is always valid JSON; json_valid() guards the rest.
const AUTHOR_JSON = `'["' || replace(replace(replace(replace(replace(replace(b.author, char(92), ''), '"', ''), char(10), ' '), char(13), ' '), char(9), ' '), ',', '","') || '"]'`;
const authorArray = `CASE WHEN json_valid(${AUTHOR_JSON}) THEN ${AUTHOR_JSON} ELSE '[]' END`;
const tagArray = `CASE WHEN b.tags IS NOT NULL AND json_valid(b.tags) THEN b.tags ELSE '[]' END`;

export const REBUILD_STATEMENTS = [
  "DELETE FROM book_keys",
  "DELETE FROM catalog_facets",

  // key lookups
  `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
   SELECT b.lang, 'tag', lower(trim(j.value)), b.id FROM books b, json_each(${tagArray}) j
   WHERE j.type = 'text' AND trim(j.value) != ''`,
  `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
   SELECT b.lang, 'author', lower(trim(j.value)), b.id FROM books b, json_each(${authorArray}) j
   WHERE b.author IS NOT NULL AND trim(j.value) != ''`,
  `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
   SELECT lang, 'publisher', lower(trim(publisher)), id FROM books WHERE publisher IS NOT NULL AND trim(publisher) != ''`,
  `INSERT OR IGNORE INTO book_keys (lang, kind, key, book_id)
   SELECT lang, 'format', lower(trim(format)), id FROM books WHERE format IS NOT NULL AND trim(format) != ''`,

  // counts shown in menus and filters
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'category', category, COUNT(*) FROM books WHERE category IS NOT NULL AND category != '' GROUP BY lang, category`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'collection', collection, COUNT(*) FROM books WHERE collection IS NOT NULL AND collection != '' GROUP BY lang, collection`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'country', country, COUNT(*) FROM books WHERE country IS NOT NULL AND country != '' GROUP BY lang, country`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT b.lang, 'tag', j.value, COUNT(*) FROM books b, json_each(${tagArray}) j
   WHERE j.type = 'text' AND j.value != '' GROUP BY b.lang, j.value`,
  // distinct publisher / format keys (for loose "contains" matching over a few thousand keys, not a few thousand books)
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'publisher', key, COUNT(*) FROM book_keys WHERE kind = 'publisher' GROUP BY lang, key`,
  `INSERT INTO catalog_facets (lang, kind, name, count)
   SELECT lang, 'format', key, COUNT(*) FROM book_keys WHERE kind = 'format' GROUP BY lang, key`,

  `INSERT OR REPLACE INTO read_model_meta (name, built_at, max_id, books)
   SELECT 'catalog', CURRENT_TIMESTAMP, COALESCE(MAX(id), 0), COUNT(*) FROM books`,
];
