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

## After deploying: smoke tests (about 10 minutes)

1. `/en/books/<any-slug>`: the "Understand in 60 seconds" card renders; **Listen** plays (device voice if no audio file).
2. `/en/feed`: mixed cards appear; filter tabs switch; one card is labelled "Sponsored · Affiliate link".
3. Search for a phrase ("how to build habits") and for a Hindi title: results appear; a nonsense query logs `search_zero`.
4. Signed in: `/en/library` (move a book between shelves), `/en/library/stats`, import a small Goodreads CSV.
5. `/en/mindspace`: create a space, add a note and a book, connect them, view the Graph tab; make it public and open the
   public URL signed out; make it private again and confirm the public URL now shows "Space not found".
6. Open the same discussion in two browsers: "N readers here now" appears and a message shows up without waiting 4 s.
7. Block a reader from the message menu: their messages disappear; unblock on `/en/connect`.
8. Admin → Community reports: a report from step 7's menu is listed.
9. Workers Logs: confirm `affiliate_click`, `audio_play` and `ai_cache` events are arriving.

Rollback: remove the new bindings from `wrangler.jsonc` and redeploy. All new tables are additive and unused by old code.
