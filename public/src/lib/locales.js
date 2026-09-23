// Language codes match the cookie values you already use in Navbar (setCookie("lang", ...)).
// File names are full language names, so we keep a code -> file map.
export const locales = [
  'en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa',
  'ur', 'ar', 'es', 'fr', 'de', 'pt', 'ru', 'zh', 'ja', 'ko',
];

export const defaultLocale = 'en';

// cookie code -> filename (no extension) in src/translations/
export const localeFile = {
  en: 'english',
  hi: 'hindi',
  bn: 'bengali',
  ta: 'tamil',
  te: 'telugu',
  mr: 'marathi',
  gu: 'gujarati',
  kn: 'kannada',
  ml: 'malayalam',
  pa: 'punjabi',
  ur: 'urdu',
  ar: 'arabic',
  es: 'spanish',
  fr: 'french',
  de: 'german',
  pt: 'portuguese',
  ru: 'russian',
  zh: 'chinese',
  ja: 'japanese',
  ko: 'korean',
};

export const rtlLocales = new Set(['ar', 'ur']);
export function isRtl(l) { return rtlLocales.has(l); }