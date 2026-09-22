-- =============================================================================
-- CATALOG database schema (binding: CATALOG_DB, name: catalog)
-- Mirrors the CATALOG_SCHEMA constant in src/lib/db.js — this file exists
-- because production auto-creates these tables on first access, but LOCAL
-- dev has that auto-create gated behind RUN_SCHEMA="0" (see shouldBootstrap()
-- in db.js) to stop it hammering production with pointless DDL on every cold
-- start. Locally, RUN_SCHEMA never flips on, so run this file once yourself.
--
-- LOCAL ONLY. Never run this with --remote — it would touch production,
-- which already has this schema and thousands of real rows.
--
--   npx wrangler d1 execute catalog --local --file=sql/catalog_schema.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  isbn TEXT,
  published TEXT,
  page_count INTEGER,
  format TEXT,
  description TEXT,
  summary TEXT,
  category TEXT,
  collection TEXT,
  genres TEXT,
  subjects TEXT,
  tags TEXT,
  key_points TEXT,
  rating REAL,
  cover_url TEXT,
  country TEXT,
  amazon_asin TEXT,
  amazon_url TEXT,
  featured INTEGER DEFAULT 0,
  bestseller INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_books_lang ON books(lang);
CREATE INDEX IF NOT EXISTS idx_books_cat ON books(lang, category);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(lang, rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_collection ON books(lang, collection);
CREATE INDEX IF NOT EXISTS idx_books_country ON books(lang, country);
CREATE INDEX IF NOT EXISTS idx_books_created ON books(lang, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(lang, featured);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(lang, author);
CREATE INDEX IF NOT EXISTS idx_books_cat_rating ON books(lang, category, rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_author_rating ON books(lang, author, rating DESC);

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  birth_year INTEGER,
  country TEXT,
  bio TEXT,
  famous_work TEXT,
  genres TEXT,
  image_url TEXT,
  wikipedia_url TEXT,
  website_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  verified INTEGER DEFAULT 0,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_authors_lang ON authors(lang);

CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  about TEXT,
  logo_url TEXT,
  founded TEXT,
  headquarters TEXT,
  website TEXT,
  type TEXT,
  notable_authors TEXT,
  imprints TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_pubs_lang ON publications(lang);

CREATE TABLE IF NOT EXISTS comics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  category TEXT,
  publisher TEXT,
  publication_date TEXT,
  cover_price TEXT,
  format TEXT,
  characters TEXT,
  creators TEXT,
  description TEXT,
  cover_url TEXT,
  value_today TEXT,
  fun_fact TEXT,
  rating REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_comics_lang ON comics(lang);

CREATE TABLE IF NOT EXISTS import_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chunk_data TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  consumed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_import_chunks_consumed ON import_chunks(consumed);

CREATE TABLE IF NOT EXISTS import_progress (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_imported INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_authors_imported INTEGER DEFAULT 0,
  total_publishers_imported INTEGER DEFAULT 0,
  last_run_at TEXT,
  last_status TEXT,
  daily_cap INTEGER DEFAULT 50000,
  imported_today INTEGER DEFAULT 0,
  today_date TEXT,
  stop_requested INTEGER DEFAULT 0,
  auto_run_enabled INTEGER DEFAULT 0,
  chain_running INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ol_fetch_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  query_index INTEGER DEFAULT 0,
  offset_val INTEGER DEFAULT 0,
  curated_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalog_counts (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  books INTEGER DEFAULT 0,
  authors INTEGER DEFAULT 0,
  publications INTEGER DEFAULT 0
);
ALTER TABLE books ADD COLUMN backfill_done INTEGER;
ALTER TABLE books ADD COLUMN difficulty_score REAL;
ALTER TABLE books ADD COLUMN pct_length REAL;
ALTER TABLE books ADD COLUMN difficulty_bucket TEXT;
ALTER TABLE authors ADD COLUMN backfill_done INTEGER;
ALTER TABLE publications ADD COLUMN backfill_done INTEGER;
