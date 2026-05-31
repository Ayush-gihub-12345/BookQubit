// src/data/authors/index.js
import authorsDataEnglish from './authors_data_english';
import authorsDataHindi from './authors_data_hindi';
import authorsDataUrdu from './authors_data_urdu';

const authorsData = {
  en: authorsDataEnglish,
  hi: authorsDataHindi,
  ur: authorsDataUrdu,
};

// Helper function to get authors data by language code
export const getAuthorsDataByLanguage = (languageCode = 'en') => {
  return authorsData[languageCode] || authorsData.en;
};

// Export individual language data
export { 
  authorsDataEnglish, 
  authorsDataHindi, 
  authorsDataUrdu 
};

// Default export for English (backward compatibility)
export default authorsDataEnglish;

// Export all languages data
export { authorsData };