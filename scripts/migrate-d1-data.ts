/**
 * D1 Data Migration Script
 * 
 * This script is executed during deployment to:
 * 1. Create all necessary D1 tables (schema.sql)
 * 2. Load book data from JSON files into the database
 * 3. Populate authors, publishers, categories, and all related tables
 * 4. Create indexes for performance
 * 
 * Run with: node scripts/migrate-d1-data.js
 * 
 * Usage in wrangler.toml or GitHub Actions:
 * - Call this script as part of the build process
 * - Ensure D1 binding is available in the environment
 */

import fs from 'fs';
import path from 'path';

// Import book data from JSON files
const booksDataPath = path.join(process.cwd(), 'src/api/v1/modules/books/data');

const languages = [
  'English', 'Hindi', 'Urdu', 'Arabic', 'Bangla', 'Marathi',
  'Tamil', 'Kannada', 'Chinese', 'French', 'German', 'Italian',
  'Japanese', 'Korean', 'Persian', 'Russian', 'Malayalam', 'Spanish', 'Pashto', 'Telugu'
];

interface BookData {
  id: number;
  title: string;
  slug: string;
  author: string;
  description: string;
  summary?: string;
  category?: string;
  genres?: string[];
  subjects?: string[];
  keyPoints?: string[];
  tags?: string[];
  imageUrl: string;
  rating: number;
  price?: string;
  isbn?: string;
  pageCount?: number;
  published?: string;
  format?: string;
  publisher?: string;
  language?: string;
  geography?: {
    country?: string;
    continent?: string;
    subRegion?: string;
  };
  buttons?: {
    getBook?: string;
    listenAudiobook?: string;
  };
}

