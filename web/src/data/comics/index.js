// frontend/src/data/comics/index.js

import { ComicsData } from './ComicsData_English';
import { ComicsDataHindi } from './ComicsData_Hindi';
import { ComicsDataUrdu } from './ComicsData_Urdu';
// Import additional language files as they are created
// import { ComicsDataTamil } from './ComicsData_Tamil';
// import { ComicsDataBengali } from './ComicsData_Bengali';
// import { ComicsDataMarathi } from './ComicsData_Marathi';
// import { ComicsDataKannada } from './ComicsData_Kannada';
// import { ComicsDataTelugu } from './ComicsData_Telugu';
// import { ComicsDataGujarati } from './ComicsData_Gujarati';
// import { ComicsDataMalayalam } from './ComicsData_Malayalam';
// import { ComicsDataPunjabi } from './ComicsData_Punjabi';
// import { ComicsDataArabic } from './ComicsData_Arabic';
// import { ComicsDataPersian } from './ComicsData_Persian';
// import { ComicsDataChinese } from './ComicsData_Chinese';
// import { ComicsDataJapanese } from './ComicsData_Japanese';
// import { ComicsDataKorean } from './ComicsData_Korean';
// import { ComicsDataFrench } from './ComicsData_French';
// import { ComicsDataGerman } from './ComicsData_German';
// import { ComicsDataSpanish } from './ComicsData_Spanish';
// import { ComicsDataRussian } from './ComicsData_Russian';

// Comics translations object for multiple language support
export const comicsTranslations = {
  en: ComicsData,
  hi: ComicsDataHindi,
  ur: ComicsDataUrdu,
  // Add more languages as you create them
  // ta: ComicsDataTamil,
  // bn: ComicsDataBengali,
  // mr: ComicsDataMarathi,
  // kn: ComicsDataKannada,
  // te: ComicsDataTelugu,
  // gu: ComicsDataGujarati,
  // ml: ComicsDataMalayalam,
  // pa: ComicsDataPunjabi,
  // ar: ComicsDataArabic,
  // fa: ComicsDataPersian,
  // zh: ComicsDataChinese,
  // ja: ComicsDataJapanese,
  // ko: ComicsDataKorean,
  // fr: ComicsDataFrench,
  // de: ComicsDataGerman,
  // es: ComicsDataSpanish,
  // ru: ComicsDataRussian,
};

// Helper function to get comics by language with fallback to English
export const getComicsByLanguage = (lang) => {
  try {
    const comics = comicsTranslations[lang] || comicsTranslations.en;
    console.log(`Loading comics for language: ${lang}, found ${comics?.length || 0} comics`);
    return comics || [];
  } catch (error) {
    console.error("Error in getComicsByLanguage:", error);
    return comicsTranslations.en || [];
  }
};

// Helper function to get a single comic by ID
export const getComicById = (id, lang) => {
  if (!id) return null;
  const comics = getComicsByLanguage(lang);
  return comics.find(comic => comic.id === parseInt(id)) || null;
};

// Helper function to get a single comic by title (slug)
export const getComicByTitle = (title, lang) => {
  if (!title) return null;
  const comics = getComicsByLanguage(lang);
  return comics.find(comic => comic.title === title || comic.title.toLowerCase().replace(/\s+/g, '-') === title) || null;
};

// Helper function to get comics by category
export const getComicsByCategory = (category, lang) => {
  if (!category) return [];
  const comics = getComicsByLanguage(lang);
  return comics.filter(comic => comic.category === category);
};

// Helper function to get comics by publisher
export const getComicsByPublisher = (publisher, lang) => {
  if (!publisher) return [];
  const comics = getComicsByLanguage(lang);
  return comics.filter(comic => comic.publisher.toLowerCase().includes(publisher.toLowerCase()));
};

