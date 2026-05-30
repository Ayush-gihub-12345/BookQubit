import { academicBooksTranslationsEnglish } from "./academicBooksTranslationsEnglish";
import { academicBooksTranslationsHindi } from "./academicBooksTranslationsHindi";
import { academicBooksTranslationsUrdu } from "./academicBooksTranslationsUrdu";
import { academicBooksTranslationsArabic } from "./academicBooksTranslationsArabic";
import { academicBooksTranslationsBangla } from "./academicBooksTranslationsBangla";
import { academicBooksTranslationsMarathi } from "./academicBooksTranslationsMarathi";
import { academicBooksTranslationsTamil } from "./academicBooksTranslationsTamil";
import { academicBooksTranslationsKannada } from "./academicBooksTranslationsKannada";
import { academicBooksTranslationsChinese } from "./academicBooksTranslationsChinese";
import { academicBooksTranslationsFrench } from "./academicBooksTranslationsFrench";
import { academicBooksTranslationsGerman } from "./academicBooksTranslationsGerman";
import { academicBooksTranslationsItalian } from "./academicBooksTranslationsItalian";
import { academicBooksTranslationsJapanese } from "./academicBooksTranslationsJapanese";
import { academicBooksTranslationsKorean } from "./academicBooksTranslationsKorean";
import { academicBooksTranslationsPersian } from "./academicBooksTranslationsPersian";
import { academicBooksTranslationsRussian } from "./academicBooksTranslationsRussian";

export const academicBooksTranslations = {
  en: academicBooksTranslationsEnglish,
  hi: academicBooksTranslationsHindi,
  ur: academicBooksTranslationsUrdu,
  ar: academicBooksTranslationsArabic,
  bn: academicBooksTranslationsBangla,
  mr: academicBooksTranslationsEnglish,
  ta: academicBooksTranslationsTamil,
  kn: academicBooksTranslationsEnglish,
  zh: academicBooksTranslationsChinese,
  fr: academicBooksTranslationsEnglish,
  de: academicBooksTranslationsEnglish,
  it: academicBooksTranslationsEnglish,
  ja: academicBooksTranslationsEnglish,
  ko: academicBooksTranslationsEnglish,
  fa: academicBooksTranslationsEnglish,
  ru: academicBooksTranslationsEnglish,
};

// Get academic books translations by language with fallback to English
export const getAcademicBooksTranslations = (lang) => {
  return academicBooksTranslations[lang] || academicBooksTranslations.en;
};

// Helper function to get a specific translation by key
export const getAcademicTranslation = (key, lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return translations[key] || academicBooksTranslations.en[key] || key;
};

// Helper function to get all category translations
export const getAcademicCategories = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    mathematics: translations["academic.category.mathematics"],
    physics: translations["academic.category.physics"],
    computer_science: translations["academic.category.computer_science"],
    chemistry: translations["academic.category.chemistry"],
    psychology: translations["academic.category.psychology"],
    business: translations["academic.category.business"],
    economics: translations["academic.category.economics"],
    biology: translations["academic.category.biology"],
    medicine: translations["academic.category.medicine"],
    engineering: translations["academic.category.engineering"],
    history: translations["academic.category.history"],
    statistics: translations["academic.category.statistics"],
    environmental_science: translations["academic.category.environmental_science"]
  };
};

// Helper function to get all level translations
export const getAcademicLevels = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    beginner: translations["academic.level.beginner"],
    intermediate: translations["academic.level.intermediate"],
    advanced: translations["academic.level.advanced"]
  };
};

// Helper function to get all tab translations
export const getAcademicTabs = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    overview: translations["academic.tab.overview"],
    features: translations["academic.tab.features"],
    details: translations["academic.tab.details"],
    reviews: translations["academic.tab.reviews"]
  };
};

// Helper function to get all button translations
export const getAcademicButtons = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    downloadSample: translations["academic.button.download_sample"],
    preview: translations["academic.button.preview"],
    getBook: translations["academic.button.get_book"],
    viewDetails: translations["academic.button.view_details"],
    browseAll: translations["academic.button.browse_all"],
    exploreMore: translations["academic.button.explore_more"],
    back: translations["academic.button.back"]
  };
};

// Helper function to get all filter translations
export const getAcademicFilters = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    title: translations["academic.filter.title"],
    category: translations["academic.filter.category"],
    level: translations["academic.filter.level"],
    subject: translations["academic.filter.subject"],
    priceRange: translations["academic.filter.price_range"],
    reset: translations["academic.filter.reset"],
    apply: translations["academic.filter.apply"],
    all: translations["academic.filter.all"]
  };
};

// Helper function to get all search translations
export const getAcademicSearch = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    placeholder: translations["academic.search.placeholder"],
    noResults: translations["academic.search.no_results"],
    search: translations["academic.search.search"],
    tryAdjusting: translations["academic.search.try_adjusting"]
  };
};

// Helper function to get all pagination translations
export const getAcademicPagination = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    showing: translations["academic.pagination.showing"],
    of: translations["academic.pagination.of"],
    results: translations["academic.pagination.results"]
  };
};

// Helper function to get all message translations
export const getAcademicMessages = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    loading: translations["academic.message.loading"],
    error: translations["academic.message.error"],
    noBooks: translations["academic.message.no_books"],
    notFound: translations["academic.message.not_found"]
  };
};

// Helper function to get all sort translations
export const getAcademicSort = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    popular: translations["academic.sort.popular"],
    rating: translations["academic.sort.rating"],
    title: translations["academic.sort.title"],
    priceLowHigh: translations["academic.sort.price_low_high"],
    priceHighLow: translations["academic.sort.price_high_low"],
    newest: translations["academic.sort.newest"],
    oldest: translations["academic.sort.oldest"]
  };
};

// Helper function to get all review translations
export const getAcademicReviews = (lang) => {
  const translations = getAcademicBooksTranslations(lang);
  return {
    noReviews: translations["academic.reviews.no_reviews"],
    beFirst: translations["academic.reviews.be_first"],
    writeReview: translations["academic.reviews.write_review"],
    rating: translations["academic.reviews.rating"],
    title: translations["academic.reviews.title"],
    content: translations["academic.reviews.content"],
    submit: translations["academic.reviews.submit"]
  };
};

// List of all supported languages for academic books
export const supportedAcademicLanguages = [
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

// Default export for backward compatibility
const academicBooksTranslationsData = academicBooksTranslationsEnglish;
export default academicBooksTranslationsData;