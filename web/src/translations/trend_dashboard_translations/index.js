import trendDashboardEnglish from "./trend_dashboard_translations_english";
import trendDashboardHindi from "./trend_dashboard_translations_hindi";
import trendDashboardUrdu from "./trend_dashboard_translations_urdu";

// Export all translations
export const trendDashboardTranslations = {
  en: trendDashboardEnglish,
  hi: trendDashboardHindi,
  ur: trendDashboardUrdu,
  // Add more languages as needed
};

// Get trend dashboard translation for a specific language
export const getTrendDashboardTranslation = (lang) => {
  return trendDashboardTranslations[lang] || trendDashboardTranslations.en;
};

// Default export
export default trendDashboardTranslations;