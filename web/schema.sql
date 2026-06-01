-- Core Content Tables
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT, -- e.g., 'FaBook'
    type TEXT NOT NULL, -- 'genre', 'region', 'collection', 'format'
    is_featured BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    genre_name TEXT NOT NULL,
    PRIMARY KEY (book_id, genre_name)
);

CREATE TABLE IF NOT EXISTS book_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    PRIMARY KEY (book_id, subject_name)
);

CREATE TABLE IF NOT EXISTS book_keypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    key_point TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    PRIMARY KEY (book_id, tag_name)
);

CREATE TABLE IF NOT EXISTS related_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    related_book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    relationship_type TEXT, -- 'series', 'similar', 'author_other_works', 'same_genre'
    reason TEXT,
    display_order INTEGER DEFAULT 0,
    UNIQUE(book_id, related_book_id)
);

CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    image_url TEXT,
    website TEXT
);

CREATE TABLE IF NOT EXISTS publishers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT
);

CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER REFERENCES authors(id),
    publisher_id INTEGER REFERENCES publishers(id),
    title TEXT NOT NULL,
    original_title TEXT,
    canonical_slug TEXT UNIQUE NOT NULL,
    description TEXT,
    summary TEXT,
    cover_url TEXT,
    isbn TEXT UNIQUE,
    language_source TEXT DEFAULT 'en',
    book_type TEXT DEFAULT 'physical', -- 'physical', 'ebook', 'audio'
    page_count INTEGER,
    published_year INTEGER,
    original_published_year INTEGER,
    format TEXT, -- 'Paperback', 'Hardcover', 'eBook', etc.
    base_price REAL,
    rating REAL DEFAULT 0, -- average rating 1-5
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
    affiliate_amazon_link TEXT,
    affiliate_goodreads_link TEXT,
    affiliate_audible_link TEXT,
    audio_link TEXT,
    country_of_origin TEXT,
    continent TEXT,
    sub_region TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Multilingual Layer
CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- 'book', 'author', 'publication'
    entity_id INTEGER NOT NULL,
    language_code TEXT NOT NULL,
    translated_title TEXT,
    translated_slug TEXT,
    seo_title TEXT,
    seo_description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL, -- 'like', 'comment', 'achievement', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_link TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Flexible Metadata (EAV Pattern)
CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL
);

-- ============================================================
-- USERS DATABASE (bookqubit_users)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferred_language TEXT DEFAULT 'en',
    preferred_theme TEXT DEFAULT 'light',
    is_active BOOLEAN DEFAULT 1,
    email_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    reading_level TEXT, -- 'beginner', 'intermediate', 'advanced'
    favorite_genres TEXT, -- JSON array as string
    favorite_languages TEXT, -- JSON array as string
    about_me TEXT,
    location TEXT,
    website TEXT,
    social_links TEXT, -- JSON object as string
    reading_goals INTEGER, -- annual reading goal
    preferred_book_format TEXT, -- 'physical', 'ebook', 'audio'
    notification_preferences TEXT, -- JSON object
    privacy_level TEXT DEFAULT 'public', -- 'public', 'private', 'friends_only'
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id),
    status TEXT NOT NULL, -- 'want_to_read', 'reading', 'completed', 'dropped'
    rating INTEGER, -- 1-5
    review TEXT,
    personal_notes TEXT,
    pages_read INTEGER,
    reading_started_at DATETIME,
    reading_completed_at DATETIME,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id),
    interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'highlight', 'comment'
    interaction_data TEXT, -- JSON for storing extra context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    book_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_collection_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER REFERENCES user_collections(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_books_read INTEGER DEFAULT 0,
    total_pages_read INTEGER DEFAULT 0,
    favorite_genre TEXT,
    favorite_author TEXT,
    average_rating REAL,
    reading_streak_days INTEGER DEFAULT 0,
    last_reading_date DATETIME,
    streak_start_date DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ANALYTICS DATABASE (bookqubit_analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'page_view', 'book_search', 'book_view', 'rating_submitted', 'review_posted', etc.
    entity_type TEXT, -- 'book', 'author', 'collection'
    entity_id INTEGER,
    source TEXT, -- 'web', 'mobile', 'api'
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    metadata TEXT, -- JSON for additional context
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    search_category TEXT, -- 'books', 'authors', 'publishers', 'general'
    result_count INTEGER,
    language_filter TEXT,
    sort_by TEXT,
    applied_filters TEXT, -- JSON
    clicked_result_id INTEGER, -- if user clicked a result
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    duration_seconds INTEGER,
    session_id TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    os TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_seconds INTEGER,
    page_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS content_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- 'book', 'author', 'publisher'
    entity_id INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    average_rating REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS trending_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER UNIQUE REFERENCES books(id),
    trend_score REAL,
    view_count_7d INTEGER,
    view_count_30d INTEGER,
    rating_count_7d INTEGER,
    review_count_7d INTEGER,
    last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id),
    recommendation_type TEXT, -- 'collaborative', 'content_based', 'trending', 'personalized'
    score REAL,
    reason TEXT,
    clicked BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    clicked_at DATETIME
);