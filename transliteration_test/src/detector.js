/**
 * Language and script detection utilities
 */

export const NON_LATIN_LANGUAGES = new Set([
  'hi', 'bn', 'ta', 'te', 'kn', 'ml', 'gu', 'pa', 'or',
  'ja', 'ko', 'zh', 'ar', 'fa', 'ur', 'ru', 'uk', 'el', 'si'
]);

export function detectScript(text) {
  if (!text || text.length === 0) return 'unknown';
  
  const firstChar = text.codePointAt(0) || 0;
  
  // Latin
  if ((firstChar >= 0x0041 && firstChar <= 0x007A) || 
      (firstChar >= 0x00C0 && firstChar <= 0x00FF)) {
    return 'latin';
  }
  
  // Devanagari (Hindi, Marathi, Sanskrit, etc.)
  if (firstChar >= 0x0900 && firstChar <= 0x097F) {
    return 'devanagari';
  }
  
  // Bengali
  if (firstChar >= 0x0980 && firstChar <= 0x09FF) {
    return 'bengali';
  }
  
  // Gurmukhi (Punjabi)
  if (firstChar >= 0x0A00 && firstChar <= 0x0A7F) {
    return 'gurmukhi';
  }
  
  // Gujarati
  if (firstChar >= 0x0A80 && firstChar <= 0x0AFF) {
    return 'gujarati';
  }
  
  // Oriya
  if (firstChar >= 0x0B00 && firstChar <= 0x0B7F) {
    return 'oriya';
  }
  
  // Tamil
  if (firstChar >= 0x0B80 && firstChar <= 0x0BFF) {
    return 'tamil';
  }
  
  // Telugu
  if (firstChar >= 0x0C00 && firstChar <= 0x0C7F) {
    return 'telugu';
  }
  
  // Kannada
  if (firstChar >= 0x0C80 && firstChar <= 0x0CFF) {
    return 'kannada';
  }
  
  // Malayalam
  if (firstChar >= 0x0D00 && firstChar <= 0x0D7F) {
    return 'malayalam';
  }
  
  // Sinhala
  if (firstChar >= 0x0D80 && firstChar <= 0x0DFF) {
    return 'sinhala';
  }
  
  // Cyrillic
  if (firstChar >= 0x0400 && firstChar <= 0x04FF) {
    return 'cyrillic';
  }
  
  // Arabic
  if (firstChar >= 0x0600 && firstChar <= 0x06FF) {
    return 'arabic';
  }
  
  // Japanese (Hiragana/Katakana/Kanji)
  if ((firstChar >= 0x3040 && firstChar <= 0x30FF) || 
      (firstChar >= 0x4E00 && firstChar <= 0x9FFF)) {
    return 'japanese';
  }
  
  // Korean
  if (firstChar >= 0xAC00 && firstChar <= 0xD7AF) {
    return 'korean';
  }
  
  // Thai
  if (firstChar >= 0x0E00 && firstChar <= 0x0E7F) {
    return 'thai';
  }
  
  return 'other';
}

export function needsTransliteration(targetLang) {
  return NON_LATIN_LANGUAGES.has(targetLang);
}

export function getDefaultTarget(script) {
  const map = {
    'latin': 'hi',
    'devanagari': 'latin',
    'bengali': 'latin',
    'cyrillic': 'latin',
    'arabic': 'latin',
    'japanese': 'latin',
    'korean': 'latin',
    'tamil': 'latin',
    'telugu': 'latin',
    'kannada': 'latin',
    'malayalam': 'latin',
    'gujarati': 'latin',
    'gurmukhi': 'latin',
    'oriya': 'latin',
    'sinhala': 'latin',
  };
  return map[script] || 'latin';
}

export function getDefaultSource(script) {
  const map = {
    'latin': 'en',
    'devanagari': 'hi',
    'bengali': 'bn',
    'cyrillic': 'ru',
    'arabic': 'ar',
    'japanese': 'ja',
    'korean': 'ko',
    'tamil': 'ta',
    'telugu': 'te',
    'kannada': 'kn',
    'malayalam': 'ml',
    'gujarati': 'gu',
    'gurmukhi': 'pa',
    'oriya': 'or',
    'sinhala': 'si',
  };
  return map[script] || 'en';
}

export default {
  detectScript,
  needsTransliteration,
  getDefaultTarget,
  getDefaultSource,
  NON_LATIN_LANGUAGES,
};