// Helper function to search comics
export const searchComics = (searchTerm, lang) => {
  if (!searchTerm) return getComicsByLanguage(lang);
  const comics = getComicsByLanguage(lang);
  const term = searchTerm.toLowerCase();
  return comics.filter(comic => 
    comic.title?.toLowerCase().includes(term) ||
    comic.publisher?.toLowerCase().includes(term) ||
    comic.description?.toLowerCase().includes(term) ||
    comic.charactersIntroduced?.some(character => character.toLowerCase().includes(term)) ||
    comic.creators?.writersArtists?.some(creator => creator.toLowerCase().includes(term))
  );
};

// Helper function to get comics by publication era/decade
export const getComicsByEra = (era, lang) => {
  if (!era) return [];
  const comics = getComicsByLanguage(lang);
  const eraMap = {
    'golden': 'سنہری دور', // Urdu
    'silver': 'چاندی کا دور', // Urdu
    'golden_age': 'Golden Age',
    'silver_age': 'Silver Age',
    'indian': 'Indian Superhero Comics',
    'fantasy': 'Fantasy Superhero Comics',
    'scifi': 'Science Fiction Comics'
  };
  
  const searchEra = eraMap[era.toLowerCase()] || era;
  return comics.filter(comic => comic.category === searchEra || comic.category.toLowerCase().includes(searchEra.toLowerCase()));
};

// Helper function to get comics by rating range
export const getComicsByRating = (minRating, lang) => {
  if (!minRating) return [];
  const comics = getComicsByLanguage(lang);
  return comics.filter(comic => comic.rating >= minRating);
};

// Helper function to get featured comics (top rated)
export const getFeaturedComics = (limit = 6, lang) => {
  const comics = getComicsByLanguage(lang);
  return [...comics].sort((a, b) => b.rating - a.rating).slice(0, limit);
};

// Helper function to get all unique categories
export const getAllCategories = (lang) => {
  const comics = getComicsByLanguage(lang);
  const categories = new Set();
  comics.forEach(comic => {
    if (comic.category) categories.add(comic.category);
  });
  return Array.from(categories);
};

// Helper function to get all unique publishers
export const getAllPublishers = (lang) => {
  const comics = getComicsByLanguage(lang);
  const publishers = new Set();
  comics.forEach(comic => {
    if (comic.publisher) publishers.add(comic.publisher);
  });
  return Array.from(publishers);
};

// Helper function to get comics by character introduction
export const getComicsByCharacter = (characterName, lang) => {
  if (!characterName) return [];
  const comics = getComicsByLanguage(lang);
  const term = characterName.toLowerCase();
  return comics.filter(comic => 
    comic.charactersIntroduced?.some(character => character.toLowerCase().includes(term))
  );
};

// Helper function to get comics by creator
export const getComicsByCreator = (creatorName, lang) => {
  if (!creatorName) return [];
  const comics = getComicsByLanguage(lang);
  const term = creatorName.toLowerCase();
  return comics.filter(comic => 
    comic.creators?.writersArtists?.some(creator => creator.toLowerCase().includes(term)) ||
    comic.creators?.editor?.toLowerCase().includes(term)
  );
};

// Helper function to get random comics
export const getRandomComics = (count = 3, lang) => {
  const comics = getComicsByLanguage(lang);
  const shuffled = [...comics];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

// Helper function to get comics by publication decade
export const getComicsByDecade = (decade, lang) => {
  if (!decade) return [];
  const comics = getComicsByLanguage(lang);
  const startYear = parseInt(decade);
  const endYear = startYear + 9;
  
  return comics.filter(comic => {
    // Extract year from publicationDate string (assuming format like "October 1939" or "1989")
    const yearMatch = comic.publicationDate?.match(/\d{4}/);
    if (!yearMatch) return false;
    const year = parseInt(yearMatch[0]);
    return year >= startYear && year <= endYear;
  });
};

// Default export for backward compatibility
const comicsData = ComicsData;
export default comicsData;