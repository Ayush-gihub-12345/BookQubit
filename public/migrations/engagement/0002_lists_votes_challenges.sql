-- Target: D1 `engagement`. Reader-made lists, review helpful-votes and replies, reading challenges.
-- ADDITIVE and idempotent. Apply:
--   npx wrangler d1 execute engagement --remote --file=migrations/engagement/0002_lists_votes_challenges.sql
-- Reader data lives here, never in the catalog database: the catalog stays books, authors and publishers, and a burst of
-- votes can never slow a book page's catalog reads. No cross-database foreign keys: user ids and book slugs are plain TEXT.

-- A reader-made list ("Best space operas"). item_count / vote_count are kept in step by the API so a list index never counts rows.
CREATE TABLE IF NOT EXISTS lists (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  user_name   TEXT,
  title       TEXT NOT NULL,
  description TEXT,
  item_count  INTEGER NOT NULL DEFAULT 0,
  vote_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lists_popular ON lists(vote_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lists_recent  ON lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lists_user    ON lists(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS list_items (
  list_id   TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  position  INTEGER NOT NULL,
  note      TEXT,
  added_at  TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (list_id, book_slug)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS idx_list_items_order ON list_items(list_id, position);
CREATE INDEX IF NOT EXISTS idx_list_items_book  ON list_items(book_slug);

CREATE TABLE IF NOT EXISTS list_votes (
  list_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (list_id, user_id)
) WITHOUT ROWID;

-- A review is the (book_slug, author_id) row on the accounts database's shelf table. Votes and replies hang off that pair.
CREATE TABLE IF NOT EXISTS review_votes (
  book_slug TEXT NOT NULL,
  author_id TEXT NOT NULL,
  voter_id  TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_slug, author_id, voter_id)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS review_replies (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  book_slug TEXT NOT NULL,
  author_id TEXT NOT NULL,
  user_id   TEXT NOT NULL,
  user_name TEXT,
  body      TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_review_replies_review ON review_replies(book_slug, author_id, created_at);
CREATE INDEX IF NOT EXISTS idx_review_replies_user   ON review_replies(user_id, created_at DESC);

-- Reading challenges a reader has joined. Progress is computed from the shelf, never stored.
CREATE TABLE IF NOT EXISTS reading_challenges (
  user_id TEXT NOT NULL,
  year    INTEGER NOT NULL,
  kind    TEXT NOT NULL CHECK (kind IN ('books','genres','countries','pages')),
  target  INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, year, kind)
) WITHOUT ROWID;
