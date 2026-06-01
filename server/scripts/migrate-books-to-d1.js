/**
 * Data Migration Script: JSON to D1
 * File: server/scripts/migrate-books-to-d1.js
 * 
 * This script converts your existing JSON book data to D1 SQL format
 * 
 * Usage:
 * node server/scripts/migrate-books-to-d1.js
 * Then: npx wrangler d1 execute bookqubit_db --file ./web/migrate-insert-books.sql
 */

const fs = require('fs');
const path = require('path');

// Get all language variants
const languages = [
  'en', 'hi', 'ur', 'ar', 'bn', 'ta', 'te', 'kn', 'ml',
  'es', 'fr', 'de', 'it', 'zh', 'ja', 'ko', 'fa', 'ru', 'ps', 'mr'
];

const booksDataDir = path.join(__dirname, '../src/api/v1/modules/books/data');
const outputDir = path.join(__dirname, '../../web');

// Book language map for D1
const languageMap = {
  'en': 'English',
  'hi': 'Hindi',
  'ur': 'Urdu',
  'ar': 'Arabic',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'fa': 'Persian',
  'ru': 'Russian',
  'ps': 'Pashto',
  'mr': 'Marathi'
};

console.log('📚 BookQubit Data Migration: JSON to D1');
console.log('======================================\n');

// Step 1: Load all language files
const allBooksData = {};
console.log('📖 Loading book data from language files...');

languages.forEach(lang => {
  try {
    const filePath = path.join(booksDataDir, `BooksData_${lang.toUpperCase()}.js`);
    if (fs.existsSync(filePath)) {
      // Remove any Node.js exports and require it
      const content = fs.readFileSync(filePath, 'utf8');
      const booksArray = eval(content.match(/\[[\s\S]*\]/)[0]);
      allBooksData[lang] = booksArray;
      console.log(`  ✓ Loaded ${lang.toUpperCase()}: ${booksArray.length} books`);
    }
  } catch (error) {
    console.error(`  ✗ Error loading ${lang}: ${error.message}`);
  }
});

// Step 2: Create a unique book index (by slug)
console.log('\n🔗 Merging books across all languages...');

const uniqueBooks = {};
const bookTranslations = {};

Object.entries(allBooksData).forEach(([lang, books]) => {
  books.forEach(book => {
    if (!uniqueBooks[book.slug]) {
      uniqueBooks[book.slug] = {
        ...book,
        language: lang,
        translations: []
      };
    }
    
    // Store translation
    if (!bookTranslations[book.slug]) {
      bookTranslations[book.slug] = {};
    }
    
    bookTranslations[book.slug][lang] = {
      title: book.title,
      description: book.description || '',
      summary: book.summary || ''
    };
  });
});

console.log(`  ✓ Found ${Object.keys(uniqueBooks).length} unique books`);

// Step 3: Escape SQL strings
function escapeSQL(str) {
  if (!str) return null;
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

// Step 4: Generate SQL INSERT statements
console.log('\n💾 Generating SQL INSERT statements...');

let insertBookSQL = '';
let insertGenreSQL = '';
let insertSubjectSQL = '';
let insertTagSQL = '';
let insertTranslationSQL = '';

let bookId = 1;
const bookSlugToId = {};

Object.entries(uniqueBooks).forEach(([slug, book]) => {
  bookSlugToId[slug] = bookId;

  // Book insert
  const title = escapeSQLProperly(book.title);
  const author = escapeSQLProperly(book.author);
  const description = escapeSQLProperly(book.description);
  const summary = escapeSQLProperly(book.summary);
  const coverUrl = book.coverId ? `https://covers.example.com/${book.coverId}` : '';
  const affiliateLink = book.affiliateLink || '';
  const isbn = book.isbn || '';
  const pages = book.pages || 0;
  const year = book.publicationYear || new Date().getFullYear();
  const rating = book.rating || 0;

  insertBookSQL += `INSERT INTO books (id, title, author, slug, description, summary, rating, cover_url, affiliate_link, isbn, pages, publication_year, language) VALUES (${bookId}, '${title}', '${author}', '${slug}', '${description}', '${summary}', ${rating}, '${coverUrl}', '${affiliateLink}', '${isbn}', ${pages}, ${year}, '${book.language}');\n`;

  // Genres
  if (book.genres && Array.isArray(book.genres)) {
    book.genres.forEach(genre => {
      insertGenreSQL += `INSERT INTO book_genres (book_id, genre) VALUES (${bookId}, '${escapeSQLProperly(genre)}');\n`;
    });
  }

  // Subjects
  if (book.subjects && Array.isArray(book.subjects)) {
    book.subjects.forEach(subject => {
      insertSubjectSQL += `INSERT INTO book_subjects (book_id, subject) VALUES (${bookId}, '${escapeSQLProperly(subject)}');\n`;
    });
  }

  // Tags
  if (book.tags && Array.isArray(book.tags)) {
    book.tags.forEach(tag => {
      insertTagSQL += `INSERT INTO book_tags (book_id, tag) VALUES (${bookId}, '${escapeSQLProperly(tag)}');\n`;
    });
  }

  // Translations
  Object.entries(bookTranslations[slug]).forEach(([lang, translation]) => {
    if (lang !== book.language) {
      const transTitle = escapeSQLProperly(translation.title);
      const transDesc = escapeSQLProperly(translation.description);
      const transSummary = escapeSQLProperly(translation.summary);
      insertTranslationSQL += `INSERT INTO book_translations (book_id, language, title, description, summary) VALUES (${bookId}, '${lang}', '${transTitle}', '${transDesc}', '${transSummary}');\n`;
    }
  });

  bookId++;
});

// Step 5: Combine all SQL
const fullSQL = `
-- BookQubit Data Migration
-- Generated: ${new Date().toISOString()}

-- Disable foreign keys temporarily
PRAGMA foreign_keys = OFF;

-- Insert books
${insertBookSQL}

-- Insert genres
${insertGenreSQL}

-- Insert subjects
${insertSubjectSQL}

-- Insert tags
${insertTagSQL}

-- Insert translations
${insertTranslationSQL}

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;

-- Verify data
SELECT COUNT(*) as total_books FROM books;
SELECT COUNT(*) as total_genres FROM book_genres;
SELECT COUNT(*) as total_translations FROM book_translations;
`;

// Step 6: Write to file
const outputFile = path.join(outputDir, 'migrate-insert-books.sql');
fs.writeFileSync(outputFile, fullSQL);

console.log(`  ✓ Generated SQL with ${bookId - 1} books`);
console.log(`  ✓ Generated ${insertGenreSQL.split('\n').filter(l => l.trim()).length} genre entries`);
console.log(`  ✓ Generated ${insertSubjectSQL.split('\n').filter(l => l.trim()).length} subject entries`);
console.log(`  ✓ Generated ${insertTagSQL.split('\n').filter(l => l.trim()).length} tag entries`);
console.log(`  ✓ Generated ${insertTranslationSQL.split('\n').filter(l => l.trim()).length} translation entries`);

console.log('\n✅ Migration SQL generated successfully!');
console.log(`\n📄 Output file: ${outputFile}`);

console.log('\n🚀 Next steps:');
console.log('1. Navigate to web folder: cd web');
console.log('2. Deploy schema: npx wrangler d1 execute bookqubit_db --file ./schema.sql');
console.log('3. Insert data: npx wrangler d1 execute bookqubit_db --file ./migrate-insert-books.sql');
console.log('4. Verify: npx wrangler d1 query bookqubit_db "SELECT COUNT(*) as total FROM books;"');

/**
 * Properly escape SQL strings
 */
function escapeSQLProperly(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''");
}
