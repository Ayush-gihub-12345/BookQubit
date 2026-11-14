# ADR-0001: Catalog read models, and the target database layout

**Status:** Proposed (code and migrations are in `dev`; nothing has been applied to production)
**Date:** 2026-11-14
**Deciders:** BookQubit owner

## Context

The production catalog database (`catalog`, D1 `a1795b64…`) shows, over a 30-minute window on the D1 dashboard:

| Metric | Value |
|---|---|
| Total queries | 593 (+136%) |
| Rows read | 2 M (+470%) |
| Rows written | 0 |
| Storage | 24 MB, 8 tables |

That is about **3,400 rows read per query**, and nothing is being written. For a database whose largest table (`books`) holds
about 5,200 rows, an average query reads two thirds of it. Point lookups read 1–5 rows, so a minority of queries must be
whole-table scans. The code explains which:

| Source | What it does | Cost |
|---|---|---|
| `facets()` | 4 `GROUP BY` passes, one a `json_each` over every tag of every book | ~2.8 M rows per call (measured in an earlier code comment) |
| `getTagBookIndex` | `json_each` over all tags, built in JS | one full pass per cold isolate |
| `getAuthorBookIndex`, `getPublisherBookIndex`, `getFormatBookIndex` | `SELECT … FROM books` for every book, split in JS | one full pass each, per cold isolate |
| `listEntity` (authors, publications) | whole-table read | ~3,900 rows |
| `getMoodCounts` | whole `shelf` read (other DB) | n/a here |

These are wrapped in a cache, but the cache is only as good as its weakest tier. Entries over ~1.8 MB never reach the durable
tier, there is no KV in production, and the edge Cache API does not work on `workers.dev` hostnames. Each cold isolate (and
crawlers cause many) therefore re-runs the scans. **Root cause is a strong hypothesis, not proven**: confirm with D1 "Query
insights" (dashboard → catalog → Insights, sort by rows read) before and after the change below.

Two defects found on the way, both fixed in `dev`:
- The browse cache key omitted `author` and `publisher`, so browsing a second author inside the cache lifetime returned the first
  author's books.
- `static` TTL was shortened from 3 h to 1 h in the cache rework, which triples the frequency of every scan above on a cold cache.
  With read models the scans are gone, so the TTL no longer matters for load.

## Decision

Stop computing aggregates from `books` at request time. Maintain them as small, indexed **read models** inside the same catalog
database, and read those instead:

- `book_keys (lang, kind, key, book_id)`: tag, author, publisher, format lookups. `WITHOUT ROWID`, so "books for this tag" is one
  index range read.
- `catalog_facets (lang, kind, name, count)` with a `(lang, kind, count DESC)` index: "top 60 categories" reads 60 rows.
- `read_model_meta`: when they were built and the highest book id they cover.

Rules that keep it safe:
1. **Additive.** `books` and every existing table are untouched (migration `0002_read_models.sql`).
2. **Opt-in at runtime.** The app uses a model only if the tables exist **and** `max_id` covers the newest book in that language.
   Otherwise the original code path runs unchanged. Applying the migration alone changes nothing.
3. **Atomic rebuild.** One D1 batch (a transaction): readers see old or new, never half.
4. **Same behaviour.** Publisher/format keep their loose "contains" matching (resolved over the few thousand distinct keys in
   `catalog_facets`, never over books). `tests/read-models.test.js` runs the real migration and compares every facet and filter to
   the live query it replaces.
5. **Rebuild on change, not on a timer.** Admin → Caches → "Rebuild read models", `scripts/rebuild-read-models.mjs`, and the dev
   deploy. Edits to an existing book's tags/author do not invalidate the models by themselves; a rebuild after bulk edits does.

Result per request: tag/author/publisher/format browse and author/publisher pages go from "read the whole table (cached)" to a
handful of indexed reads; `facets()` from a 2.8 M-row aggregate to four ~60-row reads.

## Options considered

### A: Tune the existing caches only (longer TTLs, KV, smaller entries)
| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | Free to small (KV writes are metered) |
| Scalability | Poor: cost still grows with books × cold isolates |

**Pros:** no schema change. **Cons:** a cold cache or a crawl still scans the table; staleness grows with TTL; production already
had a KV incident (write-metered tier degrading silently), so more weight on caches is the riskier direction.

### B: Read models in the catalog D1 (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Medium (3 tables, one rebuild routine, fallbacks) |
| Cost | Rebuild writes ≈ books × (tags + 3) rows (~30–40 k at 5 k books), only when the catalog changes |
| Scalability | Reads stay flat as the catalog grows; rebuild grows linearly and rarely |
| Team familiarity | High (plain SQL, same D1) |

