"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/themes/useTheme";

const BookNavigation = () => {
  const { t } = useLanguage();
  const { theme, themeName } = useTheme();

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  return (
    <div className={`flex flex-col sm:flex-row gap-4 py-8 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
      <button
        onClick={goToTop}
        className={`px-6 py-3 text-base font-medium border-2 border-sky-500 ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} rounded-lg hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ${theme.background?.section || ''}`}
      >
        ↑ {t("pagination.go_to_top") || "Go to Top"}
      </button>
      <Link
        href="/bookslist"
        className={`px-6 py-3 text-base font-medium text-center ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200`}
      >
        {t("book.back_to_books") || "Back to Books"}
      </Link>
    </div>
  );
};

export default BookNavigation;