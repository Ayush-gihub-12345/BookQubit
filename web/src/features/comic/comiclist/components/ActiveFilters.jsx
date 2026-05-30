"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";

const ActiveFilters = ({
  selectedCategory,
  selectedPublisher,
  searchQuery,
  onResetFilters,
  onClearSearch,
  t,
}) => {
  const { theme, themeName } = useTheme();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  if (selectedCategory === "All" && selectedPublisher === "All" && !searchQuery) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
      <span
        className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
      >
        {t("filter.active_filters") || "Active filters:"}
      </span>
      <div className="flex flex-wrap gap-2">
        {searchQuery && (
          <span
            className={`px-3 py-1 text-sm ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} ${theme.border?.button || "border border-gray-200 dark:border-gray-700"} rounded-full inline-flex items-center gap-1`}
          >
            🔍 {t("filter.search") || "Search"}: "{searchQuery}"
            <button
              onClick={onClearSearch}
              className="ml-1 hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </span>
        )}
        {selectedCategory !== "All" && (
          <span
            className={`px-3 py-1 text-sm ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} ${theme.border?.button || "border border-gray-200 dark:border-gray-700"} rounded-full`}
          >
            📂 {t("filter.category") || "Category"}: {selectedCategory}
          </span>
        )}
        {selectedPublisher !== "All" && (
          <span
            className={`px-3 py-1 text-sm ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} ${theme.border?.button || "border border-gray-200 dark:border-gray-700"} rounded-full`}
          >
            🏢 {t("filter.publisher") || "Publisher"}: {selectedPublisher}
          </span>
        )}
      </div>
      <button
        onClick={onResetFilters}
        className={`px-3 py-1 text-sm ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"} rounded-full transition-all duration-300 hover:shadow-md`}
      >
        {t("filter.clear_all") || "Clear All"}
      </button>
    </div>
  );
};

export default ActiveFilters;