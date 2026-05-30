"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const FilterSection = ({
  categories,
  publishers,
  selectedCategory,
  selectedPublisher,
  onCategoryChange,
  onPublisherChange,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Category Filter */}
      <div className="text-center">
        <h3
          className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-3`}
        >
          {t("filter.filter_by_category") || "Filter by Category"}
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white ${theme.shadow?.button || "shadow-md"}`
                  : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"}`
              } ${theme.border?.button || "border border-gray-200 dark:border-gray-700"}`}
            >
              {category === "All" ? t("filter.all") || "All" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Publisher Filter */}
      <div className="text-center">
        <h3
          className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-3`}
        >
          {t("filter.filter_by_publisher") || "Filter by Publisher"}
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {publishers.map((publisher) => (
            <button
              key={publisher}
              onClick={() => onPublisherChange(publisher)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                selectedPublisher === publisher
                  ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white ${theme.shadow?.button || "shadow-md"}`
                  : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"}`
              } ${theme.border?.button || "border border-gray-200 dark:border-gray-700"}`}
            >
              {publisher === "All" ? t("filter.all") || "All" : publisher}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;