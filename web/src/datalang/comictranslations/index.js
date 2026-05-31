import { comicTranslationsEnglish } from "./comicTranslationsEnglish";
import { comicTranslationsHindi } from "./comicTranslationsHindi";
import { comicTranslationsUrdu } from "./comicTranslationsUrdu";
// import { comicTranslationsArabic } from "./comicTranslationsArabic";
// import { comicTranslationsBangla } from "./comicTranslationsBangla";
// import { comicTranslationsMarathi } from "./comicTranslationsMarathi";
// import { comicTranslationsTamil } from "./comicTranslationsTamil";
// import { comicTranslationsKannada } from "./comicTranslationsKannada";
// import { comicTranslationsChinese } from "./comicTranslationsChinese";
// import { comicTranslationsFrench } from "./comicTranslationsFrench";
// import { comicTranslationsGerman } from "./comicTranslationsGerman";
// import { comicTranslationsItalian } from "./comicTranslationsItalian";
// import { comicTranslationsJapanese } from "./comicTranslationsJapanese";
// import { comicTranslationsKorean } from "./comicTranslationsKorean";
// import { comicTranslationsPersian } from "./comicTranslationsPersian";
// import { comicTranslationsRussian } from "./comicTranslationsRussian";

export const comicTranslations = {
  en: comicTranslationsEnglish,
  hi: comicTranslationsHindi,
  ur: comicTranslationsUrdu,
  // ar: comicTranslationsArabic,
  // bn: comicTranslationsBangla,
  // mr: comicTranslationsMarathi,
  // ta: comicTranslationsTamil,
  // kn: comicTranslationsKannada,
  // zh: comicTranslationsChinese,
  // fr: comicTranslationsFrench,
  // de: comicTranslationsGerman,
  // it: comicTranslationsItalian,
  // ja: comicTranslationsJapanese,
  // ko: comicTranslationsKorean,
  // fa: comicTranslationsPersian,
  // ru: comicTranslationsRussian
};

// Get comic translations by language with fallback to English
export const getComicTranslations = (lang) => {
  return comicTranslations[lang] || comicTranslations.en;
};

// Helper function to get a specific translation key
export const getComicTranslation = (key, lang) => {
  const translations = getComicTranslations(lang);
  return translations[key] || comicTranslations.en[key] || key;
};

// Helper function to get all comic menu translations
export const getComicMenuTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    writers: translations["comics.menu.writers"],
    series: translations["comics.menu.series"],
    artists: translations["comics.menu.artists"],
    publishers: translations["comics.menu.publishers"],
    characters: translations["comics.menu.characters"],
    eras: translations["comics.menu.eras"],
    awards: translations["comics.menu.awards"],
    iconicIssues: translations["comics.menu.iconic_issues"]
  };
};

// Helper function to get comic card translations
export const getComicCardTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    viewDetails: translations["comic.view_details"],
    readDigital: translations["comic.read_digital"],
    collectorsGuide: translations["comic.collectors_guide"],
    quickSummary: translations["comic.quick_summary"],
    buyPhysical: translations["comic.buy_physical"],
    addToCollection: translations["comic.add_to_collection"],
    inCollection: translations["comic.in_collection"],
    digitalVersion: translations["comic.digital_version"],
    printVersion: translations["comic.print_version"],
    limitedEdition: translations["comic.limited_edition"],
    signedCopy: translations["comic.signed_copy"],
    firstPrinting: translations["comic.first_printing"],
    variantCover: translations["comic.variant_cover"],
    charactersIntroduced: translations["comic.characters_introduced"],
    funFact: translations["comic.fun_fact"],
    knowMore: translations["comic.know_more"]
  };
};

// Helper function to get comic details page translations
export const getComicDetailsTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    notFound: translations["comic.not_found"],
    notFoundMessage: translations["comic.not_found_message"],
    backToComics: translations["comic.back_to_comics"],
    storyOverview: translations["comic.story_overview"],
    didYouKnow: translations["comic.did_you_know"],
    firstAppearance: translations["comic.first_appearance"],
    characterDescription: translations["comic.character_description"],
    creativeTeam: translations["comic.creative_team"],
    editor: translations["comic.editor"],
    writersArtists: translations["comic.writers_artists"],
    collectorsInformation: translations["comic.collectors_information"],
    valueSales: translations["comic.value_sales"],
    currentMarketValue: translations["comic.current_market_value"],
    firstPrintRun: translations["comic.first_print_run"],
    secondPrint: translations["comic.second_print"],
    publicationDetails: translations["comic.publication_details"],
    coverPrice: translations["comic.cover_price"],
    format: translations["comic.format"],
    publisher: translations["comic.publisher"],
    investmentPotential: translations["comic.investment_potential"],
    investmentDescription: translations["comic.investment_description"],
    publishedBy: translations["comic.published_by"],
    era: translations["comic.era"],
    relatedComics: translations["comic.related_comics"]
  };
};

// Helper function to get comic tab translations
export const getComicTabTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    overview: translations["comic.tab.overview"],
    characters: translations["comic.tab.characters"],
    creators: translations["comic.tab.creators"],
    collectors: translations["comic.tab.collectors"]
  };
};

// Helper function to get comic filter translations
export const getComicFilterTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    publisher: translations["comic.filter.publisher"],
    filterByPublisher: translations["comic.filter.filter_by_publisher"],
    category: translations["comic.filter.category"],
    filterByCategory: translations["comic.filter.filter_by_category"],
    clearAll: translations["comic.filter.clear_all"],
    activeFilters: translations["comic.filter.active_filters"],
    all: translations["comic.filter.all"]
  };
};

// Helper function to get comic era translations
export const getComicEraTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    golden: translations["comic.era.golden"],
    silver: translations["comic.era.silver"],
    bronze: translations["comic.era.bronze"],
    modern: translations["comic.era.modern"]
  };
};

// Helper function to get comic category translations
export const getComicCategoryTranslations = (lang) => {
  const translations = getComicTranslations(lang);
  return {
    superhero: translations["comic.category.superhero"],
    horror: translations["comic.category.horror"],
    sciFi: translations["comic.category.sci_fi"],
    fantasy: translations["comic.category.fantasy"],
    humor: translations["comic.category.humor"],
    crime: translations["comic.category.crime"],
    war: translations["comic.category.war"],
    romance: translations["comic.category.romance"]
  };
};

// List of all supported languages for comic translations
export const supportedComicLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  // { code: "ar", name: "Arabic", nativeName: "العربية" },
  // { code: "bn", name: "Bangla", nativeName: "বাংলা" },
  // { code: "mr", name: "Marathi", nativeName: "मराठी" },
  // { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  // { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  // { code: "zh", name: "Chinese", nativeName: "中文" },
  // { code: "fr", name: "French", nativeName: "Français" },
  // { code: "de", name: "German", nativeName: "Deutsch" },
  // { code: "it", name: "Italian", nativeName: "Italiano" },
  // { code: "ja", name: "Japanese", nativeName: "日本語" },
  // { code: "ko", name: "Korean", nativeName: "한국어" },
  // { code: "fa", name: "Persian", nativeName: "فارسی" },
  // { code: "ru", name: "Russian", nativeName: "Русский" }
];

// Default export for backward compatibility
const comicTranslationsData = comicTranslationsEnglish;
export default comicTranslationsData;