-- Target: D1 `catalog`. ADDITIVE ONLY and idempotent. Apply after 0002_read_models.sql.
--   npx wrangler d1 execute catalog --remote --file=migrations/catalog/0003_scale_series_works.sql
-- The catalog database holds only the catalog: books, authors, publishers, comics, and what is derived from them
-- (read models, series, editions). Reader data (lists, votes, replies, challenges) lives in ENGAGEMENT_DB and accounts in
-- DB; importer bookkeeping is slated for its own database (docs/adr/0002-database-split.md).

-- Paged author / publisher lists: every sort and filter the /authors and /publications pages offer is an index range read.
CREATE INDEX IF NOT EXISTS idx_authors_lang_name    ON authors(lang, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_authors_lang_country ON authors(lang, country, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_authors_lang_birth   ON authors(lang, birth_year);
CREATE INDEX IF NOT EXISTS idx_pubs_lang_name       ON publications(lang, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_pubs_lang_type       ON publications(lang, type, name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_books_lang_id_rating ON books(lang, rating DESC, id);

-- Series: an ordered list of books (admin-curated; the data has no reliable series field to infer one from).
CREATE TABLE IF NOT EXISTS series (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'en',
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE TABLE IF NOT EXISTS book_series (
  series_id INTEGER NOT NULL,
  book_id   INTEGER NOT NULL,
  position  REAL NOT NULL DEFAULT 0,      -- 1, 2, 3 ... (REAL so 1.5 novellas fit between)
  PRIMARY KEY (series_id, book_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_book_series_book ON book_series(book_id);
CREATE INDEX IF NOT EXISTS idx_book_series_order ON book_series(series_id, position);

-- Editions of the same work: books of one language sharing a normalised title and first author. Rebuilt with the other read
-- models (src/lib/read-models-sql.js). The book page lists the other members as "Other editions".
CREATE TABLE IF NOT EXISTS book_works (
  lang     TEXT    NOT NULL,
  work_key TEXT    NOT NULL,
  book_id  INTEGER NOT NULL,
  PRIMARY KEY (lang, work_key, book_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_book_works_book ON book_works(book_id);
