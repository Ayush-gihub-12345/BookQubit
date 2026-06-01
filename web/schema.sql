-- BookQubit D1 Database Schema
-- SQLite database for Cloudflare D1
-- Created for: BookQubit Platform

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_pic TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'moderator')),
  firebase_id TEXT UNIQUE,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'dark',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  summary TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  cover_url TEXT,
  cover_id TEXT,
  affiliate_link TEXT,
  isbn TEXT,
  publication_year INTEGER,
  pages INTEGER,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'available' CHECK(status IN ('available', 'unavailable', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. BOOK GENRES
-- ============================================
CREATE TABLE IF NOT EXISTS book_genres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  genre TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id, genre)
);

-- ============================================
-- 4. BOOK SUBJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS book_subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id, subject)
);

-- ============================================
-- 5. BOOK TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS book_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id, tag)
);

-- ============================================
-- 6. BOOK TRANSLATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS book_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id, language)
);

-- ============================================
-- 7. AUTHORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. USER COLLECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT 0,
  cover_image TEXT,
  book_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 9. COLLECTION BOOKS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS collection_books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  position INTEGER,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(collection_id, book_id)
);

-- ============================================
-- 10. USER RATINGS & REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_id INTEGER NOT NULL,
  rating REAL NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(user_id, book_id)
);

-- ============================================
-- 11. USER READING STATUS
-- ============================================
CREATE TABLE IF NOT EXISTS reading_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('reading', 'completed', 'want_to_read', 'dropped')),
  progress_percentage INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(user_id, book_id)
);

-- ============================================
-- 12. BOOKMARKS (User Highlights/Bookmarks)
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_id INTEGER NOT NULL,
  page_number INTEGER,
  quote TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================
-- 13. ANALYTICS & EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  event_type TEXT NOT NULL,
  event_name TEXT,
  book_id INTEGER,
  metadata TEXT,
  user_agent TEXT,
  ip_address TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
);

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 15. USER FOLLOWS (Social Feature)
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- ============================================
-- 16. RECOMMENDATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_id INTEGER NOT NULL,
  score REAL NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ============================================
-- 17. SEARCH HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  query TEXT NOT NULL,
  results_count INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_id ON users(firebase_id);

-- Ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_book ON ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_books_book ON collection_books(book_id);

-- Reading status indexes
CREATE INDEX IF NOT EXISTS idx_reading_status_user ON reading_status(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_status_status ON reading_status(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON recommendations(score DESC);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Top Rated Books
CREATE VIEW IF NOT EXISTS top_rated_books AS
SELECT 
  b.id,
  b.title,
  b.author,
  b.slug,
  b.rating,
  b.review_count,
  b.cover_url,
  AVG(r.rating) as avg_rating
FROM books b
LEFT JOIN ratings r ON b.id = r.book_id
GROUP BY b.id
ORDER BY b.rating DESC
LIMIT 100;

-- View: Popular Books
CREATE VIEW IF NOT EXISTS popular_books AS
SELECT 
  b.id,
  b.title,
  b.author,
  b.slug,
  COUNT(r.id) as total_ratings,
  COUNT(rs.id) as reading_count,
  b.cover_url
FROM books b
LEFT JOIN ratings r ON b.id = r.book_id
LEFT JOIN reading_status rs ON b.id = rs.book_id
GROUP BY b.id
ORDER BY total_ratings DESC;

-- View: User Activity
CREATE VIEW IF NOT EXISTS user_activity AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(DISTINCT rs.id) as books_read,
  COUNT(DISTINCT r.id) as reviews_written,
  COUNT(DISTINCT c.id) as collections_created,
  MAX(a.timestamp) as last_activity
FROM users u
LEFT JOIN reading_status rs ON u.id = rs.user_id AND rs.status = 'completed'
LEFT JOIN ratings r ON u.id = r.user_id
LEFT JOIN collections c ON u.id = c.user_id
LEFT JOIN analytics a ON u.id = a.user_id
GROUP BY u.id;

-- ============================================
-- END OF SCHEMA
-- ============================================
