# BookQubit D1 Deployment Architecture

## Overview

On deployment, BookQubit transitions from static JSON-based data to a **Cloudflare-native architecture** using:

- **D1 Databases**: Three separate databases for content, users, and analytics
- **Cloudflare Workers**: API endpoints to query D1
- **KV Storage**: Caching layer for frequently accessed data
- **R2 Buckets**: Asset storage for book covers and media

**Key Change**: All data is fetched from D1 databases via API workers, NOT from JSON files.

---

## Databases

### 1. `bookqubit_content` (D1_DB_CONTENT)
Stores all book metadata, authors, publishers, and content-related information.

**Key Tables:**
- `books` - Core book information with 35+ fields including:
  - Title, slug, description, summary
  - Cover URL, ISBN, page count, published year
  - Affiliate links (Amazon, Audible, Goodreads)
  - Audio links and streaming URLs
  - Geography data (country, continent, sub-region)
  - Pricing and rating

- `book_genres` - Many-to-many mapping for genres
- `book_subjects` - Subject/topic tags for each book
- `book_keypoints` - Key takeaways/highlights
- `book_tags` - Search and categorization tags
- `related_books` - Recommendations based on relationships (series, similar, author_other_works)
- `authors` - Author metadata with bio, image, website
- `publishers` - Publisher information
- `categories` - Book categories and collections
- `translations` - Multilingual content translations

### 2. `bookqubit_users` (D1_DB_USERS)
Stores user profiles, library, collections, and interactions.

**Key Tables:**
- `users` - User accounts linked to Firebase UID
- `user_profiles` - Extended profile information
- `user_library` - User's reading list (want_to_read, reading, completed, dropped)
- `user_interactions` - View/like/share/highlight/comment events
- `user_collections` - Custom book collections
- `user_insights` - Aggregated user reading stats

### 3. `bookqubit_analytics` (D1_DB_ANALYTICS)
Tracks events, searches, page views, and analytics data.

**Key Tables:**
- `events` - User actions (page_view, book_search, book_view, etc.)
- `searches` - Search queries with results and filters
- `page_views` - Page visit tracking with duration
- `user_sessions` - Session management with device/browser info
- `content_metrics` - Book popularity metrics (views, likes, reviews, shares)
- `trending_books` - Time-based trending calculations
- `user_recommendations` - Personalization tracking

---

## Deployment Flow

### Step 1: Schema Creation
When the application deploys (via GitHub Actions or manual deployment):

```bash
# Executed via wrangler
npx wrangler d1 migrations apply --database=bookqubit_content
npx wrangler d1 migrations apply --database=bookqubit_users
npx wrangler d1 migrations apply --database=bookqubit_analytics
```

All SQL tables from `web/schema.sql` are created automatically.

### Step 2: Data Migration
The migration script (`scripts/migrate-d1-data.ts`) runs to populate databases:

```bash
npm run migrate:d1
```

**What happens:**
1. Reads all `BooksData_*.js` files from the repository
2. Extracts unique authors and publishers → inserts into D1
3. Processes all 20 languages worth of book data
4. Inserts books with all metadata (genres, subjects, tags, keypoints, affiliate links)
5. Creates related books relationships for recommendations

### Step 3: API Workers Ready
After migration completes:
- All Cloudflare Worker endpoints are bound to D1 databases
- `DB_CONTENT` binding queries the content database
- `DB_USERS` binding queries the users database
- `DB_ANALYTICS` binding queries the analytics database
- Data is cached in KV for 5-10 minutes to reduce DB queries

---

## API Endpoints

### Books API
All endpoints query D1 instead of JSON files.

```
GET /api/v1/books
  - Fetch all books with filters (category, genre, sort, pagination)
  - Query: bookqubit_content.books

GET /api/v1/books/:slug
  - Get single book with full metadata
  - Includes: genres, subjects, tags, keypoints, related books, author info, publisher info
  - Query: bookqubit_content (joined with book_genres, book_subjects, etc.)

GET /api/v1/books/:id/related
  - Get related books for recommendations
  - Query: bookqubit_content.related_books

GET /api/v1/books/search/:query
  - Search books by title/author/description
  - Full-text search on bookqubit_content.books

GET /api/v1/books/category/:category
  - Filter books by category
  - Query: bookqubit_content.books with WHERE category = ?

GET /api/v1/books/author/:author
  - Get all books by an author
  - Query: bookqubit_content with JOIN authors
```

