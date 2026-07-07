import { getCloudflareContext } from "@opennextjs/cloudflare";

// Schema lives in code: applied automatically on first DB access after every
// deploy (CREATE TABLE IF NOT EXISTS is a no-op when tables already exist).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  price TEXT,
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
  audiobook_url TEXT,
  featured INTEGER DEFAULT 0,
  bestseller INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_books_lang ON books(lang);
CREATE INDEX IF NOT EXISTS idx_books_cat ON books(lang, category);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(lang, rating DESC);

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
`;

let schemaReady;

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  if (!schemaReady) {
    schemaReady = env.DB.exec(SCHEMA.replace(/\n/g, " ").trim());
  }
  await schemaReady;
  return env.DB;
}

// Read-through KV cache. Degrades gracefully to a direct D1 query if the
// CACHE binding is missing (e.g. local `next dev`).
export async function cached(key, fn, ttl = 300) {
  let kv;
  try {
    const { env } = await getCloudflareContext({ async: true });
    kv = env.CACHE;
  } catch {
    /* no bindings available */
  }
  if (!kv) return fn();

  const hit = await kv.get(key, "json");
  if (hit !== null) return hit;
  const value = await fn();
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
  return value;
}
