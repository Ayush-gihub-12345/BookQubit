-- Target: D1 `engagement`: high-write reader behaviour, kept apart from accounts and the
-- catalog so a burst of progress writes can never slow logins or book pages (D1 serialises
-- writes per database). ADDITIVE, idempotent. Apply locally:
--   npx wrangler d1 execute engagement --local --file=migrations/engagement/0001_engagement.sql
-- No cross-database foreign keys: user_id / book_slug are plain TEXT references.

CREATE TABLE IF NOT EXISTS custom_shelves (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_custom_shelves_user ON custom_shelves(user_id);

CREATE TABLE IF NOT EXISTS custom_shelf_items (
  shelf_id TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (shelf_id, book_slug)
);

-- Event log: one row per logged session (not per page turn). Source of truth for history.
CREATE TABLE IF NOT EXISTS reading_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'progress' CHECK (kind IN ('start','progress','finish','audio')),
  pages INTEGER,
  percent REAL,
  audio_seconds INTEGER,
  logged_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reading_log_user ON reading_log(user_id, logged_at DESC);

-- One row per user per day. Stats, streaks and the heatmap read THIS (a year is at most 366
-- rows), never a scan of reading_log. Upserted by each log write.
CREATE TABLE IF NOT EXISTS daily_activity (
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  pages INTEGER NOT NULL DEFAULT 0,
  audio_seconds INTEGER NOT NULL DEFAULT 0,
  books_finished INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

CREATE TABLE IF NOT EXISTS audio_checkpoints (
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'summary',
  position_seconds REAL NOT NULL DEFAULT 0,
  speed REAL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_slug, kind)
);

CREATE TABLE IF NOT EXISTS audio_bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  position_seconds REAL NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audio_bm_user ON audio_bookmarks(user_id, book_slug);

CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'goodreads_csv',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  total INTEGER DEFAULT 0,
  done INTEGER DEFAULT 0,
  matched INTEGER DEFAULT 0,
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON import_jobs(user_id, created_at DESC);

-- Rows staged by an import so a 5,000-row CSV is processed in small queue batches.
CREATE TABLE IF NOT EXISTS import_rows (
  job_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (job_id, seq)
);