**Pros:** removes the scans instead of hiding them; works with no extra service; fully reversible. **Cons:** a derived copy to keep
fresh; free-plan write quota (100 k rows/day) limits rebuilds to a few per day.

### C: Move the catalog to a different engine (Postgres via Hyperdrive, Turso, Algolia/Typesense for browse)
| Dimension | Assessment |
|---|---|
| Complexity | High (new service, new driver, data migration, new failure modes) |
| Cost | New monthly spend |
| Scalability | Best at millions of books |

**Pros:** real faceting, no row-read metering. **Cons:** unjustified at 5 k rows and a 24 MB database; revisit past ~1 M books.

### D: Precomputed snapshots in KV, rebuilt by cron
**Pros:** one KV read per page. **Cons:** needs a cron and KV write budget; cannot express "books for this tag" without storing
every list; B gives the same effect with transactions and no extra moving part.

## Trade-off analysis

B beats A because it removes the cost instead of caching it; it beats C and D on risk and effort at the current size. Its only real
costs are a second copy of some data and the rebuild step, both bounded and visible (the admin page shows when it was built).

## Target layout (production)

| Database | Holds | Access pattern | Change |
|---|---|---|---|
| `DB` (core) | accounts, social graph, discussions, moderation, site settings | mixed, small | none now; `app_cache` retires once KV is bound |
| `CATALOG_DB` | books, authors, publications, comics + **read models** | read-mostly, written by import/admin | add `0002_read_models.sql` |
| `ENGAGEMENT_DB` | shelves, reading log, streaks, audio checkpoints | write-heavy, per user | new, auto-created (config in `wrangler.jsonc`) |
| `MINDSPACE_DB` | users' notes, quotes, idea graphs | per user, private | new, auto-created |
| `CACHE_KV` | cache tier, cache-group versions | hot reads, metered writes | new; write budget and circuit breaker already in `db.js` |
| import staging tables (`import_chunks`, `import_progress`, `ol_fetch_state`, `catalog_counts`) | importer bookkeeping | write-heavy, inside the read-mostly catalog | candidate to move to their own DB later (see action items) |

Splitting by access pattern means a write burst (an import, a popular reading day) cannot slow catalog reads, and each database
stays small enough that D1's single-writer limit is not a concern.

## Consequences

- **Easier:** browse by tag/author/publisher/format and the facet menus cost almost nothing per request; a crawl no longer
  multiplies database load; cold starts stop rebuilding indexes.
- **Harder:** there is a rebuild step after imports and bulk edits; a new book is served by the old (slower, correct) path until
  the model covers it.
- **To revisit:** D1 read replication for global latency; moving import bookkeeping out of `catalog`; retiring `app_cache`;
  Vectorize + queue + cron (phase 2) so the rebuild and embeddings run on a schedule.

## Rollout and rollback

1. **Dev (done by the deploy script):** apply `0002`, rebuild, compare dev Insights before/after.
2. **Production, after merge to `main`:**
   ```bash
   npx wrangler d1 execute catalog --remote --file=migrations/catalog/0002_read_models.sql
   node scripts/rebuild-read-models.mjs --env=prod --yes
   ```
   Then watch rows read for 30 minutes. Success: at least a 90% drop in rows read with the same number of queries; no change in
   `/books?tag=…`, author and publisher pages.
3. **Rollback:** `DELETE FROM read_model_meta;` makes the app ignore the models immediately (within a minute per isolate); the
   tables are inert and can be dropped later. No code deploy needed.

## Action items

1. [x] Migration `0002_read_models.sql`, rebuild SQL, runtime helpers, tests (`tests/read-models.test.js`)
2. [x] Facets, tag, author, publisher, format and author/publisher pages read from the models, with fallback
3. [x] Admin "Rebuild read models" button and `scripts/rebuild-read-models.mjs`; dev deploy applies and rebuilds
4. [x] Fix browse cache key (`author`, `publisher`)
5. [ ] Apply to dev (automatic on the next dev deploy) and record before/after rows read from D1 Insights
6. [ ] Apply to production after merge; verify as above
7. [ ] Have the importer (`bulk-import/cron-worker`) call the rebuild after each batch, or run it on the phase-2 cron
8. [ ] Replace the `authors`/`publications` whole-table lists (`listEntity`) with paged, indexed reads
9. [ ] Decide on moving import bookkeeping tables out of `catalog`; retire `app_cache` once KV is proven
10. [ ] Evaluate D1 read replication for `CATALOG_DB`
