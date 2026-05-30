import { aboutEnglish } from "./about_english";
import { aboutHindi } from "./about_hindi";
import { aboutUrdu } from "./about_urdu";
import { aboutArabic } from "./about_arabic";
import { aboutBangla } from "./about_bangla";
import { aboutMarathi } from "./about_marathi";
import { aboutTamil } from "./about_tamil";
import { aboutKannada } from "./about_kannada";
import { aboutChinese } from "./about_chinese";
import { aboutFrench } from "./about_french";
import { aboutGerman } from "./about_german";
import { aboutItalian } from "./about_italian";
import { aboutJapanese } from "./about_japanese";
import { aboutKorean } from "./about_korean";
import { aboutPersian } from "./about_persian";
import { aboutRussian } from "./about_russian";

export const aboutTranslations = {
  en: aboutEnglish,
  hi: aboutHindi,
  ur: aboutUrdu,
  ar: aboutArabic,
  bn: aboutBangla,
  mr: aboutMarathi,
  ta: aboutTamil,
  kn: aboutKannada,
  zh: aboutChinese,
  fr: aboutFrench,
  de: aboutGerman,
  it: aboutItalian,
  ja: aboutJapanese,
  ko: aboutKorean,
  fa: aboutPersian,
  ru: aboutRussian
};

export const getAboutTranslation = (lang) => {
  return aboutTranslations[lang] || aboutTranslations.en;
};

// List of all supported languages for about page
export const supportedAboutLanguages = [
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

// Helper function to get about page content for SEO
export const getAboutMetaData = (lang) => {
  const translations = getAboutTranslation(lang);
  return {
    title: translations["about.hero.title"],
    description: translations["about.hero.subtitle"],
    keywords: "bookqubit, about us, online library, digital books, reading platform"
  };
};