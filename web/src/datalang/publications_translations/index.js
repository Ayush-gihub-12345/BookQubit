// src/datalang/publications_translations/index.js

import publicationsTranslationsEnglish from './publications_translations_english';
import publicationsTranslationsHindi from './publications_translations_hindi';
import publicationsTranslationsUrdu from './publications_translations_urdu';

const publicationsTranslations = {
  en: publicationsTranslationsEnglish,
  hi: publicationsTranslationsHindi,
  ur: publicationsTranslationsUrdu,
  // Fallback for other languages
  ar: publicationsTranslationsEnglish,
  bn: publicationsTranslationsEnglish,
  mr: publicationsTranslationsEnglish,
  ta: publicationsTranslationsEnglish,
  kn: publicationsTranslationsEnglish,
  te: publicationsTranslationsEnglish,
  ml: publicationsTranslationsEnglish,
  es: publicationsTranslationsEnglish,
  ps: publicationsTranslationsUrdu,
  zh: publicationsTranslationsEnglish,
  fr: publicationsTranslationsEnglish,
  de: publicationsTranslationsEnglish,
  it: publicationsTranslationsEnglish,
  ja: publicationsTranslationsEnglish,
  ko: publicationsTranslationsEnglish,
  fa: publicationsTranslationsUrdu,
  ru: publicationsTranslationsEnglish,
};

// Helper function to get publications translations by language code
export const getPublicationsTranslations = (languageCode = 'en') => {
  return publicationsTranslations[languageCode] || publicationsTranslations.en;
};

// Export individual language translations
export { 
  publicationsTranslationsEnglish, 
  publicationsTranslationsHindi, 
  publicationsTranslationsUrdu 
};

// Default export for backward compatibility
export default publicationsTranslationsEnglish;

// Export all translations object
export { publicationsTranslations };