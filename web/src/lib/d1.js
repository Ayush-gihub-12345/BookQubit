import { getCloudflareContext } from "@opennextjs/cloudflare";

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Execute a single query
 */
function resolveEnv(envOrRequest) {
  if (envOrRequest?.env) return envOrRequest.env;
  if (envOrRequest?.bookqubit_content || envOrRequest?.bookqubit_users || envOrRequest?.bookqubit_analytics) {
    return envOrRequest;
  }
  return getCloudflareContext().env;
}

function getBinding(envOrRequest, names) {
  const env = resolveEnv(envOrRequest);
  const db = names.map((name) => env?.[name]).find(Boolean);
  if (!db) {
    throw new Error(`D1 binding is not configured. Expected one of: ${names.join(", ")}`);
  }
  return db;
}

export function getContentDb(envOrRequest) {
  return getBinding(envOrRequest, ["bookqubit_content", "CONTENT_DB"]);
}

export function getUsersDb(envOrRequest) {
  return getBinding(envOrRequest, ["bookqubit_users", "USERS_DB"]);
}

export function getAnalyticsDb(envOrRequest) {
  return getBinding(envOrRequest, ["bookqubit_analytics", "ANALYTICS_DB"]);
}

export async function queryDB(env, sql, params = [], database = "users") {
  try {
    const db = database === "content"
      ? getContentDb(env)
      : database === "analytics"
        ? getAnalyticsDb(env)
        : getUsersDb(env);
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bound.all();
    return result.results || result;
  } catch (error) {
    console.error('DB Query Error:', error.message);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

/**
 * Execute a query and get first result
 */
export async function queryFirst(env, sql, params = [], database = "users") {
  try {
    const db = database === "content"
      ? getContentDb(env)
      : database === "analytics"
        ? getAnalyticsDb(env)
        : getUsersDb(env);
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bound.first();
    return result;
  } catch (error) {
    console.error('DB Query First Error:', error.message);
    return null;
  }
}

/**
 * Execute multiple statements as batch
 */
export async function executeBatch(env, statements, database = "users") {
  try {
    const db = database === "content"
      ? getContentDb(env)
      : database === "analytics"
        ? getAnalyticsDb(env)
        : getUsersDb(env);
    return await db.batch(statements);
  } catch (error) {
    console.error('Batch Error:', error.message);
    throw new Error(`Batch execution failed: ${error.message}`);
  }
}

// ============================================
// BOOKS OPERATIONS
// ============================================

/**
 * Get all books with pagination
 * @param {Object} env - Cloudflare environment
 * @param {number} limit - Results per page (default: 50)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<Array>} Books array
 */
export async function getBooks(env, limit = 50, offset = 0) {
  return await queryDB(
    env,
    'SELECT * FROM books WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    ['published', limit, offset],
    "content"
  );
}

/**
 * Get single book by slug
 */
export async function getBookBySlug(env, slug) {
  return await queryFirst(env, 'SELECT * FROM books WHERE canonical_slug = ?', [slug], "content");
}

/**
 * Get single book by ID
 */
export async function getBook(env, bookId) {
  return await queryFirst(env, 'SELECT * FROM books WHERE id = ?', [bookId], "content");
}

/**
 * Search books by title, author, or description
 */
export async function searchBooks(env, query, limit = 50) {
  return await queryDB(
    env,
    `SELECT b.* FROM books b
     LEFT JOIN authors a ON a.id = b.author_id
     WHERE (b.title LIKE ? OR a.name LIKE ? OR b.description LIKE ?) 
     AND status = ?
     ORDER BY b.created_at DESC 
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, `%${query}%`, 'published', limit],
    "content"
  );
}

/**
 * Get books by genre
 */
export async function getBooksByGenre(env, genre, limit = 50) {
  return await queryDB(
    env,
    `SELECT DISTINCT b.* FROM books b
     INNER JOIN metadata bg ON bg.entity_type = 'book' AND bg.entity_id = b.id
     WHERE bg.key IN ('genre', 'category') AND bg.value = ? AND b.status = ?
     ORDER BY b.created_at DESC
     LIMIT ?`,
    [genre, 'published', limit],
    "content"
  );
}

/**
 * Get books by author
 */
export async function getBooksByAuthor(env, author, limit = 50) {
  return await queryDB(
    env,
    `SELECT b.* FROM books b
     JOIN authors a ON a.id = b.author_id
     WHERE a.name = ? AND b.status = ? ORDER BY b.created_at DESC LIMIT ?`,
    [author, 'published', limit],
    "content"
  );
}

/**
 * Get top rated books
 */
export async function getTopRatedBooks(env, limit = 20) {
  return await queryDB(
    env,
    `SELECT * FROM books 
     WHERE status = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    ['published', limit],
    "content"
  );
}

/**
 * Get trending books (recently rated)
 */
export async function getTrendingBooks(env, limit = 20, days = 7) {
  return await queryDB(
    env,
    `SELECT * FROM books b
     WHERE b.status = ?
       AND b.created_at > datetime('now', '-' || ? || ' days')
     ORDER BY b.created_at DESC
     LIMIT ?`,
    ['published', days, limit],
    "content"
  );
}

/**
 * Get book with ratings
 */
export async function getBookWithRatings(env, bookId) {
  const book = await queryFirst(env, 'SELECT * FROM books WHERE id = ?', [bookId], "content");
  if (!book) return null;

  const ratings = await queryDB(
    env,
    `SELECT id, user_id, rating, review, created_at FROM ratings 
     WHERE book_id = ? 
     ORDER BY created_at DESC 
     LIMIT 10`,
    [bookId],
    "users"
  );

  return { ...book, ratings };
}

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get user by ID
 */
export async function getUser(env, userId) {
  return await queryFirst(env, 'SELECT * FROM users WHERE firebase_uid = ? OR id = ?', [userId, userId]);
}

/**
 * Get user by email
 */
export async function getUserByEmail(env, email) {
  return await queryFirst(env, 'SELECT * FROM users WHERE email = ?', [email]);
}

/**
 * Create new user
 */
export async function createUser(env, userData) {
  const { id, email, name, firebaseId, profilePic } = userData;
  
  return await queryDB(
    env,
    `INSERT INTO users (firebase_uid, email, display_name, avatar_url) 
     VALUES (?, ?, ?, ?)
     ON CONFLICT(firebase_uid) DO UPDATE SET
       email = COALESCE(excluded.email, email),
       display_name = COALESCE(excluded.display_name, display_name),
       avatar_url = COALESCE(excluded.avatar_url, avatar_url),
       last_login_at = CURRENT_TIMESTAMP`,
    [firebaseId || id, email, name, profilePic || null]
  );
}

/**
 * Update user profile
 */
export async function updateUserProfile(env, userId, updateData) {
  const { name, profilePic, language } = updateData;
  
  return await queryDB(
    env,
    `UPDATE users 
     SET display_name = COALESCE(?, display_name),
         avatar_url = COALESCE(?, avatar_url),
         preferred_language = COALESCE(?, preferred_language)
     WHERE firebase_uid = ? OR id = ?`,
    [name || null, profilePic || null, language || null, userId, userId]
  );
}

// ============================================
// RATINGS & REVIEWS
// ============================================

/**
 * Get all ratings for a book
 */
export async function getBookRatings(env, bookId) {
  return await queryDB(
    env,
    `SELECT r.*, u.display_name AS name, u.avatar_url AS profile_pic FROM ratings r
     LEFT JOIN users u ON r.user_id = u.firebase_uid
     WHERE r.book_id = ?
     ORDER BY r.created_at DESC`,
    [bookId]
  );
}

/**
 * Get user's rating for a book
 */
export async function getUserBookRating(env, userId, bookId) {
  return await queryFirst(
    env,
    'SELECT * FROM ratings WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
}

/**
 * Add or update rating
 */
export async function addRating(env, userId, bookId, rating, review = null) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  return await queryDB(
    env,
    `INSERT INTO ratings (user_id, book_id, rating, review)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, book_id) DO UPDATE SET
       rating = ?,
       review = ?,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, bookId, rating, review, rating, review]
  );
}

/**
 * Delete rating
 */
export async function deleteRating(env, userId, bookId) {
  return await queryDB(
    env,
    'DELETE FROM ratings WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
}

/**
 * Get user's ratings
 */
export async function getUserRatings(env, userId, limit = 50) {
  return await queryDB(
    env,
    `SELECT * FROM ratings
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
}

// ============================================
// COLLECTIONS
// ============================================

/**
 * Get user's collections
 */
export async function getUserCollections(env, userId) {
  return await queryDB(
    env,
    `SELECT * FROM collections 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );
}

/**
 * Get collection by ID
 */
export async function getCollection(env, collectionId) {
  return await queryFirst(env, 'SELECT * FROM collections WHERE id = ?', [collectionId]);
}

/**
 * Get collection with books
 */
export async function getCollectionWithBooks(env, collectionId) {
  const collection = await queryFirst(
    env,
    'SELECT * FROM collections WHERE id = ?',
    [collectionId]
  );

  if (!collection) return null;

  const books = await queryDB(
    env,
    `SELECT book_id, position FROM collection_books cb
     WHERE cb.collection_id = ?
     ORDER BY cb.position ASC`,
    [collectionId]
  );

  return { ...collection, books };
}

/**
 * Create collection
 */
export async function createCollection(env, userId, name, description = null, isPublic = false) {
  return await queryDB(
    env,
    `INSERT INTO collections (user_id, name, description, is_public)
     VALUES (?, ?, ?, ?)`,
    [userId, name, description, isPublic ? 1 : 0]
  );
}

/**
 * Add book to collection
 */
export async function addBookToCollection(env, collectionId, bookId) {
  return await queryDB(
    env,
    `INSERT INTO collection_books (collection_id, book_id)
     VALUES (?, ?)`,
    [collectionId, bookId]
  );
}

/**
 * Remove book from collection
 */
export async function removeBookFromCollection(env, collectionId, bookId) {
  return await queryDB(
    env,
    'DELETE FROM collection_books WHERE collection_id = ? AND book_id = ?',
    [collectionId, bookId]
  );
}

// ============================================
// READING STATUS
// ============================================

/**
 * Get user's reading status for a book
 */
export async function getUserReadingStatus(env, userId, bookId) {
  return await queryFirst(
    env,
    'SELECT * FROM reading_status WHERE user_id = ? AND book_id = ?',
    [userId, bookId]
  );
}

/**
 * Set reading status
 */
export async function setReadingStatus(env, userId, bookId, status, progressPercentage = 0) {
  return await queryDB(
    env,
    `INSERT INTO reading_status (user_id, book_id, status, progress_percentage)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, book_id) DO UPDATE SET
       status = ?,
       progress_percentage = ?,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, bookId, status, progressPercentage, status, progressPercentage]
  );
}

/**
 * Get user's currently reading books
 */
export async function getUserReadingBooks(env, userId) {
  return await queryDB(
    env,
    `SELECT * FROM reading_status rs
     WHERE rs.user_id = ? AND rs.status = 'reading'
     ORDER BY rs.updated_at DESC`,
    [userId]
  );
}

/**
 * Get user's completed books
 */
export async function getUserCompletedBooks(env, userId, limit = 50) {
  return await queryDB(
    env,
    `SELECT * FROM reading_status rs
     WHERE rs.user_id = ? AND rs.status = 'completed'
     ORDER BY rs.completed_at DESC
     LIMIT ?`,
    [userId, limit]
  );
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Track user event
 */
export async function trackEvent(env, userId, eventType, eventName = null, bookId = null, metadata = null) {
  return await queryDB(
    env,
    `INSERT INTO events (user_id, event_type, entity_type, entity_id, language)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, eventType, eventName || "book", bookId || null, metadata?.language || null],
    "analytics"
  );
}

/**
 * Get user's activity
 */
export async function getUserActivity(env, userId, days = 30) {
  return await queryDB(
    env,
    `SELECT * FROM events
     WHERE user_id = ? AND created_at > datetime('now', '-' || ? || ' days')
     ORDER BY created_at DESC`,
    [userId, days],
    "analytics"
  );
}

// ============================================
// SEARCH & DISCOVERY
// ============================================

/**
 * Advanced book search
 */
export async function advancedSearch(env, filters = {}) {
  let sql = 'SELECT * FROM books WHERE status = ?';
  const params = ['published'];

  if (filters.title) {
    sql += ' AND title LIKE ?';
    params.push(`%${filters.title}%`);
  }

  if (filters.language) {
    sql += ' AND language_source = ?';
    params.push(filters.language);
  }

  sql += ' ORDER BY created_at DESC LIMIT 100';

  return await queryDB(env, sql, params, "content");
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Add notification
 */
export async function addNotification(env, userId, type, title, message = null, link = null) {
  return await queryDB(
    env,
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, type, title, message, link]
  );
}

/**
 * Get user's unread notifications
 */
export async function getUnreadNotifications(env, userId) {
  return await queryDB(
    env,
    `SELECT * FROM notifications
     WHERE user_id = ? AND is_read = 0
     ORDER BY created_at DESC`,
    [userId]
  );
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(env, notificationId) {
  return await queryDB(
    env,
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [notificationId]
  );
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  queryDB,
  queryFirst,
  executeBatch,
  // Books
  getBooks,
  getBookBySlug,
  getBook,
  searchBooks,
  getBooksByGenre,
  getBooksByAuthor,
  getTopRatedBooks,
  getTrendingBooks,
  getBookWithRatings,
  // Users
  getUser,
  getUserByEmail,
  createUser,
  updateUserProfile,
  // Ratings
  getBookRatings,
  getUserBookRating,
  addRating,
  deleteRating,
  getUserRatings,
  // Collections
  getUserCollections,
  getCollection,
  getCollectionWithBooks,
  createCollection,
  addBookToCollection,
  removeBookFromCollection,
  // Reading Status
  getUserReadingStatus,
  setReadingStatus,
  getUserReadingBooks,
  getUserCompletedBooks,
  // Analytics
  trackEvent,
  getUserActivity,
  // Search
  advancedSearch,
  // Notifications
  addNotification,
  getUnreadNotifications,
  markNotificationAsRead,
};
