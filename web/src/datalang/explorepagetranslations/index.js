import { explorepageTranslationsEnglish } from "./explorepagetranslations_english";
import { explorepageTranslationsHindi } from "./explorepagetranslations_hindi";
import { explorepageTranslationsUrdu } from "./explorepagetranslations_urdu";
import { explorepageTranslationsArabic } from "./explorepagetranslations_arabic";
import { explorepageTranslationsBangla } from "./explorepagetranslations_bangla";
import { explorepageTranslationsMarathi } from "./explorepagetranslations_marathi";
import { explorepageTranslationsTamil } from "./explorepagetranslations_tamil";
import { explorepageTranslationsKannada } from "./explorepagetranslations_kannada";
import { explorepageTranslationsTelugu } from "./explorepagetranslations_telugu";
import { explorepageTranslationsMalayalam } from "./explorepagetranslations_malayalam";
import { explorepageTranslationsPashto } from "./explorepagetranslations_pashto";
import { explorepageTranslationsSpanish } from "./explorepagetranslations_spanish";
import { explorepageTranslationsChinese } from "./explorepagetranslations_chinese";
import { explorepageTranslationsFrench } from "./explorepagetranslations_french";
import { explorepageTranslationsGerman } from "./explorepagetranslations_german";
import { explorepageTranslationsItalian } from "./explorepagetranslations_italian";
import { explorepageTranslationsJapanese } from "./explorepagetranslations_japanese";
import { explorepageTranslationsKorean } from "./explorepagetranslations_korean";
import { explorepageTranslationsPersian } from "./explorepagetranslations_persian";
import { explorepageTranslationsRussian } from "./explorepagetranslations_russian";

export const explorepageTranslations = {
  en: explorepageTranslationsEnglish,
  hi: explorepageTranslationsHindi,
  ur: explorepageTranslationsUrdu,
  ar: explorepageTranslationsArabic,
  bn: explorepageTranslationsBangla,
  mr: explorepageTranslationsMarathi,
  ta: explorepageTranslationsTamil,
  kn: explorepageTranslationsKannada,
  te: explorepageTranslationsTelugu,
  ml: explorepageTranslationsMalayalam,
  ps: explorepageTranslationsPashto,
  es: explorepageTranslationsSpanish,
  zh: explorepageTranslationsChinese,
  fr: explorepageTranslationsFrench,
  de: explorepageTranslationsGerman,
  it: explorepageTranslationsItalian,
  ja: explorepageTranslationsJapanese,
  ko: explorepageTranslationsKorean,
  fa: explorepageTranslationsPersian,
  ru: explorepageTranslationsRussian
};

export const getExplorepageTranslation = (lang) => {
  return explorepageTranslations[lang] || explorepageTranslations.en;
};

// List of all supported languages for explore page
export const supportedExplorepageLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "ps", name: "Pashto", nativeName: "پښتو" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ru", name: "Russian", nativeName: "Русский" }
];

// Helper function to get explore page metadata for SEO
export const getExplorepageMetaData = (lang) => {
  const translations = getExplorepageTranslation(lang);
  return {
    title: `${translations["explorepage.header_title_prefix"]} ${translations["explorepage.header_title_highlight"]}`,
    description: translations["explorepage.header_subtitle"],
    keywords: "books, reading, library, book collections, authors, book reviews, news, blog"
  };
};

// Default export for backward compatibility
const explorepageTranslationsData = explorepageTranslationsEnglish;
export default explorepageTranslationsData;