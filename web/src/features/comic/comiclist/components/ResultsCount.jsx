"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ResultsCount = ({ filteredCount, totalCount, searchQuery }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage(); // Get t from hook instead of props

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div
      className={`text-center ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} text-sm mb-4`}
    >
      {searchQuery && (
        <span className="block mb-1">
          🔍 {t("pagination.search_results") || "Search results for"}: "{searchQuery}"
        </span>
      )}
      {t("pagination.showing") || "Showing"} {filteredCount}{" "}
      {t("pagination.of") || "of"} {totalCount}{" "}
      {t("comics.comics") || "comics"}
    </div>
  );
};

export default ResultsCount;