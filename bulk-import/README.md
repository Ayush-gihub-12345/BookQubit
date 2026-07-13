# Bulk book import (Open Library -> D1)

One-time offline prep + a small always-on Cloudflare Worker that drips
imported books into the main app's D1 database a few thousand rows at a
time, resuming automatically where it left off.

## 1. Get the Open Library dumps

Download from https://openlibrary.org/developers/dumps:
- `ol_dump_authors_latest.txt.gz`
- `ol_dump_editions_latest.txt.gz`

## 2. Prepare chunk files (run locally)

```bash
pip install boto3
python prepare_import.py \
  --authors-dump ol_dump_authors_latest.txt.gz \
  --editions-dump ol_dump_editions_latest.txt.gz \
  --output-dir ./chunks \
  --chunk-size 2000 \
  --lang en
```

This filters to books with a title, ISBN, and a resolvable author name,
dedupes on ISBN, and writes `chunks/chunk-00001.jsonl`, `chunk-00002.jsonl`, etc.

Read the docstring at the top of `prepare_import.py` for the honest caveat
on `--min-rating` — Open Library's dump doesn't reliably carry rating data,
so that flag only does anything if you also pass `--ratings-file` with
rating data you've sourced separately.

## 3. Create an R2 bucket and upload the chunks

```bash
# one-time, from anywhere with wrangler installed and logged in
wrangler r2 bucket create bookqubit-import-queue

# get R2 API credentials: Cloudflare dashboard -> R2 -> Manage API tokens
export R2_ACCOUNT_ID=...
export R2_ACCESS_KEY_ID=...
export R2_SECRET_ACCESS_KEY=...
export R2_BUCKET=bookqubit-import-queue

python upload_to_r2.py --chunks-dir ./chunks --prefix import-queue
```

## 4. Deploy the cron worker (one-time)

```bash
cd cron-worker
npm install
npx wrangler deploy
```

That's it — it's now scheduled to run every 3 hours (`0 */3 * * *` in
`wrangler.jsonc`), each run importing up to `PER_RUN_CHUNKS` chunks
(default 5 x 2,000 rows = 10,000/run, ~80,000/day across 8 runs). Adjust
`PER_RUN_CHUNKS` or the cron schedule in `wrangler.jsonc` to change the pace
— keep the daily total comfortably under your D1 plan's write-row quota.

Progress is visible on the main app's `/admin` dashboard (reads the shared
`import_progress` D1 row this worker updates) — no need to check the worker
directly.

## 5. Test it without waiting for the schedule

```bash
cd cron-worker
npx wrangler dev
# then, in another terminal:
curl http://localhost:8787/run
```

Or after deploying: `curl https://bookqubit-import-cron.<your-subdomain>.workers.dev/run`

## Refreshing the queue later

Re-run steps 2-3 with a new dump to top up the queue — the worker re-reads
`import-queue/manifest.json` every run, so a larger `totalChunks` is picked
up automatically without redeploying anything.
