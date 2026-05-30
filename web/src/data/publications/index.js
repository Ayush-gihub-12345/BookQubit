// src/data/publications/index.js

import publicationsDataEnglish from './publications.data_english';
import publicationsDataHindi from './publications.data_hindi';
import publicationsDataUrdu from './publications.data_urdu';

const publicationsData = {
  en: publicationsDataEnglish,
  hi: publicationsDataHindi,
  ur: publicationsDataUrdu,
};

// Helper function to get publications data by language code
export const getPublicationsDataByLanguage = (languageCode = 'en') => {
  return publicationsData[languageCode] || publicationsData.en;
};

// Export individual language data
export { 
  publicationsDataEnglish, 
  publicationsDataHindi, 
  publicationsDataUrdu 
};

// Default export for English (backward compatibility)
export default publicationsDataEnglish;

// Export all languages data
export { publicationsData };