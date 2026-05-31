"use client";

import React from "react";
import RelatedBookCard from "./RelatedBookCard";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const RelatedBooks = ({
  relatedByAuthor,
  relatedByCategory,
  book,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  if (relatedByAuthor.length === 0 && relatedByCategory.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <h2 className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-6`}>
        {t("book.you_may_also_like") || "You May Also Like"}
      </h2>

      {/* Books by same author */}
      {relatedByAuthor.length > 0 && (
        <div className="mb-8">
          <h3 className={`text-xl font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
            {t("book.more_by") || "More by"} {book.author}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedByAuthor.map((relatedBook) => (
              <RelatedBookCard
                key={relatedBook.id}
                book={relatedBook}
              />
            ))}
          </div>
        </div>
      )}

      {/* Books in same category */}
      {relatedByCategory.length > 0 && (
        <div>
          <h3 className={`text-xl font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
            {t("book.similar_in") || "Similar in"} {book.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedByCategory.map((relatedBook) => (
              <RelatedBookCard
                key={relatedBook.id}
                book={relatedBook}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedBooks;