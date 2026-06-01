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


CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id TEXT NOT NULL,
    book_id INTEGER NOT NULL,

    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS reading_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id TEXT NOT NULL,
    book_id INTEGER NOT NULL,

    status TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0,

    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    collection_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    UNIQUE(collection_id, book_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_book
ON ratings(book_id);

CREATE INDEX idx_ratings_user
ON ratings(user_id);

CREATE INDEX idx_reading_status_user
ON reading_status(user_id, status);

CREATE INDEX idx_collections_user
ON collections(user_id);

CREATE INDEX idx_collection_books_collection
ON collection_books(collection_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id, is_read);


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