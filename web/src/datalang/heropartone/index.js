import { heropartoneTranslationsEnglish } from "./heropartoneTranslationsEnglish";
import { heropartoneTranslationsHindi } from "./heropartoneTranslationsHindi";
import { heropartoneTranslationsUrdu } from "./heropartoneTranslationsUrdu";
import { heropartoneTranslationsArabic } from "./heropartoneTranslationsArabic";
import { heropartoneTranslationsBangla } from "./heropartoneTranslationsBangla";
import { heropartoneTranslationsMarathi } from "./heropartoneTranslationsMarathi";
import { heropartoneTranslationsTamil } from "./heropartoneTranslationsTamil";
import { heropartoneTranslationsKannada } from "./heropartoneTranslationsKannada";
import { heropartoneTranslationsChinese } from "./heropartoneTranslationsChinese";
import { heropartoneTranslationsFrench } from "./heropartoneTranslationsFrench";
import { heropartoneTranslationsGerman } from "./heropartoneTranslationsGerman";
import { heropartoneTranslationsItalian } from "./heropartoneTranslationsItalian";
import { heropartoneTranslationsJapanese } from "./heropartoneTranslationsJapanese";
import { heropartoneTranslationsKorean } from "./heropartoneTranslationsKorean";
import { heropartoneTranslationsPersian } from "./heropartoneTranslationsPersian";
import { heropartoneTranslationsRussian } from "./heropartoneTranslationsRussian";

export const heropartoneTranslations = {
  en: heropartoneTranslationsEnglish,
  hi: heropartoneTranslationsHindi,
  ur: heropartoneTranslationsUrdu,
  ar: heropartoneTranslationsArabic,
  bn: heropartoneTranslationsBangla,
  mr: heropartoneTranslationsMarathi,
  ta: heropartoneTranslationsTamil,
  kn: heropartoneTranslationsKannada,
  zh: heropartoneTranslationsChinese,
  fr: heropartoneTranslationsFrench,
  de: heropartoneTranslationsGerman,
  it: heropartoneTranslationsItalian,
  ja: heropartoneTranslationsJapanese,
  ko: heropartoneTranslationsKorean,
  fa: heropartoneTranslationsPersian,
  ru: heropartoneTranslationsRussian
};

export const getHeropartoneTranslation = (lang) => {
  return heropartoneTranslations[lang] || heropartoneTranslations.en;
};

// List of all supported languages for hero part one section
export const supportedHeropartoneLanguages = [
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

// Helper function to get hero part one metadata for SEO
export const getHeropartoneMetaData = (lang) => {
  const translations = getHeropartoneTranslation(lang);
  return {
    title: translations["hero.hero_part_one.heading1"],
    description: translations["hero.hero_part_one.subtext"],
    keywords: "books, reading, discover, adventure, knowledge, inspiration, wisdom, imagination"
  };
};