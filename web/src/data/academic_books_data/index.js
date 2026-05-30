import academicBooksEnglish from "./academic_books_english";
import academicBooksHindi from "./academic_books_hindi";
import academicBooksTamil from "./academic_books_tamil";
import academicBooksUrdu from "./academic_books_urdu";
import academicBooksArabic from "./academic_books_arabic";
import academicBooksBangla from "./academic_books_bangla";
import academicBooksMarathi from "./academic_books_marathi";
import academicBooksKannada from "./academic_books_kannada";
import academicBooksChinese from "./academic_books_chinese";
import academicBooksFrench from "./academic_books_french";
import academicBooksGerman from "./academic_books_german";
import academicBooksItalian from "./academic_books_italian";
import academicBooksJapanese from "./academic_books_japanese";
import academicBooksKorean from "./academic_books_korean";
import academicBooksPersian from "./academic_books_persian";
import academicBooksRussian from "./academic_books_russian";

// Complete translations object with all languages
export const academicBooksTranslations = {
  en: academicBooksEnglish,
  hi: academicBooksHindi,
  ta: academicBooksTamil,
  ur: academicBooksUrdu,
  ar: academicBooksArabic,
  bn: academicBooksBangla,
  mr: academicBooksMarathi,
  kn: academicBooksKannada,
  zh: academicBooksChinese,
  fr: academicBooksFrench,
  de: academicBooksGerman,
  it: academicBooksItalian,
  ja: academicBooksJapanese,
  ko: academicBooksKorean,
  fa: academicBooksPersian,
  ru: academicBooksRussian,
};

// Get all books from all languages (for sitemap and search)
export const getAllBooks = () => {
  const allBooks = [
    ...academicBooksEnglish,
    ...academicBooksHindi,
    ...academicBooksTamil,
    ...academicBooksUrdu,
    ...academicBooksArabic,
    ...academicBooksBangla,
    ...academicBooksMarathi,
    ...academicBooksKannada,
    ...academicBooksChinese,
    ...academicBooksFrench,
    ...academicBooksGerman,
    ...academicBooksItalian,
    ...academicBooksJapanese,
    ...academicBooksKorean,
    ...academicBooksPersian,
    ...academicBooksRussian,
  ];
  
  // Remove duplicates by slug if a book exists in multiple languages
  const uniqueBooks = {};
  allBooks.forEach(book => {
    if (!uniqueBooks[book.slug] || book.language === 'en') {
      uniqueBooks[book.slug] = book;
    }
  });
  
  return Object.values(uniqueBooks);
};

// Get academic books by language with fallback to English
export const getAcademicBooksByLanguage = (lang) => {
  try {
    const languageMap = {
      'en': 'en', 'en-US': 'en', 'en-GB': 'en',
      'hi': 'hi', 'hi-IN': 'hi',
      'ta': 'ta', 'ta-IN': 'ta',
      'ur': 'ur', 'ur-PK': 'ur', 'ur-IN': 'ur',
      'ar': 'ar', 'ar-SA': 'ar', 'ar-AE': 'ar', 'ar-EG': 'ar',
      'bn': 'bn', 'bn-BD': 'bn', 'bn-IN': 'bn',
      'mr': 'mr', 'mr-IN': 'mr',
      'kn': 'kn', 'kn-IN': 'kn',
      'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh',
      'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
      'de': 'de', 'de-DE': 'de', 'de-AT': 'de', 'de-CH': 'de',
      'it': 'it', 'it-IT': 'it', 'it-CH': 'it',
      'ja': 'ja', 'ja-JP': 'ja',
      'ko': 'ko', 'ko-KR': 'ko',
      'fa': 'fa', 'fa-IR': 'fa',
      'ru': 'ru', 'ru-RU': 'ru', 'ru-UA': 'ru',
    };
    
    const normalizedLang = languageMap[lang] || lang;
    const books = academicBooksTranslations[normalizedLang] || academicBooksEnglish;
    
    return books || [];
  } catch (error) {
    console.error("Error in getAcademicBooksByLanguage:", error);
    return academicBooksEnglish || [];
  }
};

// Helper function to get a single academic book by slug
export const getAcademicBookBySlug = (slug, lang) => {
  if (!slug) return null;
  const books = getAcademicBooksByLanguage(lang);
  return books.find(book => book.slug === slug) || null;
};

// Helper function to get academic books by category
export const getAcademicBooksByCategory = (category, lang) => {
  if (!category) return [];
  const books = getAcademicBooksByLanguage(lang);
  return books.filter(book => book.category === category);
};

// Helper function to get academic books by subject
export const getAcademicBooksBySubject = (subject, lang) => {
  if (!subject) return [];
  const books = getAcademicBooksByLanguage(lang);
  return books.filter(book => book.subject === subject);
};

// Helper function to get academic books by level
export const getAcademicBooksByLevel = (level, lang) => {
  if (!level) return [];
  const books = getAcademicBooksByLanguage(lang);
  return books.filter(book => book.level === level);
};

// Helper function to get popular books
export const getPopularAcademicBooks = (lang, limit = 10) => {
  const books = getAcademicBooksByLanguage(lang);
  return books.filter(book => book.popular === true).slice(0, limit);
};

// Helper function to get new releases
export const getNewAcademicBooks = (lang, limit = 10) => {
  const books = getAcademicBooksByLanguage(lang);
  return books.filter(book => book.new === true).slice(0, limit);
};

// Helper function to search academic books
export const searchAcademicBooks = (searchTerm, lang) => {
  if (!searchTerm) return getAcademicBooksByLanguage(lang);
  const books = getAcademicBooksByLanguage(lang);
  const term = searchTerm.toLowerCase();
  return books.filter(book => 
    book.title?.toLowerCase().includes(term) ||
    book.author?.toLowerCase().includes(term) ||
    book.description?.toLowerCase().includes(term) ||
    book.category?.toLowerCase().includes(term) ||
    book.subject?.toLowerCase().includes(term) ||
    book.tags?.some(tag => tag.toLowerCase().includes(term))
  );
};

// Helper function to get all unique categories
export const getAcademicBookCategories = (lang) => {
  const books = getAcademicBooksByLanguage(lang);
  return [...new Set(books.map(book => book.category))];
};

// Helper function to get all unique subjects
export const getAcademicBookSubjects = (lang) => {
  const books = getAcademicBooksByLanguage(lang);
  return [...new Set(books.map(book => book.subject))];
};

// Helper function to get books by price range
export const getAcademicBooksByPriceRange = (minPrice, maxPrice, lang) => {
  const books = getAcademicBooksByLanguage(lang);
  return books.filter(book => {
    const price = parseFloat(book.price.replace(/[^0-9.-]+/g, ''));
    return price >= minPrice && price <= maxPrice;
  });
};

// Export all language data for direct access
export {
  academicBooksEnglish,
  academicBooksHindi,
  academicBooksTamil,
  academicBooksUrdu,
  academicBooksArabic,
  academicBooksBangla,
  academicBooksMarathi,
  academicBooksKannada,
  academicBooksChinese,
  academicBooksFrench,
  academicBooksGerman,
  academicBooksItalian,
  academicBooksJapanese,
  academicBooksKorean,
  academicBooksPersian,
  academicBooksRussian,
};

// Default export for backward compatibility
const academicBooksData = academicBooksEnglish;
export default academicBooksData;