-- Target: D1 `catalog`. ADDITIVE ONLY — `books` and every other table are untouched.
-- Idempotent. Apply locally first:
--   npx wrangler d1 execute catalog --local --file=migrations/catalog/0001_fts_summaries.sql

-- Cached/generated summary variants (intent = general|founder|tech|student|action).
CREATE TABLE IF NOT EXISTS book_summaries (
  book_slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  intent TEXT NOT NULL DEFAULT 'general',
  summary_json TEXT NOT NULL,
  audio_key TEXT,
  source TEXT NOT NULL DEFAULT 'ai',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_slug, lang, intent)
);

-- ISBN lookups (Goodreads import, affiliate matching) would otherwise scan the whole table.
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- Keyword search over books (external-content FTS5 + sync triggers).
CREATE VIRTUAL TABLE IF NOT EXISTS books_fts USING fts5(
  title, author, description, summary, tags,
  content='books', content_rowid='id'
);
CREATE TRIGGER IF NOT EXISTS books_fts_ai AFTER INSERT ON books BEGIN
  INSERT INTO books_fts(rowid, title, author, description, summary, tags)
  VALUES (new.id, new.title, new.author, new.description, new.summary, new.tags);
END;
CREATE TRIGGER IF NOT EXISTS books_fts_ad AFTER DELETE ON books BEGIN
  INSERT INTO books_fts(books_fts, rowid, title, author, description, summary, tags)
  VALUES ('delete', old.id, old.title, old.author, old.description, old.summary, old.tags);
END;
CREATE TRIGGER IF NOT EXISTS books_fts_au AFTER UPDATE ON books BEGIN
  INSERT INTO books_fts(books_fts, rowid, title, author, description, summary, tags)
  VALUES ('delete', old.id, old.title, old.author, old.description, old.summary, old.tags);
  INSERT INTO books_fts(rowid, title, author, description, summary, tags)
  VALUES (new.id, new.title, new.author, new.description, new.summary, new.tags);
END;

-- Author names for search-as-you-type (the command palette), indexed instead of scanned.
CREATE VIRTUAL TABLE IF NOT EXISTS authors_fts USING fts5(
  name, content='authors', content_rowid='id'
);
CREATE TRIGGER IF NOT EXISTS authors_fts_ai AFTER INSERT ON authors BEGIN
  INSERT INTO authors_fts(rowid, name) VALUES (new.id, new.name);
END;
CREATE TRIGGER IF NOT EXISTS authors_fts_ad AFTER DELETE ON authors BEGIN
  INSERT INTO authors_fts(authors_fts, rowid, name) VALUES ('delete', old.id, old.name);
END;
CREATE TRIGGER IF NOT EXISTS authors_fts_au AFTER UPDATE ON authors BEGIN
  INSERT INTO authors_fts(authors_fts, rowid, name) VALUES ('delete', old.id, old.name);
  INSERT INTO authors_fts(rowid, name) VALUES (new.id, new.name);
END;

-- One-time backfill of existing rows (run ONCE after this file; safe to repeat, just slow):
--   INSERT INTO books_fts(books_fts) VALUES('rebuild');
--   INSERT INTO authors_fts(authors_fts) VALUES('rebuild');
