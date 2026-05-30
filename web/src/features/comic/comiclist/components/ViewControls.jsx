"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ViewControls = ({
  viewMode,
  onViewModeChange,
  cardStyle,
  onCardStyleChange,
  showCardStyle = true,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
        >
          {t("view.view") || "View"}:
        </span>
        <div
          className={`flex ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.border?.button || "border border-gray-200 dark:border-gray-700"} ${theme.shadow?.navigationDotContainer || "shadow-sm"} p-1 rounded-lg`}
        >
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
              viewMode === "grid"
                ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white ${theme.shadow?.button || "shadow-md"}`
                : `${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} hover:${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`
            }`}
          >
            {t("view.grid_view") || "Grid"}
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
              viewMode === "list"
                ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white ${theme.shadow?.button || "shadow-md"}`
                : `${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} hover:${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`
            }`}
          >
            {t("view.list_view") || "List"}
          </button>
        </div>
      </div>

      {/* Card Style Selector (only in grid view) */}
      {showCardStyle && viewMode === "grid" && (
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
          >
            {t("view.card_style") || "Card Style"}:
          </span>
          <div
            className={`flex ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.border?.button || "border border-gray-200 dark:border-gray-700"} p-1 rounded-lg`}
          >
            <button
              onClick={() => onCardStyleChange("square")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
                cardStyle === "square"
                  ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white shadow-md`
                  : `${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} hover:text-sky-600 dark:hover:text-sky-400`
              }`}
              title="Square Cards"
            >
              □ {t("view.square") || "Square"}
            </button>
            <button
              onClick={() => onCardStyleChange("compact")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-300 ${
                cardStyle === "compact"
                  ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white shadow-md`
                  : `${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} hover:text-sky-600 dark:hover:text-sky-400`
              }`}
              title="Compact Cards"
            >
              ▯ {t("view.compact") || "Compact"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewControls;