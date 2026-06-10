"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getBooksByLanguage } from "@/data/books";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const CollectionsDetails = () => {
  const params = useParams();
  const pathname = usePathname();
  const collectionName = params?.collectionName;
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();
  const [collectionBooks, setCollectionBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [books, setBooks] = useState([]);

  // Get language from URL (first path segment)
  const getLanguageFromURL = () => {
    const segments = pathname?.split("/").filter(Boolean);
    const firstSegment = segments?.[0];
    const supportedLanguages = [
      "en",
      "es",
      "fr",
      "de",
      "ja",
      "zh",
      "hi",
      "ar",
      "ur",
      "bn",
      "pt",
      "ru",
      "it",
      "ko",
      "nl",
      "tr",
      "vi",
      "th",
      "pl",
      "sv",
      "ta",
      "te",
      "ml",
      "kn",
      "mr",
    ];
    if (firstSegment && supportedLanguages.includes(firstSegment)) {
      return firstSegment;
    }
    return contextLanguage || "en";
  };

  const currentLanguage = getLanguageFromURL();

  // Load books based on language from URL
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const booksData = getBooksByLanguage(currentLanguage);
        setBooks(booksData || []);
      } catch (error) {
        console.error("Failed to load books:", error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [currentLanguage]);

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Decode the collection name from URL
  const decodedCollectionName = collectionName
    ? decodeURIComponent(collectionName)
    : "";

  // Filter books by collection
  useEffect(() => {
    if (!decodedCollectionName || books.length === 0) {
      return;
    }

    // Filter books that belong to this collection
    const filteredBooks = books.filter((book) => {
      if (!book.collection) return false;

      // Handle both array collections and single string collections
      if (Array.isArray(book.collection)) {
        return book.collection.some(
          (c) =>
            c.toLowerCase() === decodedCollectionName.toLowerCase() ||
            c === decodedCollectionName,
        );
      } else {
        return (
          book.collection === decodedCollectionName ||
          book.collection.toLowerCase() === decodedCollectionName.toLowerCase()
        );
      }
    });

    setCollectionBooks(filteredBooks);
  }, [decodedCollectionName, books]);

  const fallbackImage =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTMgMTZoMThNMTYgOGwtNCA0LTQtNCI+PC9wYXRoPjwvc3ZnPg==";

  if (isLoading) {
    return (
      <div
        className={`
          ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} 
          min-h-screen py-12 px-4 sm:px-6 lg:px-8
        `}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} 
        min-h-screen py-12 px-4 sm:px-6 lg:px-8
      `}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <Link
              href={`/${currentLanguage}/collections`}
              className={`
                ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} 
                hover:${theme.textColors?.highlight || "text-sky-600"} 
                flex items-center text-sm mb-2 transition-colors
              `}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t("collections.back_to_collections") || "Back to Collections"}
            </Link>
            <h1
              className={`
              text-2xl sm:text-3xl font-bold 
              ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
            `}
            >
              {decodedCollectionName}
            </h1>
          </div>
          <div className="flex gap-3">
            <span
              className={`
              text-sm 
              ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} 
              px-3 py-1 rounded-full 
              ${isDarkMode ? "bg-sky-900/30" : "bg-sky-100"}
            `}
            >
              {collectionBooks.length}{" "}
              {collectionBooks.length === 1
                ? t("book.singular") || "book"
                : t("book.plural") || "books"}
            </span>

            {/* Language Indicator */}
            <span
              className={`
              text-xs 
              px-3 py-1 rounded-full 
              ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}
            `}
            >
              {currentLanguage.toUpperCase()}
            </span>
          </div>
        </div>

        {/* No Books Found State */}
        {collectionBooks.length === 0 ? (
          <div
            className={`
            text-center py-16 
            ${theme.background?.bookCoverSide || "bg-gray-100 dark:bg-gray-800"} 
            rounded-xl border 
            ${theme.border?.default || "border-gray-200 dark:border-gray-700"}
          `}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p
              className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
            >
              {t("collections.no_books_found") ||
                "No books found in this collection."}
            </p>
            <Link
              href={`/${currentLanguage}/collections`}
              className={`
                inline-block mt-4 px-6 py-2 
                ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} 
                ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} 
                text-white rounded-lg transition-all hover:scale-105
              `}
            >
              {t("collections.browse_all_collections") ||
                "Browse All Collections"}
            </Link>
          </div>
        ) : (
          /* Books Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collectionBooks.map((book) => (
              <div
                key={book.id}
                className={`
                  ${theme.background?.bookCoverSide || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"} 
                  ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
                  ${theme.shadow?.book || "shadow-2xl"} 
                  rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl 
                  flex flex-col h-full
                `}
              >
                <div className="w-full aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={book.imageUrl || fallbackImage}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImage;
                    }}
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3
                      className={`
                      text-base sm:text-lg font-bold 
                      ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} 
                      mb-1 line-clamp-2
                    `}
                    >
                      {book.title}
                    </h3>
                    <p
                      className={`
                      text-xs sm:text-sm 
                      ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} 
                      mb-2
                    `}
                    >
                      {t("book.by") || "by"} {book.author}
                    </p>

                    {/* Rating Stars */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(book.rating || 0) ? "text-amber-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p
                      className={`
                      text-xs 
                      ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} 
                      line-clamp-3 mb-3
                    `}
                    >
                      {book.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.tags?.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className={`
                            text-xs 
                            ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} 
                            px-2 py-1 rounded-full 
                            ${isDarkMode ? "bg-sky-900/30" : "bg-sky-50"}
                          `}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-auto pt-3">
                    <Link
                      href={`/${currentLanguage}/books/${book.slug || book.id}`}
                      className={`
                        block w-full text-center py-2 px-4 text-xs sm:text-sm font-medium rounded-lg 
                        ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} 
                        ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} 
                        text-white transition-all hover:scale-105 min-h-[44px] flex items-center justify-center
                      `}
                    >
                      {t("book.view_details") || "View Details"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsDetails;