---

## Frontend Changes

### Before (Static JSON)
```jsx
// Old approach - reads from JSON files
import { getBooksByLanguage } from '@/data/books';

const books = getBooksByLanguage(language);
```

### After (D1 API)
```jsx
// New approach - queries D1 via API workers
const response = await fetch(`/api/v1/books?language=${language}`);
const { data: books } = await response.json();
```

---

## Environment Configuration

### `wrangler.toml`
```toml
[[env.production.d1_databases]]
binding = "DB_CONTENT"
database_name = "bookqubit_content"

[[env.production.d1_databases]]
binding = "DB_USERS"
database_name = "bookqubit_users"

[[env.production.d1_databases]]
binding = "DB_ANALYTICS"
database_name = "bookqubit_analytics"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "..."

[[env.production.r2_buckets]]
binding = "ASSETS"
bucket_name = "bookqubit-assets"
```

---

## Performance Optimization

### 1. Caching Layer (KV)
- Frequently accessed books cached for 5-10 minutes
- Cache invalidated when book data is updated
- Reduces D1 query load

### 2. Database Indexes
Indexes created on:
- `books.canonical_slug` - slug lookups
- `books.author_id` - author filtering
- `books.category` - category filtering
- `book_genres.genre_name` - genre searches
- `related_books.book_id` - related books queries

### 3. Query Optimization
- GROUP_CONCAT used for efficient aggregation
- JOIN optimization for multilingual data
- LIMIT/OFFSET for pagination

---

## Data Consistency

### Multilingual Support
Each book entry can have translations:
- Core book data in `books` table
- Translated content in `translations` table
- Frontend specifies language parameter in API calls

### Real-time Updates
When book data is updated in admin panel:
1. Update `books` table in D1
2. Invalidate cache in KV
3. Recalculate metrics in `content_metrics`
4. Update related books if necessary

---

## Rollback Plan

If deployment fails:
1. Previous D1 database snapshot is retained
2. Use `wrangler d1 migrations rollback` to revert schema
3. GitHub Actions automatically triggers on deployment failure

---

## Testing

### Local Development
```bash
# Start D1 locally with Wrangler
npm run dev

# Run migrations against local D1
npm run migrate:d1:local

# API endpoints available at http://localhost:8787/api/v1/books
```

### Staging Deployment
1. Deploy to Cloudflare staging environment
2. Run migration script
3. Verify all 20 languages loaded correctly
4. Test API endpoints respond with data
5. Check performance metrics

---

## Monitoring

### Key Metrics to Track
- **D1 Query Latency**: Should be < 100ms with caching
- **Cache Hit Rate**: Target 80%+ for frequently accessed books
- **Data Freshness**: Last update timestamp from migration
- **API Error Rate**: Should be < 0.1%

### Logs
- Cloudflare Workers logs show D1 query patterns
- KV cache hit/miss statistics
- Migration script output logs

---

## Next Steps

1. ✅ **Schema Updated**: All tables defined in `web/schema.sql`
2. ✅ **D1 Service Layer**: Created in `server/src/api/v1/modules/books/services/d1.book.service.ts`
3. ✅ **Migration Script**: Ready in `scripts/migrate-d1-data.ts`
4. **TODO**: Update API routes to use D1 service instead of JSON files
5. **TODO**: Update frontend components to call API endpoints
6. **TODO**: Add KV caching layer
7. **TODO**: Set up GitHub Actions for automatic deployment

---

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Schema | `web/schema.sql` | D1 table definitions |
| D1 Service | `server/src/api/v1/modules/books/services/d1.book.service.ts` | D1 query functions |
| Migration | `scripts/migrate-d1-data.ts` | Load JSON data into D1 |
| Config | `web/wrangler.toml` | Cloudflare bindings |
| Data Files | `server/src/api/v1/modules/books/data/BooksData_*.js` | Source JSON files (used only during migration) |

