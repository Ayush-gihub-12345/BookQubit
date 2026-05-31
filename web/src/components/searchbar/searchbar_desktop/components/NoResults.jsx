// d:/Projects/done/bookqubit_done/web/src/components/searchbar/searchbar_desktop/components/NoResults.jsx
"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const NoResults = ({ query }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  return (
    <div className="dropdown-section">
      <div className="no-results">
        <p className={`${theme.textColors?.secondary || "text-gray-600"}`}>
          {t("search.no_suggestions") || "No matching books found"} "{query}"
        </p>
        <p className={`text-xs ${theme.textColors?.secondary || "text-gray-500"} mt-2`}>
          {t("search.try_different") || "Try typing something else or select from suggestions"}
        </p>
      </div>
    </div>
  );
};

export default NoResults;