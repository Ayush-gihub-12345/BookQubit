"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookAbout = ({ book }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode (for any conditional styling)
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const safeString = (str) => str || (t("book.not_specified") || "Not specified");
  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const aboutFields = [
    { label: t("book.publisher") || "Publisher", value: book.publisher },
    { label: t("book.original_title") || "Original Title", value: book.originaltitle || book.originalTitle },
    { label: t("book.language") || "Language", value: book.language },
    { label: t("book.original_published") || "Original Published", value: book.originalPublished },
    { label: t("book.genres") || "Genres", value: safeArray(book.genres).join(", ") || (t("book.not_specified") || "Not specified") },
    { label: t("book.country") || "Country", value: book.country },
    { label: t("book.isbn") || "ISBN", value: book.isbn },
    { label: t("book.pages") || "Pages", value: book.pages },
    { label: t("book.edition") || "Edition", value: book.edition },
    { label: t("book.format") || "Format", value: book.format },
    { label: t("book.published") || "Published", value: book.published },
  ];

  // Filter out undefined/null values
  const visibleFields = aboutFields.filter(field => field.value);

  // If no fields have values, don't render
  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className={`
      ${theme.shadow?.container || 'shadow-lg'} 
      ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
      p-6 
      ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
      mb-16 
      rounded-2xl
    `}>
      <h2 className={`text-xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
        {t("book.about") || "About"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleFields.map((field, index) => (
          <div key={index}>
            <h3 className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
              {field.label}
            </h3>
            <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
              {safeString(field.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Make sure to export default
export default BookAbout;