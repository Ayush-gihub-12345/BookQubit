// src/datalang/authors_translations/index.js

import authorsTranslationsEnglish from './authors_translations_english';
import authorsTranslationsHindi from './authors_translations_hindi';
import authorsTranslationsUrdu from './authors_translations_urdu';

// For languages without specific translations, use English as fallback
const authorsTranslations = {
  en: authorsTranslationsEnglish,
  hi: authorsTranslationsHindi,
  ur: authorsTranslationsUrdu,
  ar: authorsTranslationsEnglish, // Fallback to English
  bn: authorsTranslationsEnglish,
  mr: authorsTranslationsEnglish,
  ta: authorsTranslationsEnglish,
  kn: authorsTranslationsEnglish,
  te: authorsTranslationsEnglish,
  ml: authorsTranslationsEnglish,
  es: authorsTranslationsEnglish,
  ps: authorsTranslationsUrdu, // Pashto uses Urdu structure (RTL)
  zh: authorsTranslationsEnglish,
  fr: authorsTranslationsEnglish,
  de: authorsTranslationsEnglish,
  it: authorsTranslationsEnglish,
  ja: authorsTranslationsEnglish,
  ko: authorsTranslationsEnglish,
  fa: authorsTranslationsUrdu, // Persian uses Urdu structure (RTL)
  ru: authorsTranslationsEnglish,
};

// Helper function to get authors translations by language code
export const getAuthorsTranslations = (languageCode = 'en') => {
  return authorsTranslations[languageCode] || authorsTranslations.en;
};

// Export individual language translations
export { 
  authorsTranslationsEnglish, 
  authorsTranslationsHindi, 
  authorsTranslationsUrdu 
};

// Default export for backward compatibility
export default authorsTranslations;

// Export all translations object
export { authorsTranslations };