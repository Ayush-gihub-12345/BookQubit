PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    bio TEXT,
    image_url TEXT,
    website TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publishers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    description TEXT,

    logo_url TEXT,
    website TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    author_id INTEGER,
    publisher_id INTEGER,

    title TEXT NOT NULL,
    canonical_slug TEXT UNIQUE NOT NULL,

    description TEXT,

    cover_url TEXT,

    isbn TEXT,
    language_source TEXT DEFAULT 'en',

    book_type TEXT DEFAULT 'book',

    status TEXT DEFAULT 'published',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(author_id) REFERENCES authors(id),
    FOREIGN KEY(publisher_id) REFERENCES publishers(id)
);

CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    publisher_id INTEGER,

    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    description TEXT,

    cover_url TEXT,

    publication_type TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(publisher_id) REFERENCES publishers(id)
);

CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,

    language_code TEXT NOT NULL,

    translated_title TEXT,
    translated_slug TEXT,

    seo_title TEXT,
    seo_description TEXT,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(entity_type, entity_id, language_code)
);

CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,

    key TEXT NOT NULL,
    value TEXT
);

CREATE INDEX idx_books_slug
ON books(canonical_slug);

CREATE INDEX idx_books_author
ON books(author_id);

CREATE INDEX idx_books_publisher
ON books(publisher_id);

CREATE INDEX idx_translations_lookup
ON translations(entity_type, entity_id, language_code);

CREATE INDEX idx_metadata_lookup
ON metadata(entity_type, entity_id, key);