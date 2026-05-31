"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BooksSearch = ({ searchTerm, setSearchTerm }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  return (
    <div className="relative w-full md:w-1/2">
      <input
        type="search"
        placeholder={t("search.search_books") || "Search books by title, author, or description..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`
          w-full p-3 pl-10 
          border rounded-lg 
          focus:outline-none focus:ring-2 
          transition-colors duration-200
          ${theme.background?.input === '#ffffff' ? 'bg-white dark:bg-gray-800' : theme.background?.input || 'bg-white dark:bg-gray-800'}
          ${theme.textColors?.primary === '#1f2937' ? 'text-gray-900 dark:text-white' : theme.textColors?.primary || 'text-gray-900 dark:text-white'}
          ${theme.border?.input === '#d1d5db' ? 'border-gray-300 dark:border-gray-600' : 'border-gray-300 dark:border-gray-600'}
          focus:ring-sky-500 focus:border-sky-500
          ${isDarkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'}
        `}
      />
      <svg
        className="absolute left-3 top-3.5 h-5 w-5"
        style={{ color: theme.textColors?.tertiary || '#9ca3af' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default BooksSearch;