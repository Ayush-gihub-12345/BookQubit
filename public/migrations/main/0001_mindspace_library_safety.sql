-- Target: D1 `database` (user/social data). ADDITIVE ONLY — no existing table is
-- altered or dropped. Idempotent. Apply locally first:
--   npx wrangler d1 execute database --local --file=migrations/main/0001_mindspace_library_safety.sql

-- ───────── MindSpace knowledge graph ─────────
CREATE TABLE IF NOT EXISTS mindspace_spaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ms_spaces_user ON mindspace_spaces(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ms_spaces_public ON mindspace_spaces(visibility, updated_at DESC);

CREATE TABLE IF NOT EXISTS mindspace_nodes (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL,
  parent_id TEXT,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'note' CHECK (kind IN ('note','book','quote','link','question','audio')),
  title TEXT,
  body TEXT,
  book_slug TEXT,
  url TEXT,
  meta TEXT,
  pos_x REAL,
  pos_y REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ms_nodes_space ON mindspace_nodes(space_id);
CREATE INDEX IF NOT EXISTS idx_ms_nodes_parent ON mindspace_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_ms_nodes_user ON mindspace_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_ms_nodes_book ON mindspace_nodes(book_slug);

CREATE TABLE IF NOT EXISTS mindspace_edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id TEXT NOT NULL,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  relation_type TEXT NOT NULL DEFAULT 'related',
  weight REAL NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (source_node_id, target_node_id, relation_type)
);
CREATE INDEX IF NOT EXISTS idx_ms_edges_space ON mindspace_edges(space_id);
CREATE INDEX IF NOT EXISTS idx_ms_edges_src ON mindspace_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_ms_edges_tgt ON mindspace_edges(target_node_id);

-- Keyword search over nodes (external-content FTS5, kept in sync by triggers).
CREATE VIRTUAL TABLE IF NOT EXISTS mindspace_nodes_fts USING fts5(
  title, body, content='mindspace_nodes', content_rowid='rowid'
);
CREATE TRIGGER IF NOT EXISTS mindspace_nodes_ai AFTER INSERT ON mindspace_nodes BEGIN
  INSERT INTO mindspace_nodes_fts(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;
CREATE TRIGGER IF NOT EXISTS mindspace_nodes_ad AFTER DELETE ON mindspace_nodes BEGIN
  INSERT INTO mindspace_nodes_fts(mindspace_nodes_fts, rowid, title, body) VALUES ('delete', old.rowid, old.title, old.body);
END;
CREATE TRIGGER IF NOT EXISTS mindspace_nodes_au AFTER UPDATE ON mindspace_nodes BEGIN
  INSERT INTO mindspace_nodes_fts(mindspace_nodes_fts, rowid, title, body) VALUES ('delete', old.rowid, old.title, old.body);
  INSERT INTO mindspace_nodes_fts(rowid, title, body) VALUES (new.rowid, new.title, new.body);
END;

-- ───────── Quotes keyword search (existing `quotes` table untouched) ─────────
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

-- ───────── Library: custom shelves, reading log, audio checkpoints ─────────
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
  status TEXT NOT NULL DEFAULT 'queued',
  total INTEGER DEFAULT 0,
  done INTEGER DEFAULT 0,
  matched INTEGER DEFAULT 0,
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON import_jobs(user_id, created_at DESC);

-- ───────── Community safety & privacy ─────────
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
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_taste (
  user_id TEXT PRIMARY KEY,
  books_count INTEGER DEFAULT 0,
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
