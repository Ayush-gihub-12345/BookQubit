import { footerTranslationsEnglish } from "./footerTranslationsEnglish";
import { footerTranslationsHindi } from "./footerTranslationsHindi";
import { footerTranslationsUrdu } from "./footerTranslationsUrdu";
import { footerTranslationsArabic } from "./footerTranslationsArabic";
import { footerTranslationsBangla } from "./footerTranslationsBangla";
import { footerTranslationsMarathi } from "./footerTranslationsMarathi";
import { footerTranslationsTamil } from "./footerTranslationsTamil";
import { footerTranslationsKannada } from "./footerTranslationsKannada";
import { footerTranslationsChinese } from "./footerTranslationsChinese";
import { footerTranslationsFrench } from "./footerTranslationsFrench";
import { footerTranslationsGerman } from "./footerTranslationsGerman";
import { footerTranslationsItalian } from "./footerTranslationsItalian";
import { footerTranslationsJapanese } from "./footerTranslationsJapanese";
import { footerTranslationsKorean } from "./footerTranslationsKorean";
import { footerTranslationsPersian } from "./footerTranslationsPersian";
import { footerTranslationsRussian } from "./footerTranslationsRussian";
import { footerTranslationsMalayalam } from "./footerTranslationsMalayalam";
import { footerTranslationsPashto } from "./footerTranslationsPashto";
import { footerTranslationsSpanish } from "./footerTranslationsSpanish";
import { footerTranslationsTelugu } from "./footerTranslationsTelugu";

export const footerTranslations = {
  en: footerTranslationsEnglish,
  hi: footerTranslationsHindi,
  ur: footerTranslationsUrdu,
  ar: footerTranslationsArabic,
  bn: footerTranslationsBangla,
  mr: footerTranslationsMarathi,
  ta: footerTranslationsTamil,
  kn: footerTranslationsKannada,
  zh: footerTranslationsChinese,
  fr: footerTranslationsFrench,
  de: footerTranslationsGerman,
  it: footerTranslationsItalian,
  ja: footerTranslationsJapanese,
  ko: footerTranslationsKorean,
  fa: footerTranslationsPersian,
  ru: footerTranslationsRussian,
  ml: footerTranslationsMalayalam,
  ps: footerTranslationsPashto,
  es: footerTranslationsSpanish,
  te: footerTranslationsTelugu
};

export const getFooterTranslation = (lang) => {
  return footerTranslations[lang] || footerTranslations.en;
};

// List of all supported languages for footer
export const supportedFooterLanguages = [
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
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "ps", name: "Pashto", nativeName: "پښتو" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" }
];

// Default export for backward compatibility
const footerTranslationsData = footerTranslationsEnglish;
export default footerTranslationsData;