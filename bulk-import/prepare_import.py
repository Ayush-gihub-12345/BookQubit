#!/usr/bin/env python3
"""
Prepares an Open Library bulk dump for import into BookQubit's D1 database.
No R2 or any external storage needed — the whole queue is staged directly in
D1 itself, as compact JSON-blob rows in the `import_chunks` table. Uploading
the queue is then just a handful of `wrangler d1 execute` calls (one row per
chunk of books, not one per book), which the daily cron worker expands into
real `books` rows over time at a controlled pace.

Two-pass streaming process (never loads the full dump into memory):
  1. Build an author-id -> name lookup from the (smaller) authors dump.
  2. Stream the editions dump, filter/dedupe/map each qualifying book, group
     them into fixed-size chunks, and write out ready-to-run .sql files
     (each containing several `INSERT INTO import_chunks ...` statements).

Rating filtering caveat (read this before relying on --min-rating):
  Open Library's bulk dump does NOT reliably include per-edition/work rating
  data — most entries were never rated on their site. This script can only
  filter by rating if you supply --ratings-file (a JSON map of
  { "OL12345W": 4.2, ... } you built separately, e.g. by cross-referencing a
  subset against Google Books). Without it, --min-rating has nothing to
  filter against and the script will import everything that otherwise
  qualifies (has a title, ISBN, and resolvable author) — it will NOT
  silently pretend to guarantee quality it can't actually check.

Usage:
  python prepare_import.py \
    --authors-dump ol_dump_authors_latest.txt.gz \
    --editions-dump ol_dump_editions_latest.txt.gz \
    --output-dir ./queue \
    --chunk-size 500 \
    --sql-batch-size 50 \
    --min-rating 3.5 \
    --ratings-file ratings.json \
    --lang en

Then load the queue into D1 (see README.md for the loop command):
  for f in queue/*.sql; do
    npx wrangler d1 execute database --remote --file="$f"
  done
"""

import argparse
import gzip
import json
import re
import sys
from pathlib import Path


def slugify(title, isbn):
    base = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")[:60]
    suffix = (isbn or "")[-6:]
    return f"{base}-{suffix}" if suffix else base


def build_author_map(authors_dump_path):
    """First pass: author key -> name. The authors dump is much smaller than
    editions, so this is safe to hold fully in memory (a few hundred MB at
    most even for the complete Open Library author list)."""
    authors = {}
    opener = gzip.open if authors_dump_path.endswith(".gz") else open
    with opener(authors_dump_path, "rt", encoding="utf-8") as f:
        for line in f:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 5:
                continue
            try:
                data = json.loads(parts[4])
            except json.JSONDecodeError:
                continue
            key = data.get("key")
            name = data.get("name")
            if key and name:
                authors[key] = name
    return authors


def load_ratings(ratings_file):
    if not ratings_file:
        return {}
    with open(ratings_file, "r", encoding="utf-8") as f:
        return json.load(f)


def map_edition(data, authors, lang):
    title = data.get("title")
    isbns = data.get("isbn_13") or data.get("isbn_10") or []
    isbn = isbns[0] if isbns else None
    if not title or not isbn:
        return None

    author_keys = [a.get("key") for a in data.get("authors", []) if a.get("key")]
    author_names = [authors[k] for k in author_keys if k in authors]
    if not author_names:
        return None  # skip books we can't attribute to a real author name

    cover_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"
    subjects = data.get("subjects", [])[:8]

    return {
        "slug": slugify(title, isbn),
        "lang": lang,
        "title": title,
        "author": ", ".join(author_names[:3]),
        "publisher": (data.get("publishers") or [None])[0],
        "isbn": isbn,
        "published": data.get("publish_date"),
        "page_count": data.get("number_of_pages"),
        "format": data.get("physical_format"),
        "category": subjects[0] if subjects else None,
        "subjects": subjects,
        "cover_url": cover_url,
        "source": "open_library",
        "work_key": (data.get("works") or [{}])[0].get("key"),
    }


