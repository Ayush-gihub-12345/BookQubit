-- Target: D1 `mindspace`: user-written knowledge (spaces, nodes, edges). Separate from
-- accounts and the catalog: it grows with user content, takes bursts of small writes, and
-- is read publicly (SEO) for public spaces. ADDITIVE, idempotent. Apply locally:
--   npx wrangler d1 execute mindspace --local --file=migrations/mindspace/0001_mindspace.sql

CREATE TABLE IF NOT EXISTS mindspace_spaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  owner_name TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  node_count INTEGER NOT NULL DEFAULT 0,
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
