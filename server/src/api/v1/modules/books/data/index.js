import booksEnglish from './BooksData_English';
import booksHindi from './BooksData_Hindi';
import booksUrdu from './BooksData_Urdu';
import booksArabic from './BooksData_Arabic';
import booksBangla from './BooksData_Bangla';
import booksMarathi from './BooksData_Marathi';
import booksTamil from './BooksData_Tamil';
import booksKannada from './BooksData_Kannada';
import booksChinese from './BooksData_Chinese';
import booksFrench from './BooksData_French';
import booksGerman from './BooksData_German';
import booksItalian from './BooksData_Italian';
import booksJapanese from './BooksData_Japanese';
import booksKorean from './BooksData_Korean';
import booksPersian from './BooksData_Persian';
import booksRussian from './BooksData_Russian';
import booksMalayalam from './BooksData_Malayalam'
import booksPashto from './BooksData_Pashto'
import booksSpanish from './BooksData_Spanish'
import booksTelugu from './BooksData_Telugu'

export const booksTranslations = {
  en: booksEnglish,
  hi: booksHindi,
  ur: booksUrdu,
  ar: booksArabic,
  bn: booksBangla,
  mr: booksMarathi,
  ta: booksTamil,
  kn: booksKannada,
  zh: booksChinese,
  fr: booksFrench,
  de: booksGerman,
  it: booksItalian,
  ja: booksJapanese,
  ko: booksKorean,
  fa: booksPersian,
  ru: booksRussian,
  ml: booksMalayalam,
  es: booksSpanish,
  ps: booksPashto,
  te: booksTelugu,


};

// Get books by language with fallback to English
export const getBooksByLanguage = (lang) => {
  return booksTranslations[lang] || booksTranslations.en;
};

// Helper function to get a single book by slug in specific language
export const getBookBySlug = (slug, lang) => {
  if (!slug) return null;
  
  const books = getBooksByLanguage(lang);
  const book = books.find(book => book.slug?.toLowerCase() === slug?.toLowerCase());
  
  // If not found by slug, try to find by id
  if (!book && !isNaN(slug)) {
    return books.find(book => book.id === parseInt(slug));
  }
  
  return book;
};

// Helper function to get multiple books by IDs
export const getBooksByIds = (ids, lang) => {
  if (!ids || !Array.isArray(ids)) return [];
  
  const books = getBooksByLanguage(lang);
  return books.filter(book => ids.includes(book.id));
};

// Helper function to get books by author
export const getBooksByAuthor = (author, lang) => {
  if (!author) return [];
  
  const books = getBooksByLanguage(lang);
  return books.filter(book => 
    book.author?.toLowerCase() === author?.toLowerCase()
  );
};

// Helper function to get books by category
export const getBooksByCategory = (category, lang) => {
  if (!category) return [];
  
  const books = getBooksByLanguage(lang);
  return books.filter(book => 
    book.category?.toLowerCase() === category?.toLowerCase()
  );
};

// Helper function to search books
export const searchBooks = (searchTerm, lang) => {
  if (!searchTerm) return getBooksByLanguage(lang);
  
  const books = getBooksByLanguage(lang);
  const term = searchTerm.toLowerCase();
  
  return books.filter(book => 
    book.title?.toLowerCase().includes(term) ||
    book.author?.toLowerCase().includes(term) ||
    book.description?.toLowerCase().includes(term) ||
    book.tags?.some(tag => tag.toLowerCase().includes(term))
  );
};

// Helper function to get all books across all languages (for search)
export const getAllBooks = () => {
  return {
    en: booksTranslations.en,
    hi: booksTranslations.hi,
    ur: booksTranslations.ur,
    ar: booksTranslations.ar,
    bn: booksTranslations.bn,
    mr: booksTranslations.mr,
    ta: booksTranslations.ta,
    kn: booksTranslations.kn,
    zh: booksTranslations.zh,
    fr: booksTranslations.fr,
    de: booksTranslations.de,
    it: booksTranslations.it,
    ja: booksTranslations.ja,
    ko: booksTranslations.ko,
    fa: booksTranslations.fa,
    ru: booksTranslations.ru
  };
};

// Helper function to get all unique authors across all books in a language
export const getAllAuthors = (lang) => {
  const books = getBooksByLanguage(lang);
  return [...new Set(books.map(book => book.author).filter(Boolean))];
};

// Helper function to get all unique categories across all books in a language
export const getAllCategories = (lang) => {
  const books = getBooksByLanguage(lang);
  return [...new Set(books.map(book => book.category).filter(Boolean))];
};

// Helper function to get all unique tags across all books in a language
export const getAllTags = (lang) => {
  const books = getBooksByLanguage(lang);
  return [...new Set(books.flatMap(book => book.tags || []).filter(Boolean))];
};

// Helper function to get featured books
export const getFeaturedBooks = (lang, limit = 6) => {
  const books = getBooksByLanguage(lang);
  return books.slice(0, limit);
};

// Helper function to get popular books (based on rating)
export const getPopularBooks = (lang, limit = 6) => {
  const books = getBooksByLanguage(lang);
  return [...books]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
};

// Helper function to get new releases
export const getNewReleases = (lang, limit = 6) => {
  const books = getBooksByLanguage(lang);
  return [...books]
    .sort((a, b) => (b.published || b.id) - (a.published || a.id))
    .slice(0, limit);
};

// Helper function to get top rated books
export const getTopRated = (lang, limit = 6) => {
  const books = getBooksByLanguage(lang);
  return [...books]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
};

// Helper function to get random books
export const getRandomBooks = (lang, count = 4) => {
  const books = getBooksByLanguage(lang);
  const shuffled = [...books];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

// Helper function to get related books based on category and author
export const getRelatedBooks = (book, lang, limit = 4) => {
  if (!book) return [];
  
  const books = getBooksByLanguage(lang);
  return books
    .filter(b => 
      b.id !== book.id && 
      (b.category === book.category || b.author === book.author)
    )
    .slice(0, limit);
};

// Helper function to get book count by language
export const getBookCount = (lang) => {
  const books = getBooksByLanguage(lang);
  return books.length;
};

// Helper function to check if book exists by slug
export const bookExists = (slug, lang) => {
  const books = getBooksByLanguage(lang);
  return books.some(book => book.slug === slug);
};

// Supported languages list
export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ru", name: "Russian", nativeName: "Русский" }
];

// Default export for backward compatibility
export default booksEnglish;