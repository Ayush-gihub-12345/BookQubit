# Deployment checklist (run once, in order, BEFORE merging/deploying to production)

All commands run from `public/` and need `npx wrangler login` first.
Everything is additive; no existing table or binding is changed.

```bash
# 1. New Cloudflare resources
npx wrangler queues create bookqubit-jobs
npx wrangler vectorize create bookqubit-vectors --dimensions=768 --metric=cosine
npx wrangler vectorize create-metadata-index bookqubit-vectors --property-name=type --type=string
npx wrangler r2 bucket create bookqubit-media          # CACHE_KV auto-provisions on first deploy

# 2. D1: two NEW databases (wrangler.jsonc already declares them without ids; create them
#    explicitly so the ids are pinned, then paste each database_id into wrangler.jsonc)
npx wrangler d1 create engagement
npx wrangler d1 create mindspace
npx wrangler d1 execute engagement --remote --file=migrations/engagement/0001_engagement.sql
npx wrangler d1 execute mindspace  --remote --file=migrations/mindspace/0001_mindspace.sql

# 2a. D1 migrations on the EXISTING databases (additive only). Test with --local first.
npx wrangler d1 execute database --remote --file=migrations/main/0001_search_safety.sql
npx wrangler d1 execute catalog  --remote --file=migrations/catalog/0001_fts_summaries.sql
npx wrangler d1 execute catalog  --remote --command="INSERT INTO books_fts(books_fts) VALUES('rebuild')"

# 2b. Redeploy the import worker so new books also get a 1-minute summary from Workers AI
#     (needs the catalog migration above; set AI_MODEL in bulk-import/cron-worker/wrangler.jsonc for a larger model)
(cd ../bulk-import/cron-worker && npx wrangler deploy)

# 3. Optional per-country affiliate tags (secrets)
npx wrangler secret put AMAZON_TAG_IN   # also _US _GB _AE _SA _DE _BR _JP

# 4. Deploy
npm run deploy
```

Rollback: remove the new bindings from `wrangler.jsonc` and redeploy; the new tables are unused by old code and can stay.