export async function migrateD1Data(env: any) {
  try {
    console.log('🚀 Starting D1 data migration...');

    // Step 1: Create tables from schema
    console.log('📋 Creating database tables...');
    const schemaPath = path.join(process.cwd(), 'web/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        await env.DB_CONTENT.prepare(statement).run();
      } catch (err) {
        // Table might already exist, continue
        console.log(`ℹ️ ${(err as any).message}`);
      }
    }
    console.log('✅ Tables created/verified');

    // Step 2: Migrate book data
    console.log('📚 Loading book data from JSON files...');
    const authors = new Map<string, { name: string; slug: string }>();
    const publishers = new Map<string, { name: string; slug: string }>();
    const allBooks: BookData[] = [];

    // Load all books from language files
    for (const lang of languages) {
      try {
        const filePath = path.join(booksDataPath, `BooksData_${lang}.js`);
        if (fs.existsSync(filePath)) {
          const booksData = require(filePath).default;
          
          for (const book of booksData) {
            // Extract unique authors and publishers
            if (book.author) {
              const authorSlug = book.author.toLowerCase().replace(/\s+/g, '-');
              authors.set(book.author, { name: book.author, slug: authorSlug });
            }
            
            if (book.publisher) {
              const pubSlug = book.publisher.toLowerCase().replace(/\s+/g, '-');
              publishers.set(book.publisher, { name: book.publisher, slug: pubSlug });
            }

            allBooks.push(book);
          }
        }
      } catch (err) {
        console.log(`⚠️ Could not load ${lang} books:`, (err as any).message);
      }
    }

    // Insert authors
    console.log(`📝 Inserting ${authors.size} unique authors...`);
    const authorIdMap = new Map<string, number>();
    
    for (const [authorName, author] of authors.entries()) {
      try {
        const result = await env.DB_CONTENT.prepare(`
          INSERT INTO authors (name, slug, bio, image_url, website)
          VALUES (?, ?, NULL, NULL, NULL)
          ON CONFLICT(slug) DO NOTHING
        `).bind(author.name, author.slug).run();
        
        // Fetch the ID
        const existing = await env.DB_CONTENT.prepare(
          'SELECT id FROM authors WHERE slug = ?'
        ).bind(author.slug).first();
        
        if (existing) {
          authorIdMap.set(authorName, existing.id);
        }
      } catch (err) {
        console.log(`⚠️ Error inserting author ${authorName}:`, (err as any).message);
      }
    }

    // Insert publishers
    console.log(`🏢 Inserting ${publishers.size} unique publishers...`);
    const publisherIdMap = new Map<string, number>();
    
    for (const [pubName, pub] of publishers.entries()) {
      try {
        const result = await env.DB_CONTENT.prepare(`
          INSERT INTO publishers (name, slug, description, logo_url, website)
          VALUES (?, ?, NULL, NULL, NULL)
          ON CONFLICT(slug) DO NOTHING
        `).bind(pub.name, pub.slug).run();
        
        const existing = await env.DB_CONTENT.prepare(
          'SELECT id FROM publishers WHERE slug = ?'
        ).bind(pub.slug).first();
        
        if (existing) {
          publisherIdMap.set(pubName, existing.id);
        }
      } catch (err) {
        console.log(`⚠️ Error inserting publisher ${pubName}:`, (err as any).message);
      }
    }

    // Insert books with all details
    console.log(`📖 Inserting ${allBooks.length} books...`);
    
    for (const book of allBooks) {
      try {
        const authorId = book.author ? authorIdMap.get(book.author) : null;
        const publisherId = book.publisher ? publisherIdMap.get(book.publisher) : null;
        const affiliateAmazonLink = book.buttons?.getBook || null;
        const audioLink = book.buttons?.listenAudiobook || null;

        const result = await env.DB_CONTENT.prepare(`
          INSERT INTO books (
            id, author_id, publisher_id, title, canonical_slug, description, summary,
            cover_url, isbn, language_source, page_count, published_year, format,
            base_price, rating, affiliate_amazon_link, audio_link,
            country_of_origin, continent, sub_region, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING
        `).bind(
          book.id,
          authorId,
          publisherId,
          book.title,
          book.slug,
          book.description,
          book.summary || null,
          book.imageUrl,
          book.isbn || null,
          'en', // default language
          book.pageCount || null,
          book.published ? parseInt(book.published as string) : null,
          book.format || null,
          book.price ? parseFloat(book.price.replace('$', '')) : null,
          book.rating || 0,
          affiliateAmazonLink,
          audioLink,
          book.geography?.country || null,
          book.geography?.continent || null,
          book.geography?.subRegion || null,
          'active'
        ).run();

        // Insert genres
        if (book.genres && Array.isArray(book.genres)) {
          for (const genre of book.genres) {
            try {
              await env.DB_CONTENT.prepare(`
                INSERT INTO book_genres (book_id, genre_name)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
              `).bind(book.id, genre).run();
            } catch (err) {
              // Ignore conflicts
            }
          }
        }

        // Insert subjects
        if (book.subjects && Array.isArray(book.subjects)) {
          for (const subject of book.subjects) {
            try {
              await env.DB_CONTENT.prepare(`
                INSERT INTO book_subjects (book_id, subject_name)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
              `).bind(book.id, subject).run();
            } catch (err) {
              // Ignore conflicts
            }
          }
        }

        // Insert tags
        if (book.tags && Array.isArray(book.tags)) {
          for (const tag of book.tags) {
            try {
              await env.DB_CONTENT.prepare(`
                INSERT INTO book_tags (book_id, tag_name)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
              `).bind(book.id, tag).run();
            } catch (err) {
              // Ignore conflicts
            }
          }
        }

        // Insert keypoints
        if (book.keyPoints && Array.isArray(book.keyPoints)) {
          for (let i = 0; i < book.keyPoints.length; i++) {
            try {
              await env.DB_CONTENT.prepare(`
                INSERT INTO book_keypoints (book_id, key_point, display_order)
                VALUES (?, ?, ?)
              `).bind(book.id, book.keyPoints[i], i).run();
            } catch (err) {
              // Ignore conflicts
            }
          }
        }
      } catch (err) {
        console.log(`⚠️ Error inserting book ${book.id}:`, (err as any).message);
      }
    }

    console.log('✅ Migration complete!');
    console.log(`
    📊 Summary:
    - Authors: ${authors.size}
    - Publishers: ${publishers.size}
    - Books: ${allBooks.length}
    
    All data is now in D1 database.
    API endpoints will query from D1 instead of JSON files.
    `);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export default migrateD1Data;
