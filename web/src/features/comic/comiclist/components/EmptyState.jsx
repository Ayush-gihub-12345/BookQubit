"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const EmptyState = ({ onResetFilters }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div className="text-center py-12">
      <div
        className={`text-6xl ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-4`}
      >
        📚
      </div>
      <h3
        className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-2`}
      >
        {t("comics.no_comics_found") || "No comics found"}
      </h3>
      <p
        className={`${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-4`}
      >
        {t("comics.try_different_filters") ||
          "Try selecting different categories or publishers to see more comics."}
      </p>
      <button
        onClick={onResetFilters}
        className={`px-6 py-2 ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white ${theme.border?.button || "border border-gray-200 dark:border-gray-700"} ${theme.shadow?.button || "shadow-md"} rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      >
        {t("filter.reset_all") || "Reset All Filters"}
      </button>
    </div>
  );
};

export default EmptyState;