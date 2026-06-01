PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_type TEXT NOT NULL,

    entity_type TEXT,
    entity_id INTEGER,

    user_id INTEGER,

    country TEXT,

    language TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    query TEXT NOT NULL,

    user_id INTEGER,

    language TEXT,

    results_count INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type
ON events(event_type);

CREATE INDEX idx_events_entity
ON events(entity_type, entity_id);

CREATE INDEX idx_events_user
ON events(user_id);

CREATE INDEX idx_events_created
ON events(created_at);

CREATE INDEX idx_search_query
ON searches(query);

CREATE INDEX idx_search_user
ON searches(user_id);

CREATE INDEX idx_search_created
ON searches(created_at);