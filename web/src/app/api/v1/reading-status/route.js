/**
 * Example API Route: User Reading Status
 * Path: /api/v1/reading-status/route.js
 * 
 * Usage:
 * GET  /api/v1/reading-status?status=reading - Get user's reading books
 * POST /api/v1/reading-status - Update reading status
 */

import { 
  getUserReadingBooks, 
  getUserCompletedBooks,
  getUserReadingStatus,
  setReadingStatus 
} from '@/lib/d1';
import { auth } from '@/config/firebase';

/**
 * Get user's reading status
 */
export async function GET(request) {
  try {
    const env = request.env;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'reading';

    // Get user from Firebase token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    let books;
    if (status === 'completed') {
      books = await getUserCompletedBooks(env, userId, 50);
    } else {
      books = await getUserReadingBooks(env, userId);
    }

    return Response.json({
      success: true,
      status: status,
      count: books.length,
      data: books,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Reading Status API Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update reading status
 */
export async function POST(request) {
  try {
    const env = request.env;
    const body = await request.json();

    const { bookId, status, progressPercentage } = body;

    // Get user from Firebase token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Validate input
    if (!bookId || !status) {
      return Response.json(
        { success: false, error: 'bookId and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['reading', 'completed', 'want_to_read', 'dropped'];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate progress percentage if provided
    if (progressPercentage && (progressPercentage < 0 || progressPercentage > 100)) {
      return Response.json(
        { success: false, error: 'Progress percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update status
    await setReadingStatus(env, userId, bookId, status, progressPercentage || 0);

    return Response.json({
      success: true,
      message: 'Reading status updated',
      data: {
        userId,
        bookId,
        status,
        progressPercentage: progressPercentage || 0,
      }
    }, {
      status: 200
    });

  } catch (error) {
    console.error('Update Reading Status Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
