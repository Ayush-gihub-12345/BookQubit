/**
 * D1 Database Service Layer
 * Helper functions for all database operations in BookQubit
 * 
 * Usage:
 * import { getBooks, searchBooks, addRating } from '@/lib/d1';
 * const books = await getBooks(env, 20, 0);
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Execute a single query
 */
export async function queryDB(env, sql, params = []) {
  try {
    if (!env.DB) {
      console.warn('DB not available - using fallback');
      return [];
    }
    const stmt = env.DB.prepare(sql);
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
export async function queryFirst(env, sql, params = []) {
  try {
    if (!env.DB) {
      console.warn('DB not available');
      return null;
    }
    const stmt = env.DB.prepare(sql);
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
export async function executeBatch(env, statements) {
  try {
    if (!env.DB) {
      throw new Error('DB not available');
    }
    const batch = env.DB.batch(statements);
    return await batch;
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
    ['available', limit, offset]
  );
}

/**
 * Get single book by slug
 */
export async function getBookBySlug(env, slug) {
  return await queryFirst(env, 'SELECT * FROM books WHERE slug = ?', [slug]);
}

/**
 * Get single book by ID
 */
export async function getBook(env, bookId) {
  return await queryFirst(env, 'SELECT * FROM books WHERE id = ?', [bookId]);
}

/**
 * Search books by title, author, or description
 */
export async function searchBooks(env, query, limit = 50) {
  return await queryDB(
    env,
    `SELECT * FROM books 
     WHERE (title LIKE ? OR author LIKE ? OR description LIKE ?) 
     AND status = ?
     ORDER BY rating DESC 
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, `%${query}%`, 'available', limit]
  );
}

/**
 * Get books by genre
 */
export async function getBooksByGenre(env, genre, limit = 50) {
  return await queryDB(
    env,
    `SELECT DISTINCT b.* FROM books b
     INNER JOIN book_genres bg ON b.id = bg.book_id
     WHERE bg.genre = ? AND b.status = ?
     ORDER BY b.rating DESC
     LIMIT ?`,
    [genre, 'available', limit]
  );
}

/**
 * Get books by author
 */
export async function getBooksByAuthor(env, author, limit = 50) {
  return await queryDB(
    env,
    'SELECT * FROM books WHERE author = ? AND status = ? ORDER BY created_at DESC LIMIT ?',
    [author, 'available', limit]
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
     ORDER BY rating DESC, review_count DESC 
     LIMIT ?`,
    ['available', limit]
  );
}

/**
 * Get trending books (recently rated)
 */
export async function getTrendingBooks(env, limit = 20, days = 7) {
  return await queryDB(
    env,
    `SELECT DISTINCT b.* FROM books b
     INNER JOIN ratings r ON b.id = r.book_id
     WHERE b.status = ? AND r.created_at > datetime('now', '-' || ? || ' days')
     ORDER BY b.rating DESC
     LIMIT ?`,
    ['available', days, limit]
  );
}

/**
 * Get book with ratings
 */
export async function getBookWithRatings(env, bookId) {
  const book = await queryFirst(env, 'SELECT * FROM books WHERE id = ?', [bookId]);
  if (!book) return null;

  const ratings = await queryDB(
    env,
    `SELECT id, user_id, rating, review, created_at FROM ratings 
     WHERE book_id = ? 
     ORDER BY created_at DESC 
     LIMIT 10`,
    [bookId]
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
  return await queryFirst(env, 'SELECT * FROM users WHERE id = ?', [userId]);
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
    `INSERT INTO users (id, email, name, firebase_id, profile_pic) 
     VALUES (?, ?, ?, ?, ?)`,
    [id, email, name, firebaseId, profilePic || null]
  );
}

/**
 * Update user profile
 */
export async function updateUserProfile(env, userId, updateData) {
  const { name, bio, profilePic, language, theme } = updateData;
  
  return await queryDB(
    env,
    `UPDATE users 
     SET name = COALESCE(?, name),
         bio = COALESCE(?, bio),
         profile_pic = COALESCE(?, profile_pic),
         language = COALESCE(?, language),
         theme = COALESCE(?, theme),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name || null, bio || null, profilePic || null, language || null, theme || null, userId]
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
    `SELECT r.*, u.name, u.profile_pic FROM ratings r
     JOIN users u ON r.user_id = u.id
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
    `SELECT r.*, b.title, b.author, b.slug, b.cover_url FROM ratings r
     JOIN books b ON r.book_id = b.id
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC
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
    `SELECT b.*, cb.position FROM books b
     JOIN collection_books cb ON b.id = cb.book_id
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
    `SELECT b.*, rs.progress_percentage FROM books b
     JOIN reading_status rs ON b.id = rs.book_id
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
    `SELECT b.*, rs.completed_at FROM books b
     JOIN reading_status rs ON b.id = rs.book_id
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
    `INSERT INTO analytics (user_id, event_type, event_name, book_id, metadata)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, eventType, eventName, bookId || null, metadata ? JSON.stringify(metadata) : null]
  );
}

/**
 * Get user's activity
 */
export async function getUserActivity(env, userId, days = 30) {
  return await queryDB(
    env,
    `SELECT * FROM analytics
     WHERE user_id = ? AND timestamp > datetime('now', '-' || ? || ' days')
     ORDER BY timestamp DESC`,
    [userId, days]
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
  const params = ['available'];

  if (filters.title) {
    sql += ' AND title LIKE ?';
    params.push(`%${filters.title}%`);
  }

  if (filters.author) {
    sql += ' AND author LIKE ?';
    params.push(`%${filters.author}%`);
  }

  if (filters.minRating) {
    sql += ' AND rating >= ?';
    params.push(filters.minRating);
  }

  if (filters.language) {
    sql += ' AND language = ?';
    params.push(filters.language);
  }

  sql += ' ORDER BY rating DESC LIMIT 100';

  return await queryDB(env, sql, params);
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
