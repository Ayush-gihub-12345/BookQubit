-- Target: D1 `catalog`. ADDITIVE ONLY: `books` and every other table are untouched. Idempotent.
-- Read models: small, indexed lookup tables that replace per-request (or per-cold-start) scans of the whole `books`
-- table. See docs/adr/0001-data-architecture.md.
--
--   npx wrangler d1 execute catalog --remote --file=migrations/catalog/0002_read_models.sql
--
-- The tables start EMPTY and the application ignores them until they are filled and fresh, so applying this file
-- changes nothing by itself. Fill them with the statements in src/lib/read-models-sql.js (Admin -> Caches ->
-- "Rebuild read models", or `node scripts/rebuild-read-models.mjs --env=dev|prod`).

-- (lang, kind, key) -> book ids. kind: tag | author | publisher | format. `key` is lower(trim(value)).
-- WITHOUT ROWID + this primary key makes "all books for this tag/author" one index range read, ordered by id.
CREATE TABLE IF NOT EXISTS book_keys (
  lang    TEXT    NOT NULL,
  kind    TEXT    NOT NULL,
  key     TEXT    NOT NULL,
  book_id INTEGER NOT NULL,
  PRIMARY KEY (lang, kind, key, book_id)
) WITHOUT ROWID;
-- Reverse lookup (which keys does this book have), used when a single book is re-indexed.
CREATE INDEX IF NOT EXISTS idx_book_keys_book ON book_keys(book_id, kind);

-- Precomputed counts. kind: category | collection | country | tag (shown in menus and filters, top N by count)
-- and publisher | format (distinct values only, used to resolve loose "contains" matches without a table scan).
CREATE TABLE IF NOT EXISTS catalog_facets (
  lang  TEXT    NOT NULL,
  kind  TEXT    NOT NULL,
  name  TEXT    NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (lang, kind, name)
) WITHOUT ROWID;
-- "Top 60 categories" is one 60-row range read of this index instead of a GROUP BY over every book.
CREATE INDEX IF NOT EXISTS idx_catalog_facets_top ON catalog_facets(lang, kind, count DESC);

-- When the models were built and how far into `books` they reach. The application only trusts them while
-- max_id >= the newest book id, so a freshly imported book can never be missing from a filter.
CREATE TABLE IF NOT EXISTS read_model_meta (
  name     TEXT PRIMARY KEY,
  built_at TEXT NOT NULL,
  max_id   INTEGER NOT NULL,
  books    INTEGER NOT NULL
);

-- Supporting indexes for the shelves and browse sorts (each stops at LIMIT instead of sorting a language).
CREATE INDEX IF NOT EXISTS idx_books_lang_bestseller ON books(lang, bestseller, rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_lang_published ON books(lang, published);

-- Author-by-name lookup on every book page (getAuthorLineProfiles); the query uses this exact expression.
CREATE INDEX IF NOT EXISTS idx_authors_lang_lname ON authors(lang, lower(trim(name)));
