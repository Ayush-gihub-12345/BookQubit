# ADR-0002: What lives in which database, and how the catalog stays cheap at 100,000+ books

**Status:** Proposed. Code and migrations are in `dev`. Nothing here has been applied to production.
**Date:** 2026-11-20
**Builds on:** [ADR-0001](0001-data-architecture.md) (catalog read models, target layout)

## Context

The goal is a catalog that holds 100,000+ books without running into D1 limits (rows read per query, rows read per day, database
size, write serialisation) and without reader activity slowing book pages. The catalog database should hold only catalog content.

## Decision

| Database (binding) | Holds | Never holds |
|---|---|---|
| `catalog` (`CATALOG_DB`) | books, authors, publishers, comics, their full-text indexes, the **read models** (`book_keys`, `catalog_facets`, `read_model_meta`), **editions** (`book_works`), **series** (`series`, `book_series`) | reader data, accounts |
| `database` (`DB`) | accounts, social graph, shelf (status, rating, review text), goals, discussions | catalog content |
| `engagement` (`ENGAGEMENT_DB`) | reading log, daily activity, audio state, custom shelves, **reader-made lists** (`lists`, `list_items`, `list_votes`), **review helpful votes and replies** (`review_votes`, `review_replies`), **reading challenges** (`reading_challenges`) | accounts, catalog content |
| `mindspace` (`MINDSPACE_DB`) | private notes and spaces | everything else |
| *(future)* ops | importer bookkeeping (`import_chunks`, `import_progress`, `ol_fetch_state`, `catalog_counts`) and `book_summaries` | |

Cross-database references are plain text (`user_id`, `book_slug`); there are no cross-database joins. A page that needs both
makes two small indexed queries.

Why this split: D1 serialises writes per database. Votes, replies, progress logs and list edits are write-heavy and bursty; keeping
them in `engagement` means a burst never queues behind, or in front of, a catalog read or a login.

### What keeps catalog reads cheap

1. **Read models** replace whole-table scans. A tag, author, publisher or format browse reads `book_keys` by primary key; facet
   counts are a table, not a `GROUP BY`. The models are used only while `read_model_meta.max_id` covers the newest book, so a stale
   model falls back to the original (slower, correct) query and never shows a wrong list.
2. **Chunked rebuild.** Above about 20,000 books the rebuild runs as id-range steps (5,000 books each) instead of one large batch.
   The models are marked not-ready first and ready last.
3. **Bounded lists.** Authors are paged from an indexed query (`idx_authors_lang_name`, FTS for search) and only authors that have
   books are listed; paging is limit+1, capped at page 100 (authors) and 200 (books), and there is no `COUNT(*)`.
4. **Four-tier cache** (memory, edge Cache API, KV, D1 `app_cache`) with stale-while-revalidate and stale-if-error. Key groups are
   invalidated as a unit.
5. **Denormalised counters** on `lists` (`item_count`, `vote_count`) so list indexes never count rows.

### Measured (in-memory SQLite, 100,000 books, 40,000 authors; `SCALE=1 npx vitest run tests/scale.test.js`)

| Query | Time |
|---|---|
| book by slug | 0.3 ms |
| popular tag browse (page of results) | 14 to 15 ms |
| facets | 0.2 to 0.3 ms |
| authors, page 1 | 1.5 ms |
| authors, page 400 | 97 ms (hence the page cap) |
| author search | 10.5 ms |
| similar books | 5 ms |
| full-text search | 7 ms |
| full read-model rebuild | 7.5 s (hence chunking) |

`EXPLAIN QUERY PLAN` assertions in the tests confirm index use and no scan of a big table. These are SQLite timings; D1 adds
network latency per query, so the number of queries per page matters as much as their cost, and pages here make a handful.

## Consequences

- Production needs, in order: `migrations/catalog/0002`, `0003`, `migrations/engagement/0002` and `0003`, then the read-model rebuild
  (`node scripts/rebuild-read-models.mjs --env=prod --yes`). `npm run preflight -- --env=prod` lists anything missing without changing it.
- The importer tables still live in the catalog database. Moving them (and `book_summaries`) to an ops database is a follow-up: it
  means changing the importer Worker's bindings, which is outside this change.
- Series are curated by hand (`POST /api/admin/series`); the data has no reliable series field to infer them from. Editions are
  inferred (same language, same title, same first author) and stored in `book_works`.
- Reader lists, votes and replies are user-generated content. Basic limits exist (100 lists per reader, 200 books per list, 20
  replies per hour). Readers can report a list or reply; an admin hides or restores it in Community reports (`hidden_content`,
  `migrations/engagement/0003_moderation.sql`).
- Public HTML is **not** cached at the edge: server renders read the `theme` and `bq_rail` cookies, so one shared copy would show
  the wrong theme to some visitors. Public JSON endpoints do send `s-maxage` headers. Edge-caching HTML would first need the theme
  and rail to move client-side, or a cache key that includes those cookies.
