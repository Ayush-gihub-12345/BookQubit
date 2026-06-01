/**
 * D1 Book Service
 * 
 * This service handles all database queries for books from Cloudflare D1.
 * On deployment, all book data is loaded into the database and API queries
 * are made to D1 instead of reading from JSON files.
 * 
 * Database: bookqubit_content (D1_DB_CONTENT binding in wrangler.toml)
 */

export interface BookFilters {
  language?: string;
  category?: string;
  genre?: string;
  sort?: 'rating' | 'published' | 'popularity' | 'recently_added';
  limit?: number;
  offset?: number;
}

export interface BookQueryResult {
  id: number;
  title: string;
  slug: string;
  author_id: number;
  publisher_id: number;
  description: string;
  summary: string;
  cover_url: string;
  isbn: string;
  price: number;
  rating: number;
  review_count: number;
  view_count: number;
  genres: string[]; // serialized from book_genres table
  subjects: string[]; // serialized from book_subjects table
  tags: string[]; // serialized from book_tags table
  keypoints: string[]; // serialized from book_keypoints table
  author_name: string;
  publisher_name: string;
  page_count: number;
  format: string;
  published_year: number;
  affiliate_amazon_link: string;
  affiliate_audible_link: string;
  audio_link: string;
  country_of_origin: string;
}

/**
 * Get all books with filters
 * 
 * Replaces: getBooksByLanguage() from BooksData_*.js files
 */
