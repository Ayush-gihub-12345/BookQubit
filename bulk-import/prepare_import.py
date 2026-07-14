#!/usr/bin/env python3
"""
Prepares an Open Library bulk dump for import into BookQubit's D1 database.
No R2 or any external storage needed — the whole queue is staged directly in
D1 itself, as compact JSON-blob rows in the `import_chunks` table. Uploading
the queue is then just a handful of `wrangler d1 execute` calls (one row per
chunk of books, not one per book), which the daily cron worker expands into
real `books`/`authors`/`publications` rows over time at a controlled pace.

Each chunk now carries three lists — books, author stubs, and publisher
stubs — so a single import pass gives every author/publisher at least a
bare profile page (name + slug), not just plain text on the book. Author
stubs pull whatever birth year/bio/wikipedia link Open Library's authors
dump actually has (often nothing) — publisher "profiles" are name-only,
since Open Library has no separate publisher entity to draw a bio from.

Two-pass streaming process (never loads the full dump into memory):
  1. Build an author-id -> {name, birth_year, bio, wikipedia_url} lookup
     from the (smaller) authors dump.
  2. Stream the editions dump, filter/dedupe/map each qualifying book, group
     them into fixed-size chunks (each chunk also carries whichever new
     authors/publishers were first seen since the last chunk), and write out
     ready-to-run .sql files (each containing several
     `INSERT INTO import_chunks ...` statements).

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
    npx wrangler d1 execute catalog --remote --file="$f"
  done
"""

import argparse
import gzip
import json
import re
import sys
from pathlib import Path


def slugify(name, suffix_source="", max_len=60):
    base = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")[:max_len]
    # suffix_source is often a raw ISBN or an Open Library key like
    # "/authors/OL1A" — strip non-alphanumerics before taking the tail so a
    # slash/colon in the source never leaks into the slug.
    clean_suffix = re.sub(r"[^a-zA-Z0-9]", "", suffix_source or "")
    suffix = clean_suffix[-6:]
    return f"{base}-{suffix}".lower() if suffix else base


def extract_text(field):
    """Open Library text fields are sometimes a plain string, sometimes
    {"type": "/type/text", "value": "..."} — normalize to a plain string."""
    if isinstance(field, dict):
        return field.get("value")
    return field


def extract_birth_year(birth_date):
    """birth_date is free text ("7 December 1902", "circa 1900", "1902-12-07")
    — pull out the first plausible 4-digit year, or None if there isn't one."""
    if not birth_date:
        return None
    m = re.search(r"\b(1[5-9]\d{2}|20[0-2]\d)\b", str(birth_date))
    return int(m.group(1)) if m else None


def build_author_map(authors_dump_path):
    """First pass: author key -> {name, slug, birth_year, bio, wikipedia_url}.
    The authors dump is much smaller than editions, so this is safe to hold
    fully in memory (a few hundred MB at most even for the complete
    Open Library author list)."""
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
            if not key or not name:
                continue
            authors[key] = {
                "name": name,
                "slug": slugify(name, key),
                "birth_year": extract_birth_year(data.get("birth_date")),
                "bio": extract_text(data.get("bio")),
                "wikipedia_url": data.get("wikipedia"),
            }
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
    resolved_authors = [authors[k] for k in author_keys if k in authors]
    if not resolved_authors:
        return None  # skip books we can't attribute to a real author name

    publisher = (data.get("publishers") or [None])[0]
    cover_url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"
    subjects = data.get("subjects", [])[:8]

    return {
        "slug": slugify(title, isbn),
        "lang": lang,
        "title": title,
        "author": ", ".join(a["name"] for a in resolved_authors[:3]),
        "publisher": publisher,
        "isbn": isbn,
        "published": data.get("publish_date"),
        "page_count": data.get("number_of_pages"),
        "format": data.get("physical_format"),
        "category": subjects[0] if subjects else None,
        "subjects": subjects,
        "cover_url": cover_url,
        "work_key": (data.get("works") or [{}])[0].get("key"),
        # Carried through only to emit author/publisher stubs below —
        # stripped from the book record itself before it's queued.
        "_author_keys": author_keys,
        "_publisher_name": publisher,
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
    seen_author_keys = set()
    seen_publishers = set()  # normalized (lowercased/stripped) name -> already queued

    book_chunk = []          # current group of books becoming one import_chunks row
    pending_authors = []     # newly-seen author stubs since the last flush
    pending_publications = []  # newly-seen publisher stubs since the last flush
    sql_statements = []      # current group of INSERT statements becoming one .sql file
    file_index = 0
    total_kept = 0
    total_skipped_dupe = 0
    total_skipped_norating = 0
    total_chunk_rows = 0
    total_authors_queued = 0
    total_publishers_queued = 0

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
        nonlocal book_chunk, pending_authors, pending_publications, total_chunk_rows
        if not book_chunk:
            return
        payload = {
            "books": book_chunk,
            "authors": pending_authors,
            "publications": pending_publications,
        }
        blob = sql_escape(json.dumps(payload, ensure_ascii=False))
        row_count = len(book_chunk) + len(pending_authors) + len(pending_publications)
        sql_statements.append(
            f"INSERT INTO import_chunks (chunk_data, row_count) VALUES ('{blob}', {row_count});"
        )
        total_chunk_rows += 1
        book_chunk = []
        pending_authors = []
        pending_publications = []
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

            # Emit author stubs for any author on this book we haven't queued yet.
            for key in row["_author_keys"]:
                if key in seen_author_keys or key not in authors:
                    continue
                seen_author_keys.add(key)
                a = authors[key]
                pending_authors.append({
                    "slug": a["slug"], "lang": args.lang, "name": a["name"],
                    "birth_year": a["birth_year"], "bio": a["bio"], "wikipedia_url": a["wikipedia_url"],
                })
                total_authors_queued += 1

            # Emit a name-only publisher stub the first time each publisher appears.
            publisher_name = row["_publisher_name"]
            if publisher_name:
                norm = publisher_name.strip().lower()
                if norm not in seen_publishers:
                    seen_publishers.add(norm)
                    pending_publications.append({
                        "slug": slugify(publisher_name), "lang": args.lang, "name": publisher_name.strip(),
                    })
                    total_publishers_queued += 1

            row.pop("work_key", None)  # only needed for the rating cross-check above, not for import
            row.pop("_author_keys", None)
            row.pop("_publisher_name", None)
            book_chunk.append(row)
            total_kept += 1
            if len(book_chunk) >= args.chunk_size:
                flush_book_chunk()

            if i % 200000 == 0:
                print(f"  ...{i:,} lines scanned, {total_kept:,} kept", file=sys.stderr)

    flush_book_chunk()
    flush_sql_file()

    print("\nDone.", file=sys.stderr)
    print(f"  Books kept:          {total_kept:,}", file=sys.stderr)
    print(f"  Skipped (dupe):      {total_skipped_dupe:,}", file=sys.stderr)
    print(f"  Skipped (rating):    {total_skipped_norating:,}", file=sys.stderr)
    print(f"  Author stubs:        {total_authors_queued:,}", file=sys.stderr)
    print(f"  Publisher stubs:     {total_publishers_queued:,}", file=sys.stderr)
    print(f"  Chunk rows:          {total_chunk_rows:,} (~{args.chunk_size} books each)", file=sys.stderr)
    print(f"  SQL files written:   {file_index} in {out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
