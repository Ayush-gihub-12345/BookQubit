"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookNotFound = ({ slug, books }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  return (
    <div
      className={`
        ${theme.background?.section || 'bg-gray-50 dark:bg-gray-900'} 
        min-h-screen flex items-center justify-center p-4
      `}
    >
      <div className="text-center max-w-2xl mx-auto">
        <div className={`text-8xl mb-6 ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
          📚
        </div>
        <h2 className={`text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
          {t("book.not_found") || "Book not found"}
        </h2>
        <p className={`${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-4`}>
          {t("book.not_found_message") || "The book you're looking for doesn't exist in our library."}
        </p>

        {slug ? (
          <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-2`}>
            {t("book.url_parameter") || "URL parameter"}: "{slug}"
          </p>
        ) : (
          <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-2`}>
            {t("book.no_id_provided") || "No book ID or slug provided in the URL."}
          </p>
        )}

        <div className="space-y-4 mt-8">
          <Link
            href="/bookslist"
            className={`
              px-6 py-3 
              ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
              ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
              text-white 
              font-medium 
              inline-block 
              rounded-lg 
              hover:shadow-lg 
              hover:scale-105
              active:scale-95
              transition-all duration-200
            `}
          >
            {t("book.browse_all_books") || "Browse All Books"}
          </Link>

          <div className="mt-8">
            <Link
              href="/"
              className={`
                text-sm 
                ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} 
                hover:underline 
                transition-all
              `}
            >
              {t("book.go_to_homepage") || "Go to Homepage"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNotFound;