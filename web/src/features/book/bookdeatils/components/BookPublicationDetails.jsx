"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookPublicationDetails = ({ book }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode (for any conditional styling if needed)
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const safeString = (str) => str || (t("book.not_specified") || "Not specified");

  // Define all publication fields for easy management
  const publicationFields = [
    { label: t("book.publisher") || "Publisher", value: book.publisher },
    { label: t("book.language") || "Language", value: book.language },
    { label: t("book.original_published") || "Original Published", value: book.originalPublished || book.originalpublished },
    { label: t("book.genres") || "Genres", value: Array.isArray(book.genres) ? book.genres.join(", ") : book.genres },
    { label: t("book.edition") || "Edition", value: book.edition },
    { label: t("book.isbn") || "ISBN", value: book.isbn },
    { label: t("book.format") || "Format", value: book.format },
    { label: t("book.pages") || "Pages", value: book.pageCount },
    { label: t("book.country") || "Country", value: book.country },
  ].filter(field => field.value); // Only show fields that have values

  if (publicationFields.length === 0) {
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
        {t("book.publication_details") || "Publication Details"}
      </h2>
      <div className="space-y-3">
        {publicationFields.map((field, index) => (
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

export default BookPublicationDetails;