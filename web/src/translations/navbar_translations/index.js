import navbarEnglish from "./navbar_translations_english";
import navbarHindi from "./navbar_translations_hindi";
import navbarUrdu from "./navbar_translations_urdu";
import navbarArabic from "./navbar_translations_arabic";
import navbarBangla from "./navbar_translations_bangla";
import navbarMarathi from "./navbar_translations_marathi";
import navbarTamil from "./navbar_translations_tamil";
import navbarKannada from "./navbar_translations_kannada";
import navbarTelugu from "./navbar_translations_telugu";
import navbarMalayalam from "./navbar_translations_malayalam";
import navbarSpanish from "./navbar_translations_spanish";
import navbarPashto from "./navbar_translations_pashto";
import navbarChinese from "./navbar_translations_chinese";
import navbarFrench from "./navbar_translations_french";
import navbarGerman from "./navbar_translations_german";
import navbarItalian from "./navbar_translations_italian";
import navbarJapanese from "./navbar_translations_japanese";
import navbarKorean from "./navbar_translations_korean";
import navbarPersian from "./navbar_translations_persian";
import navbarRussian from "./navbar_translations_russian";

// Export all translations
export const navbarTranslations = {
  en: navbarEnglish,
  hi: navbarHindi,
  ur: navbarUrdu,
  ar: navbarArabic,
  bn: navbarBangla,
  mr: navbarMarathi,
  ta: navbarTamil,
  kn: navbarKannada,
  te: navbarTelugu,
  ml: navbarMalayalam,
  es: navbarSpanish,
  ps: navbarPashto,
  zh: navbarChinese,
  fr: navbarFrench,
  de: navbarGerman,
  it: navbarItalian,
  ja: navbarJapanese,
  ko: navbarKorean,
  fa: navbarPersian,
  ru: navbarRussian
};

// Get navbar translation for a specific language
export const getNavbarTranslation = (lang) => {
  return navbarTranslations[lang] || navbarTranslations.en;
};

// List of supported languages with their codes and native names
export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", direction: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳", direction: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", direction: "rtl" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", direction: "rtl" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩", direction: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", direction: "ltr" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", direction: "ltr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", direction: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", direction: "ltr" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", direction: "ltr" },
  { code: "ps", name: "Pashto", nativeName: "پښتو", flag: "🇦🇫", direction: "rtl" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", direction: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", direction: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", direction: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", direction: "ltr" },
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", direction: "rtl" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", direction: "ltr" }
];

// Helper function to get RTL languages
export const getRtlLanguages = () => {
  return supportedLanguages.filter(lang => lang.direction === "rtl").map(lang => lang.code);
};

// Helper function to get LTR languages
export const getLtrLanguages = () => {
  return supportedLanguages.filter(lang => lang.direction === "ltr").map(lang => lang.code);
};

// Helper function to get language by code
export const getLanguageByCode = (code) => {
  return supportedLanguages.find(lang => lang.code === code);
};

// Helper function to check if a language is RTL
export const isRtlLanguage = (code) => {
  const language = getLanguageByCode(code);
  return language?.direction === "rtl";
};

// Default export for convenience
export default navbarTranslations;