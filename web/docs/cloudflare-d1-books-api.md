# Cloudflare D1 Books API

The Next app now exposes book data through same-origin API routes:

- `GET /api/books?lang=en&limit=100&page=1&sort=title-asc`
- `GET /api/books/why-i-am-an-atheist?lang=en`

Set these environment variables in Cloudflare Pages/Workers and local `.env.local`:

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_D1_DATABASE_ID=your_d1_database_id
CLOUDFLARE_D1_API_TOKEN=your_rotated_d1_api_token
NEXT_PUBLIC_BASE_URL=https://bookqubit.com
```

Do not commit the API token. If a token has been pasted into chat or logs, rotate it in Cloudflare before production use.

## Live Table Shape

The API is wired to the current normalized D1 schema:

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  author_id INTEGER,
  publisher_id INTEGER,
  title TEXT NOT NULL,
  canonical_slug TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  isbn TEXT,
  language_source TEXT DEFAULT 'en',
  book_type TEXT DEFAULT 'book',
  status TEXT DEFAULT 'published',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE translations (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  language_code TEXT NOT NULL,
  translated_title TEXT,
  translated_slug TEXT,
  seo_title TEXT,
  seo_description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Book responses join `books`, `authors`, `publishers`, and `translations`. If a translated title/slug is missing for a language, the API falls back to the canonical English book row.
