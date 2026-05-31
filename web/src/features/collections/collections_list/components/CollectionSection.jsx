import React from "react";
import Link from "next/link";
import BookCard from "./BookCard";

const CollectionSection = ({
  collectionName,
  collectionBooks,
  theme,
  isDarkMode,
  t,
}) => {
  const getCollectionsAsArray = (collection) => {
    if (!collection) return [];
    return Array.isArray(collection) ? collection : [collection];
  };

  return (
    <section className="mb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center flex-wrap gap-3">
          <h2
            className={`text-2xl font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}
          >
            {collectionName}
          </h2>
          <span
            className={`text-sm ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} ${isDarkMode ? "bg-sky-900/30" : "bg-sky-100"} px-3 py-1 rounded-full`}
          >
            {collectionBooks.length}{" "}
            {collectionBooks.length === 1
              ? t("book.singular") || "book"
              : t("book.plural") || "books"}
          </span>
        </div>
        <Link
          href={`/collections/${encodeURIComponent(collectionName)}`}
          className={`${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} ${theme.border?.button || ""} ${theme.shadow?.button || "shadow-md"} px-4 py-2 text-sm font-medium transition-all rounded-lg`}
        >
          {t("collections.explore_collection") || "Explore Collection"}
        </Link>
      </div>

      {collectionBooks.length === 0 ? (
        <div
          className={`text-center py-8 ${theme.background?.bookCoverSide || "bg-gray-100 dark:bg-gray-800"} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl`}
        >
          <p
            className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
          >
            {t("collections.no_books_match") ||
              "No books in this collection match your current search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionBooks.slice(0, 6).map((book) => (
            <BookCard
              key={`${collectionName}-${book.id}`}
              book={book}
              theme={theme}
              isDarkMode={isDarkMode}
              t={t}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CollectionSection;