PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    firebase_uid TEXT UNIQUE NOT NULL,

    email TEXT UNIQUE,

    username TEXT UNIQUE,

    display_name TEXT,

    avatar_url TEXT,

    preferred_language TEXT DEFAULT 'en',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    last_login_at DATETIME
);

CREATE TABLE IF NOT EXISTS user_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,

    interaction_type TEXT NOT NULL,

    value TEXT,

    metadata_json TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_insights (
    user_id INTEGER PRIMARY KEY,

    books_read INTEGER DEFAULT 0,

    books_saved INTEGER DEFAULT 0,

    books_rated INTEGER DEFAULT 0,

    favorite_author_id INTEGER,

    favorite_language TEXT,

    engagement_score REAL DEFAULT 0,

    last_activity_at DATETIME,

    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX idx_users_firebase
ON users(firebase_uid);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_interactions_user
ON user_interactions(user_id);

CREATE INDEX idx_interactions_entity
ON user_interactions(entity_type, entity_id);

CREATE INDEX idx_interactions_type
ON user_interactions(interaction_type);