export const getBooksFromD1 = async (
  env: any,
  filters: BookFilters
): Promise<BookQueryResult[]> => {
  const {
    category,
    genre,
    sort = 'rating',
    limit = 20,
    offset = 0,
  } = filters;

  let query = `
    SELECT 
      b.*,
      a.name as author_name,
      p.name as publisher_name,
      GROUP_CONCAT(DISTINCT g.genre_name, ',') as genres,
      GROUP_CONCAT(DISTINCT s.subject_name, ',') as subjects,
      GROUP_CONCAT(DISTINCT t.tag_name, ',') as tags,
      GROUP_CONCAT(DISTINCT k.key_point, ',') as keypoints
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN book_genres g ON b.id = g.book_id
    LEFT JOIN book_subjects s ON b.id = s.book_id
    LEFT JOIN book_tags t ON b.id = t.book_id
    LEFT JOIN book_keypoints k ON b.id = k.book_id
    WHERE b.status = 'active'
  `;

  const params: any[] = [];

  if (category) {
    query += ` AND b.category = ?`;
    params.push(category);
  }

  if (genre) {
    query += ` AND g.genre_name = ?`;
    params.push(genre);
  }

  // Order by sort parameter
  if (sort === 'rating') {
    query += ` GROUP BY b.id ORDER BY b.rating DESC`;
  } else if (sort === 'published') {
    query += ` GROUP BY b.id ORDER BY b.published_year DESC`;
  } else if (sort === 'popularity') {
    query += ` GROUP BY b.id ORDER BY b.view_count DESC`;
  } else if (sort === 'recently_added') {
    query += ` GROUP BY b.id ORDER BY b.created_at DESC`;
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  try {
    const stmt = env.DB_CONTENT.prepare(query);
    const result = await stmt.bind(...params).all();
    
    return result.results.map((row: any) => ({
      ...row,
      genres: row.genres ? row.genres.split(',') : [],
      subjects: row.subjects ? row.subjects.split(',') : [],
      tags: row.tags ? row.tags.split(',') : [],
      keypoints: row.keypoints ? row.keypoints.split(',') : [],
    }));
  } catch (error) {
    console.error('Error fetching books from D1:', error);
    throw error;
  }
};

/**
 * Get single book by slug with full details
 * 
 * Replaces: getBookBySlug() from BooksData_*.js files
 */
export const getBookBySlugFromD1 = async (
  env: any,
  slug: string
): Promise<BookQueryResult | null> => {
  const query = `
    SELECT 
      b.*,
      a.name as author_name,
      p.name as publisher_name,
      GROUP_CONCAT(DISTINCT g.genre_name, ',') as genres,
      GROUP_CONCAT(DISTINCT s.subject_name, ',') as subjects,
      GROUP_CONCAT(DISTINCT t.tag_name, ',') as tags,
      GROUP_CONCAT(DISTINCT k.key_point, ',') as keypoints
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN book_genres g ON b.id = g.book_id
    LEFT JOIN book_subjects s ON b.id = s.book_id
    LEFT JOIN book_tags t ON b.id = t.book_id
    LEFT JOIN book_keypoints k ON b.id = k.book_id
    WHERE b.canonical_slug = ? AND b.status = 'active'
    GROUP BY b.id
    LIMIT 1
  `;

  try {
    const stmt = env.DB_CONTENT.prepare(query).bind(slug);
    const result = await stmt.first();
    
    if (!result) return null;
    
    return {
      ...result,
      genres: result.genres ? result.genres.split(',') : [],
      subjects: result.subjects ? result.subjects.split(',') : [],
      tags: result.tags ? result.tags.split(',') : [],
      keypoints: result.keypoints ? result.keypoints.split(',') : [],
    };
  } catch (error) {
    console.error('Error fetching book by slug from D1:', error);
    throw error;
  }
};

/**
 * Get related books for recommendations
 * 
 * Replaces: related books logic from static data
 */
export const getRelatedBooksFromD1 = async (
  env: any,
  bookId: number,
  limit: number = 5
): Promise<BookQueryResult[]> => {
  const query = `
    SELECT 
      b.*,
      a.name as author_name,
      p.name as publisher_name,
      rb.relationship_type,
      rb.reason,
      GROUP_CONCAT(DISTINCT g.genre_name, ',') as genres,
      GROUP_CONCAT(DISTINCT s.subject_name, ',') as subjects,
      GROUP_CONCAT(DISTINCT t.tag_name, ',') as tags,
      GROUP_CONCAT(DISTINCT k.key_point, ',') as keypoints
    FROM related_books rb
    LEFT JOIN books b ON rb.related_book_id = b.id
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN book_genres g ON b.id = g.book_id
    LEFT JOIN book_subjects s ON b.id = s.book_id
    LEFT JOIN book_tags t ON b.id = t.book_id
    LEFT JOIN book_keypoints k ON b.id = k.book_id
    WHERE rb.book_id = ? AND b.status = 'active'
    GROUP BY b.id
    ORDER BY rb.display_order ASC
    LIMIT ?
  `;

  try {
    const stmt = env.DB_CONTENT.prepare(query).bind(bookId, limit);
    const result = await stmt.all();
    
    return result.results.map((row: any) => ({
      ...row,
      genres: row.genres ? row.genres.split(',') : [],
      subjects: row.subjects ? row.subjects.split(',') : [],
      tags: row.tags ? row.tags.split(',') : [],
      keypoints: row.keypoints ? row.keypoints.split(',') : [],
    }));
  } catch (error) {
    console.error('Error fetching related books from D1:', error);
    throw error;
  }
};

/**
 * Search books
 * 
 * Replaces: searchBooks() from BooksData_*.js files
 */
export const searchBooksFromD1 = async (
  env: any,
  searchTerm: string,
  limit: number = 10
): Promise<BookQueryResult[]> => {
  const query = `
    SELECT 
      b.*,
      a.name as author_name,
      p.name as publisher_name,
      GROUP_CONCAT(DISTINCT g.genre_name, ',') as genres,
      GROUP_CONCAT(DISTINCT s.subject_name, ',') as subjects,
      GROUP_CONCAT(DISTINCT t.tag_name, ',') as tags,
      GROUP_CONCAT(DISTINCT k.key_point, ',') as keypoints
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN book_genres g ON b.id = g.book_id
    LEFT JOIN book_subjects s ON b.id = s.book_id
    LEFT JOIN book_tags t ON b.id = t.book_id
    LEFT JOIN book_keypoints k ON b.id = k.book_id
    WHERE b.status = 'active' 
    AND (b.title LIKE ? OR b.description LIKE ? OR a.name LIKE ?)
    GROUP BY b.id
    ORDER BY b.rating DESC
    LIMIT ?
  `;

  const searchPattern = `%${searchTerm}%`;

  try {
    const stmt = env.DB_CONTENT.prepare(query).bind(
      searchPattern,
      searchPattern,
      searchPattern,
      limit
    );
    const result = await stmt.all();
    
    return result.results.map((row: any) => ({
      ...row,
      genres: row.genres ? row.genres.split(',') : [],
      subjects: row.subjects ? row.subjects.split(',') : [],
      tags: row.tags ? row.tags.split(',') : [],
      keypoints: row.keypoints ? row.keypoints.split(',') : [],
    }));
  } catch (error) {
    console.error('Error searching books from D1:', error);
    throw error;
  }
};

/**
 * Get books by category
 */
export const getBooksByCategoryFromD1 = async (
  env: any,
  category: string,
  limit: number = 20,
  offset: number = 0
): Promise<BookQueryResult[]> => {
  return getBooksFromD1(env, { category, limit, offset });
};

/**
 * Get books by author
 */
export const getBooksByAuthorFromD1 = async (
  env: any,
  authorName: string,
  limit: number = 20,
  offset: number = 0
): Promise<BookQueryResult[]> => {
  const query = `
    SELECT 
      b.*,
      a.name as author_name,
      p.name as publisher_name,
      GROUP_CONCAT(DISTINCT g.genre_name, ',') as genres,
      GROUP_CONCAT(DISTINCT s.subject_name, ',') as subjects,
      GROUP_CONCAT(DISTINCT t.tag_name, ',') as tags,
      GROUP_CONCAT(DISTINCT k.key_point, ',') as keypoints
    FROM books b
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN book_genres g ON b.id = g.book_id
    LEFT JOIN book_subjects s ON b.id = s.book_id
    LEFT JOIN book_tags t ON b.id = t.book_id
    LEFT JOIN book_keypoints k ON b.id = k.book_id
    WHERE a.name = ? AND b.status = 'active'
    GROUP BY b.id
    ORDER BY b.rating DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const stmt = env.DB_CONTENT.prepare(query).bind(authorName, limit, offset);
    const result = await stmt.all();
    
    return result.results.map((row: any) => ({
      ...row,
      genres: row.genres ? row.genres.split(',') : [],
      subjects: row.subjects ? row.subjects.split(',') : [],
      tags: row.tags ? row.tags.split(',') : [],
      keypoints: row.keypoints ? row.keypoints.split(',') : [],
    }));
  } catch (error) {
    console.error('Error fetching books by author from D1:', error);
    throw error;
  }
};