def sql_escape(text):
    """Standard SQL string-literal escaping (double up single quotes)."""
    return text.replace("'", "''")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--authors-dump", required=True)
    ap.add_argument("--editions-dump", required=True)
    ap.add_argument("--output-dir", required=True)
    ap.add_argument("--chunk-size", type=int, default=500, help="Books per import_chunks row")
    ap.add_argument("--sql-batch-size", type=int, default=50, help="Chunk-rows per output .sql file")
    ap.add_argument("--min-rating", type=float, default=None)
    ap.add_argument("--ratings-file", default=None, help="JSON map of work_key -> average rating")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--limit", type=int, default=None, help="Stop after this many qualifying books (for testing)")
    args = ap.parse_args()

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Building author lookup from {args.authors_dump} ...", file=sys.stderr)
    authors = build_author_map(args.authors_dump)
    print(f"  {len(authors):,} authors loaded.", file=sys.stderr)

    ratings = load_ratings(args.ratings_file)
    if args.min_rating and not ratings:
        print(
            "WARNING: --min-rating set but no --ratings-file provided — "
            "Open Library's dump has no reliable rating data to filter on, "
            "so no rating filter will actually be applied.",
            file=sys.stderr,
        )

    seen_isbns = set()
    book_chunk = []          # current group of books becoming one import_chunks row
    sql_statements = []      # current group of INSERT statements becoming one .sql file
    file_index = 0
    total_kept = 0
    total_skipped_dupe = 0
    total_skipped_norating = 0
    total_chunk_rows = 0

    def flush_sql_file():
        nonlocal sql_statements, file_index
        if not sql_statements:
            return
        file_index += 1
        path = out_dir / f"queue-{file_index:05d}.sql"
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(sql_statements) + "\n")
        sql_statements = []

    def flush_book_chunk():
        nonlocal book_chunk, total_chunk_rows
        if not book_chunk:
            return
        blob = sql_escape(json.dumps(book_chunk, ensure_ascii=False))
        sql_statements.append(
            f"INSERT INTO import_chunks (chunk_data, row_count) VALUES ('{blob}', {len(book_chunk)});"
        )
        total_chunk_rows += 1
        book_chunk = []
        if len(sql_statements) >= args.sql_batch_size:
            flush_sql_file()

    opener = gzip.open if args.editions_dump.endswith(".gz") else open
    print(f"Streaming editions from {args.editions_dump} ...", file=sys.stderr)
    with opener(args.editions_dump, "rt", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if args.limit and total_kept >= args.limit:
                break
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 5:
                continue
            try:
                data = json.loads(parts[4])
            except json.JSONDecodeError:
                continue

            row = map_edition(data, authors, args.lang)
            if not row:
                continue
            if row["isbn"] in seen_isbns:
                total_skipped_dupe += 1
                continue

            if args.min_rating and ratings:
                work_rating = ratings.get(row["work_key"])
                if work_rating is None or work_rating < args.min_rating:
                    total_skipped_norating += 1
                    continue

            seen_isbns.add(row["isbn"])
            row.pop("source", None)
            row.pop("work_key", None)  # only needed for the rating cross-check above, not for import
            book_chunk.append(row)
            total_kept += 1
            if len(book_chunk) >= args.chunk_size:
                flush_book_chunk()

            if i % 200000 == 0:
                print(f"  ...{i:,} lines scanned, {total_kept:,} kept", file=sys.stderr)

    flush_book_chunk()
    flush_sql_file()

    print("\nDone.", file=sys.stderr)
    print(f"  Kept:              {total_kept:,}", file=sys.stderr)
    print(f"  Skipped (dupe):    {total_skipped_dupe:,}", file=sys.stderr)
    print(f"  Skipped (rating):  {total_skipped_norating:,}", file=sys.stderr)
    print(f"  Chunk rows:        {total_chunk_rows:,} (~{args.chunk_size} books each)", file=sys.stderr)
    print(f"  SQL files written: {file_index} in {out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
