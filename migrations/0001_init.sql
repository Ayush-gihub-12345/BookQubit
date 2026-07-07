-- BookQubit catalog schema (books, authors, publications, comics)

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  price TEXT,
  isbn TEXT,
  language TEXT,
  published TEXT,
  original_published TEXT,
  page_count INTEGER,
  format TEXT,
  description TEXT,
  summary TEXT,
  category TEXT,
  collection TEXT,
  genres_json TEXT,
  subjects_json TEXT,
  tags_json TEXT,
  key_points_json TEXT,
  rating REAL,
  image_url TEXT,
  country TEXT,
  continent TEXT,
  sub_region TEXT,
  amazon_asin TEXT,
  amazon_url TEXT,
  know_more_url TEXT,
  read_summary_url TEXT,
  listen_audiobook_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_books_lang ON books(lang);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(lang, category);
CREATE INDEX IF NOT EXISTS idx_books_collection ON books(lang, collection);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(lang, rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(lang, published DESC);

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_year INTEGER,
  country TEXT,
  bio TEXT,
  book_count INTEGER,
  most_famous_work TEXT,
  genres_json TEXT,
  image_url TEXT,
  socials_json TEXT,
  buttons_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_authors_lang ON authors(lang);

CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  founded TEXT,
  headquarters TEXT,
  website TEXT,
  type TEXT,
  about TEXT,
  notable_authors_json TEXT,
  imprints_json TEXT,
  key_publications_json TEXT,
  employees TEXT,
  revenue TEXT,
  parent_company TEXT,
  social_media_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_publications_lang ON publications(lang);

CREATE TABLE IF NOT EXISTS comics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  publisher TEXT,
  publication_date TEXT,
  cover_price TEXT,
  format TEXT,
  characters_introduced_json TEXT,
  editor TEXT,
  writers_artists_json TEXT,
  description TEXT,
  image_url TEXT,
  first_print_sales TEXT,
  second_print_sales TEXT,
  value_today TEXT,
  fun_fact TEXT,
  rating REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_comics_lang ON comics(lang);
