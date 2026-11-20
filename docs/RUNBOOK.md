# BookQubit runbook

Short, practical. For design reasons see [ADR-0001](adr/0001-data-architecture.md) and [ADR-0002](adr/0002-database-split.md).

## Is it up?

`GET /api/health` returns 200 when the accounts and catalog databases answer, 503 when either does not. It also reports timings for
the engagement and mindspace databases, KV, and whether the catalog read models are built (those never fail the check; the site
degrades gracefully without them). Put an external uptime monitor on it (check every minute, alert after 2 failures).

Reading the output: `readModels.ok = false` means browse pages are on the slower fallback path. Fix: Admin, Caches, Rebuild, or
`node scripts/rebuild-read-models.mjs --env=prod --yes`.

## Before a production deploy

1. `npm test` and `NEXT_PUBLIC_APP_ENV=dev BQ_LOCAL_D1=1 npx next build` pass.
2. `npm run preflight -- --env=prod` lists any missing table or index (read-only). Apply what it prints, then run it again.
3. Deploy. Then open `/api/health`, a book page, `/en/authors`, `/en/lists`, and Admin, Data quality.

Migrations are idempotent (`CREATE ... IF NOT EXISTS`), so applying one twice is safe.

## Alerts to set up in the Cloudflare dashboard

| Alert | Why |
|---|---|
| Workers: error rate or CPU time above normal | a bad deploy or a runaway query |
| D1: rows read per day close to the plan limit | the early sign of a missing index or a cold cache |
| D1: database size above 80% of its limit (catalog first) | time to plan the next split |
| Builds: failed build | the production build has been failing on dev pushes; check the build log |

D1 dashboard, Insights, sort by rows read, is the first place to look when a database is busy.

## Something is slow or hitting limits

1. D1 Insights for the busiest query. A query reading thousands of rows per call is a scan: find it in `src/lib`, check it uses an
   index (`EXPLAIN QUERY PLAN` in `tests/*.test.js` shows how), and cache it with `cached(key, fn, ttl)`.
2. Admin, Caches: shows which group is cold. Rebuild the read models if `readModels` is false in `/api/health`.
3. Deep paging: authors are capped at page 100 and books at page 200. If crawlers hammer deeper URLs they get the last allowed page.

## Data quality

Admin, Data quality computes one report over the catalog (cover, description, ISBN, author, publisher, category, tags, duplicates,
orphan authors). It reads each book once, so it runs on demand and is cached for a day. Run Recompute after an import.

## Roll back

- Code: redeploy the previous version (`wrangler rollback`, or redeploy an earlier commit).
- Schema: migrations only add tables and indexes, so older code keeps working with the new schema. Nothing needs undoing.
- Read models: if they ever look wrong, delete the meta row (`DELETE FROM read_model_meta`) and the site returns (within a minute) to the original
  queries, then rebuild.

## Known gaps

- Importer bookkeeping tables are still in the catalog database (ADR-0002, follow-up).
- No reporting or moderation tools for reader lists and review replies yet.
- Public HTML is not edge-cached (see ADR-0002 for why).
