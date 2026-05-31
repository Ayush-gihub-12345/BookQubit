import { bookTranslationsEnglish } from "./bookTranslationsEnglish";
import { bookTranslationsHindi } from "./bookTranslationsHindi";
import { bookTranslationsUrdu } from "./bookTranslationsUrdu";
import { bookTranslationsArabic } from "./bookTranslationsArabic";
import { bookTranslationsBangla } from "./bookTranslationsBangla";
import { bookTranslationsMarathi } from "./bookTranslationsMarathi";
import { bookTranslationsTamil } from "./bookTranslationsTamil";
import { bookTranslationsKannada } from "./bookTranslationsKannada";
import { bookTranslationsChinese } from "./bookTranslationsChinese";
import { bookTranslationsFrench } from "./bookTranslationsFrench";
import { bookTranslationsGerman } from "./bookTranslationsGerman";
import { bookTranslationsItalian } from "./bookTranslationsItalian";
import { bookTranslationsJapanese } from "./bookTranslationsJapanese";
import { bookTranslationsKorean } from "./bookTranslationsKorean";
import { bookTranslationsPersian } from "./bookTranslationsPersian";
import { bookTranslationsRussian } from "./bookTranslationsRussian";

export const bookTranslations = {
  en: bookTranslationsEnglish,
  hi: bookTranslationsHindi,
  ur: bookTranslationsUrdu,
  ar: bookTranslationsArabic,
  bn: bookTranslationsBangla,
  mr: bookTranslationsMarathi,
  ta: bookTranslationsTamil,
  kn: bookTranslationsKannada,
  zh: bookTranslationsChinese,
  fr: bookTranslationsFrench,
  de: bookTranslationsGerman,
  it: bookTranslationsItalian,
  ja: bookTranslationsJapanese,
  ko: bookTranslationsKorean,
  fa: bookTranslationsPersian,
  ru: bookTranslationsRussian
};

export const getBookTranslation = (lang) => {
  return bookTranslations[lang] || bookTranslations.en;
};

// List of all supported languages for book translations
export const supportedBookLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ru", name: "Russian", nativeName: "Русский" }
];