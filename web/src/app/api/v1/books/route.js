/**
 * Example API Route: Get Books
 * Path: /api/v1/books/route.js
 * 
 * Usage:
 * GET /api/v1/books?limit=20&offset=0
 * GET /api/v1/books?search=harry
 * GET /api/v1/books?genre=fiction
 */

import {
  getBookBySlugFromDb,
  getBooksByGenreFromDb,
  getTopBooksFromDb,
  listBooksFromDb,
  searchBooksFromDb,
} from '../../../../../v1/db/content';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const action = searchParams.get('action') || 'list';
    const limit = searchParams.get('limit') || 50;
    const offset = searchParams.get('offset') || 0;
    const query = searchParams.get('search') || searchParams.get('q');
    const genre = searchParams.get('genre');
    const slug = searchParams.get('slug');
    const language = searchParams.get('lang') || searchParams.get('language') || 'en';

    let books = [];

    // Different endpoints
    if (slug) {
      const book = await getBookBySlugFromDb(request, slug, language);
      return Response.json({
        success: true,
        count: book ? 1 : 0,
        data: book,
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        }
      });
    } else if (action === 'top' || action === 'trending') {
      books = await getTopBooksFromDb(request, { limit, language });
    } else if (query) {
      books = await searchBooksFromDb(request, { query, limit, language });
    } else if (genre) {
      books = await getBooksByGenreFromDb(request, { genre, limit, language });
    } else {
      books = await listBooksFromDb(request, { limit, offset, language });
    }

    return Response.json({
      success: true,
      count: books.length,
      data: books,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Books API Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
