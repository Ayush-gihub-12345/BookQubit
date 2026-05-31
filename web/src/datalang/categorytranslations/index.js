import { categoryTranslationsEnglish } from "./categoryTranslationsEnglish";
import { categoryTranslationsHindi } from "./categoryTranslationsHindi";
import { categoryTranslationsUrdu } from "./categoryTranslationsUrdu";
// import { categoryTranslationsArabic } from "./categoryTranslationsArabic";
// import { categoryTranslationsBangla } from "./categoryTranslationsBangla";
// import { categoryTranslationsMarathi } from "./categoryTranslationsMarathi";
// import { categoryTranslationsTamil } from "./categoryTranslationsTamil";
// import { categoryTranslationsKannada } from "./categoryTranslationsKannada";
// import { categoryTranslationsChinese } from "./categoryTranslationsChinese";
// import { categoryTranslationsFrench } from "./categoryTranslationsFrench";
// import { categoryTranslationsGerman } from "./categoryTranslationsGerman";
// import { categoryTranslationsItalian } from "./categoryTranslationsItalian";
// import { categoryTranslationsJapanese } from "./categoryTranslationsJapanese";
// import { categoryTranslationsKorean } from "./categoryTranslationsKorean";
// import { categoryTranslationsPersian } from "./categoryTranslationsPersian";
// import { categoryTranslationsRussian } from "./categoryTranslationsRussian";

export const categoryTranslations = {
  en: categoryTranslationsEnglish,
  hi: categoryTranslationsHindi,
  ur: categoryTranslationsUrdu,
//   ar: categoryTranslationsArabic,
//   bn: categoryTranslationsBangla,
//   mr: categoryTranslationsMarathi,
//   ta: categoryTranslationsTamil,
//   kn: categoryTranslationsKannada,
//   zh: categoryTranslationsChinese,
//   fr: categoryTranslationsFrench,
//   de: categoryTranslationsGerman,
//   it: categoryTranslationsItalian,
//   ja: categoryTranslationsJapanese,
//   ko: categoryTranslationsKorean,
//   fa: categoryTranslationsPersian,
//   ru: categoryTranslationsRussian
};

// Get category translations by language with fallback to English
export const getCategoryTranslations = (lang) => {
  return categoryTranslations[lang] || categoryTranslations.en;
};

// Helper function to get a specific translation key
export const getCategoryTranslation = (key, lang) => {
  const translations = getCategoryTranslations(lang);
  return translations[key] || categoryTranslations.en[key] || key;
};

// Helper function to get all category page translations
export const getCategoryPageTranslations = (lang) => {
  const translations = getCategoryTranslations(lang);
  return {
    browseByCategory: translations["category.browse_by_category"],
    searchCategories: translations["category.search_categories"],
    searchPlaceholder: translations["category.search_placeholder"],
    filterByCategories: translations["category.filter_by_categories"],
    clearAllFilters: translations["category.clear_all_filters"],
    selectCategories: translations["category.select_categories"],
    activeFilters: translations["category.active_filters"],
    search: translations["category.search"],
    noCategoriesFound: translations["category.no_categories_found"],
    clearFilters: translations["category.clear_filters"],
    noBooksMatch: translations["category.no_books_match"]
  };
};

// List of all supported languages for category translations
export const supportedCategoryLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
//   { code: "ar", name: "Arabic", nativeName: "العربية" },
//   { code: "bn", name: "Bangla", nativeName: "বাংলা" },
//   { code: "mr", name: "Marathi", nativeName: "मराठी" },
//   { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
//   { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
//   { code: "zh", name: "Chinese", nativeName: "中文" },
//   { code: "fr", name: "French", nativeName: "Français" },
//   { code: "de", name: "German", nativeName: "Deutsch" },
//   { code: "it", name: "Italian", nativeName: "Italiano" },
//   { code: "ja", name: "Japanese", nativeName: "日本語" },
//   { code: "ko", name: "Korean", nativeName: "한국어" },
//   { code: "fa", name: "Persian", nativeName: "فارسی" },
//   { code: "ru", name: "Russian", nativeName: "Русский" }
];

// Default export for backward compatibility
const categoryTranslationsData = categoryTranslationsEnglish;
export default categoryTranslationsData;