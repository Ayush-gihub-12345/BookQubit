# Bulk book import (Open Library -> D1)

One-time offline prep + a small always-on Cloudflare Worker that drips
imported books (plus author and publisher stub pages) into the main app's
`catalog` D1 database a few thousand rows at a time, resuming automatically
where it left off. **No R2 or any other external storage — the whole queue
lives in D1 itself.**

## 1. Get the Open Library dumps

Download from https://openlibrary.org/developers/dumps:
- `ol_dump_authors_latest.txt.gz`
- `ol_dump_editions_latest.txt.gz`

## 2. Prepare the queue (run locally)

```bash
python prepare_import.py \
  --authors-dump ol_dump_authors_latest.txt.gz \
  --editions-dump ol_dump_editions_latest.txt.gz \
  --output-dir ./queue \
  --chunk-size 500 \
  --sql-batch-size 50 \
  --lang en
```

This filters to books with a title, ISBN, and a resolvable author name,
dedupes on ISBN, groups them into batches of `--chunk-size` books, and
writes out `queue/queue-00001.sql`, `queue-00002.sql`, etc. — each file is a
handful of `INSERT INTO import_chunks (...)` statements, one per batch of
books (not one per book). Each batch also carries author/publisher stubs
(name + slug, plus whatever birth year/bio/wikipedia link Open Library's
author dump has) for anyone newly seen in that batch — so every author and
publisher gets at least a bare profile page, not just plain text on the book.

Read the docstring at the top of `prepare_import.py` for the honest caveat
on `--min-rating` — Open Library's dump doesn't reliably carry rating data,
so that flag only does anything if you also pass `--ratings-file` with
rating data you've sourced separately.

## 3. Load the queue into D1

```bash
for f in queue/*.sql; do
  npx wrangler d1 execute catalog --remote --file="$f"
done
```

Note the database name here is `catalog`, not `database` — books/authors/
publishers/comics live in their own D1 database, split from user/social data.

This is cheap regardless of how many books are queued — you're writing one
row per *batch* of 500 books, not one row per book. Loading a queue of
100,000 books (200 batches) is 200 D1 writes, done in seconds.

## 4. Deploy the cron worker (one-time)

```bash
cd cron-worker
npm install
npx wrangler deploy
```

It's scheduled to run every 3 hours (`0 */3 * * *` in `wrangler.jsonc`),
each run consuming up to `PER_RUN_CHUNKS` unconsumed rows from
`import_chunks` (default 13 x 500 books x 8 runs/day ≈ 52,000 books/day —
adjust `PER_RUN_CHUNKS` or the cron schedule to change the pace, keeping the
daily total comfortably under your D1 plan's write-row quota).

Progress is visible on the main app's `/admin` dashboard (books imported,
author/publisher pages added, skipped duplicates, chunks processed, last
run, next scheduled run) — no need to check the worker directly.

## 5. Test it without waiting for the schedule

```bash
cd cron-worker
npx wrangler dev
# then, in another terminal:
curl http://localhost:8787/run
```

Or after deploying: `curl https://bookqubit-import-cron.<your-subdomain>.workers.dev/run`

## Refreshing the queue later

Re-run steps 2-3 with a new dump to top up the queue — new `import_chunks`
rows just get picked up in due course, no redeploy needed.
