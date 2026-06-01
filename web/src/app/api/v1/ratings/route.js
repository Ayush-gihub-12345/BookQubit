/**
 * Example API Route: User Ratings
 * Path: /api/v1/ratings/route.js
 * 
 * Usage:
 * GET  /api/v1/ratings?bookId=1 - Get all ratings for a book
 * POST /api/v1/ratings - Add/update user rating
 */

import { getBookRatings, addRating, getUserBookRating, deleteRating } from '@/lib/d1';
import { auth } from '@/config/firebase';

export async function GET(request) {
  try {
    const env = request.env;
    const { searchParams } = new URL(request.url);
    const bookId = parseInt(searchParams.get('bookId'));

    if (!bookId) {
      return Response.json(
        { success: false, error: 'bookId is required' },
        { status: 400 }
      );
    }

    const ratings = await getBookRatings(env, bookId);

    return Response.json({
      success: true,
      count: ratings.length,
      data: ratings,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
      }
    });

  } catch (error) {
    console.error('Ratings API Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const env = request.env;
    const body = await request.json();
    
    const { bookId, rating, review } = body;
    
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
    if (!bookId || !rating) {
      return Response.json(
        { success: false, error: 'bookId and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return Response.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Add rating to database
    await addRating(env, userId, bookId, rating, review || null);

    return Response.json({
      success: true,
      message: 'Rating saved successfully',
      data: {
        userId,
        bookId,
        rating,
        review: review || null,
      }
    }, {
      status: 201
    });

  } catch (error) {
    console.error('Post Rating Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const env = request.env;
    const { searchParams } = new URL(request.url);
    const bookId = parseInt(searchParams.get('bookId'));

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

    if (!bookId) {
      return Response.json(
        { success: false, error: 'bookId is required' },
        { status: 400 }
      );
    }

    await deleteRating(env, userId, bookId);

    return Response.json({
      success: true,
      message: 'Rating deleted successfully',
    });

  } catch (error) {
    console.error('Delete Rating Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
