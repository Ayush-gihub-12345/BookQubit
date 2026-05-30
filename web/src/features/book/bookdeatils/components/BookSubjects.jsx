"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookSubjects = ({ book }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const subjects = safeArray(book.subjects);

  if (subjects.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        ${theme.shadow?.container || 'shadow-lg'} 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        p-6 
        ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
        rounded-2xl
      `}
    >
      <h2 className={`text-xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
        {t("book.subjects_covered") || "Subjects Covered"}
      </h2>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject, index) => (
          <span
            key={index}
            className={`
              px-3 py-1 rounded-full text-sm 
              ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} 
              ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}
              transition-all duration-200 hover:scale-105
            `}
          >
            {subject}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BookSubjects;