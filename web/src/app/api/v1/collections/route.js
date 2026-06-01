/**
 * Collections API Route
 * Path: /api/v1/collections/route.js
 * 
 * Usage:
 * GET  /api/v1/collections - Get user's collections
 * POST /api/v1/collections - Create new collection
 * DELETE /api/v1/collections?id=1 - Delete collection
 */

import { 
  getUserCollections, 
  getCollectionWithBooks,
  createCollection,
  addBookToCollection,
  removeBookFromCollection,
  getUsersDb,
} from '@/lib/d1';
import { getRequestUserId } from '@/lib/requestAuth';

/**
 * Get user's collections
 */
export async function GET(request) {
  try {
    const env = request.env;
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('id');

    // Get user from Firebase token
    const userId = getRequestUserId(request);
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let result;

    if (collectionId) {
      // Get specific collection with books
      result = await getCollectionWithBooks(env, parseInt(collectionId));
      
      if (!result) {
        return Response.json(
          { success: false, error: 'Collection not found' },
          { status: 404 }
        );
      }
    } else {
      // Get all user's collections
      result = await getUserCollections(env, userId);
    }

    return Response.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300',
      }
    });

  } catch (error) {
    console.error('Collections API Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create collection
 */
export async function POST(request) {
  try {
    const env = request.env;
    const body = await request.json();

    const { name, description, isPublic, action, collectionId, bookId } = body;

    // Get user from Firebase token
    const userId = getRequestUserId(request);
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add book to collection
    if (action === 'add-book') {
      if (!collectionId || !bookId) {
        return Response.json(
          { success: false, error: 'collectionId and bookId are required' },
          { status: 400 }
        );
      }

      await addBookToCollection(env, collectionId, bookId);

      return Response.json({
        success: true,
        message: 'Book added to collection',
      }, { status: 200 });
    }

    // Create collection
    if (!name) {
      return Response.json(
        { success: false, error: 'Collection name is required' },
        { status: 400 }
      );
    }

    await createCollection(env, userId, name, description || null, isPublic || false);

    return Response.json({
      success: true,
      message: 'Collection created successfully',
      data: { name, description, isPublic }
    }, { status: 201 });

  } catch (error) {
    console.error('Create Collection Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete collection or remove book from collection
 */
export async function DELETE(request) {
  try {
    const env = request.env;
    const { searchParams } = new URL(request.url);
    const collectionId = parseInt(searchParams.get('id'));
    const bookId = searchParams.get('bookId');

    // Get user from Firebase token
    const userId = getRequestUserId(request);
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!collectionId) {
      return Response.json(
        { success: false, error: 'collectionId is required' },
        { status: 400 }
      );
    }

    // Remove book from collection
    if (bookId) {
      await removeBookFromCollection(env, collectionId, parseInt(bookId));
      return Response.json({
        success: true,
        message: 'Book removed from collection',
      });
    }

    // Delete entire collection
    await getUsersDb(env).prepare('DELETE FROM collections WHERE id = ?').bind(collectionId).run();

    return Response.json({
      success: true,
      message: 'Collection deleted',
    });

  } catch (error) {
    console.error('Delete Collection Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
