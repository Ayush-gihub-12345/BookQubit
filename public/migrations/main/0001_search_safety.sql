-- Target: D1 `database` (identity / social / moderation). ADDITIVE ONLY, idempotent.
--   npx wrangler d1 execute database --local --file=migrations/main/0001_search_safety.sql
-- High-write behaviour lives in `engagement`, user-written knowledge in `mindspace`
-- (see ARCHITECTURE_PLAN.md "Data layout") so they never contend with accounts.

-- Reader quotes keyword search (existing `quotes` table untouched).
CREATE VIRTUAL TABLE IF NOT EXISTS quotes_fts USING fts5(
  text, content='quotes', content_rowid='id'
);
CREATE TRIGGER IF NOT EXISTS quotes_fts_ai AFTER INSERT ON quotes BEGIN
  INSERT INTO quotes_fts(rowid, text) VALUES (new.id, new.text);
END;
CREATE TRIGGER IF NOT EXISTS quotes_fts_ad AFTER DELETE ON quotes BEGIN
  INSERT INTO quotes_fts(quotes_fts, rowid, text) VALUES ('delete', old.id, old.text);
END;
CREATE TRIGGER IF NOT EXISTS quotes_fts_au AFTER UPDATE ON quotes BEGIN
  INSERT INTO quotes_fts(quotes_fts, rowid, text) VALUES ('delete', old.id, old.text);
  INSERT INTO quotes_fts(rowid, text) VALUES (new.id, new.text);
END;

-- Safety and privacy
CREATE TABLE IF NOT EXISTS user_blocks (
  user_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'block' CHECK (kind IN ('block','mute')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_user_id)
);
CREATE INDEX IF NOT EXISTS idx_user_blocks_target ON user_blocks(target_user_id);

CREATE TABLE IF NOT EXISTS user_privacy (
  user_id TEXT PRIMARY KEY,
  hide_activity INTEGER DEFAULT 0,
  discoverable INTEGER DEFAULT 1,
  bio TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_content_reports_open ON content_reports(resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);

-- "Reading twins" joins shelf rows by book; without this index every join step scans the table.
CREATE INDEX IF NOT EXISTS idx_shelf_book ON shelf(book_slug);

-- Bookkeeping for the reader taste vector (the vector itself lives in Vectorize as `user:{id}`).
CREATE TABLE IF NOT EXISTS user_taste (
  user_id TEXT PRIMARY KEY,
  books_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
