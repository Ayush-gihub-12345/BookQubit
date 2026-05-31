"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBooksByLanguage } from "@/data/books";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ExploreCollections = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [books, setBooks] = useState([]);

  // Load books based on language
  useEffect(() => {
    const booksData = getBooksByLanguage(language);
    setBooks(booksData);
  }, [language]);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setSliderKey((prev) => prev + 1);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading state
  if (!books || books.length === 0) {
    return (
      <section
        className={`${theme.background?.section || ''} ${theme.layout?.sectionPadding || 'py-12 px-4'}`}
      >
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto text-center`}>
          <div className="animate-pulse flex flex-col items-center">
            <div
              className={`h-8 w-64 rounded mb-4 ${theme.background?.navigationDots || 'bg-gray-200 dark:bg-gray-700'}`}
            ></div>
            <div
              className={`h-4 w-80 rounded mb-8 ${theme.background?.navigationDots || 'bg-gray-200 dark:bg-gray-700'}`}
            ></div>
            <div
              className={`h-64 w-full rounded ${theme.background?.navigationDots || 'bg-gray-200 dark:bg-gray-700'}`}
            ></div>
          </div>
        </div>
      </section>
    );
  }

  // Group books by collection with 2-book limit
  const collections = books.reduce((acc, book) => {
    if (book?.collection) {
      const collectionsList = Array.isArray(book.collection)
        ? book.collection
        : [book.collection];

      collectionsList.forEach((collectionName) => {
        if (!acc[collectionName]) {
          acc[collectionName] = {
            books: [],
            featured: book.featured || false,
          };
        }

        // Limit to 2 books per collection
        if (acc[collectionName].books.length < 2) {
          acc[collectionName].books.push(book);
        }
      });
    }
    return acc;
  }, {});

  // Sort collections by featured first, then by name
  const sortedCollections = Object.entries(collections).sort(
    ([aName, aData], [bName, bData]) => {
      if (aData.featured && !bData.featured) return -1;
      if (!aData.featured && bData.featured) return 1;
      return aName.localeCompare(bName);
    },
  );

  // No collections found
  if (sortedCollections.length === 0) {
    return (
      <section
        className={`${theme.background?.section || ''} ${theme.layout?.sectionPadding || 'py-12 px-4'}`}
      >
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto text-center`}>
          <div
            className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-blue-50 border-blue-200"} border rounded-lg p-8`}
          >
            <svg
              className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-blue-400" : "text-blue-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3
              className={`text-xl font-medium ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}
            >
              {t("collections.no_collections_found_title") || "No Collections Found"}
            </h3>
            <p className={`${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-4`}>
              {t("collections.no_collections_found_message") || "We couldn't find any book collections at this time."}
            </p>
            <Link
              href="/bookslist"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}`}
            >
              {t("collections.browse_all_books") || "Browse All Books"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const getSlidesToShow = () => {
    if (windowWidth <= 768) return 1;
    if (windowWidth <= 1024) return 2;
    return Math.min(sortedCollections.length, 3);
  };

  const sliderSettings = {
    dots: false,
    infinite: sortedCollections.length > 1,
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: windowWidth > 768,
  };

  const fallbackImage =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTMgMTZoMThNMTYgOGwtNCA0LTQtNCI+PC9wYXRoPjwvc3ZnPg==";

  if (!mounted) {
    return null;
  }

  return (
    <section
      className={`${theme.background?.section || ''} ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'}`}
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        {/* Header with decorative element */}
        <div className="text-center mb-8 md:mb-12 relative">
          <div
            className={`absolute left-0 right-0 top-1/2 h-0.5 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} -z-10`}
          ></div>
          <h2
            className={`text-2xl md:text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2 inline-block px-6 ${theme.background?.section || ''}`}
          >
            <span className="relative">
              {t("collections.featured_collections") || "Featured Collections"}
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-200 rounded-full"></span>
            </span>
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} max-w-2xl mx-auto mt-4 px-4`}
          >
            {t("collections.discover_collections") || "Discover curated book collections handpicked by our editors"}
          </p>
        </div>

        {/* Collections Slider */}
        <div className="mb-12 relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {sortedCollections.map(
              ([collectionName, { books: collectionBooks }]) => (
                <div
                  key={collectionName}
                  className="px-2 outline-none focus:outline-none h-full"
                >
                  <div
                    className={`${theme.background?.bookCoverSide || ''} ${theme.border?.default || ''} ${theme.shadow?.container || ''} p-4 sm:p-6 rounded-xl h-full transition-all hover:shadow-xl flex flex-col`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-lg sm:text-xl font-bold ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} truncate`}
                      >
                        {collectionName}
                      </h3>
                      <span
                        className={`text-xs ${theme.textColors?.badge || 'text-sky-800 dark:text-sky-400'} px-2 py-1 rounded-full ml-3 flex-shrink-0 ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"}`}
                      >
                        {collectionBooks.length}{" "}
                        {collectionBooks.length === 1 ? t("book.singular") || "book" : t("book.plural") || "books"}
                      </span>
                    </div>

                    <div className="space-y-4 mb-4 flex-grow">
                      {collectionBooks.map((book) => (
                        <Link
                          href={book.buttons?.knowMore || `/books/${book.slug || book.id}`}
                          key={book.id}
                          className={`flex items-start group hover:${isDarkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-2 transition-colors`}
                        >
                          <div className="flex-shrink-0 mr-3 relative">
                            <img
                              src={book.imageUrl || fallbackImage}
                              alt={`${t("book.cover_of") || "Cover of"} ${book.title}`}
                              className="w-14 h-20 object-cover rounded-md shadow-sm group-hover:shadow-md transition-shadow"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackImage;
                              }}
                            />
                            {book.featured && (
                              <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold text-white px-1.5 py-0.5 rounded-full shadow-xs">
                                ★
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} truncate group-hover:text-blue-600 transition-colors`}
                            >
                              {book.title}
                            </h4>
                            <p
                              className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} truncate`}
                            >
                              {t("book.by") || "by"} {book.author}
                            </p>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.floor(book.rating || 0) ? theme.iconColors?.starFilled || 'text-amber-400' : theme.iconColors?.starEmpty || 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span
                                className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} ml-1`}
                              >
                                {book.rating}
                              </span>
                            </div>
                            {book.price && book.price !== "Free" && (
                              <p
                                className={`text-xs font-medium text-green-600 mt-1`}
                              >
                                {book.price}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Link to collection details page */}
                    <Link
                      href={`/collections/${encodeURIComponent(collectionName)}`}
                      className={`text-sm font-medium ${theme.textColors?.highlight || 'text-sky-600'} hover:text-blue-600 inline-flex items-center transition-colors mt-auto`}
                    >
                      {t("collections.view_all_in_collection") || "View all in this collection"}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ),
            )}
          </Slider>
        </div>

        {/* CTA Button with animation */}
        <div className="text-center">
          <Link
            href="/collections"
            className={`${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} px-6 sm:px-8 py-3 text-base sm:text-lg font-medium inline-flex items-center hover:scale-105 transition-all min-h-[44px] rounded-lg`}
          >
            {t("collections.explore_all_collections") || "Explore All Collections"}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Custom dot styling */}
      <style jsx="true">{`
        .slick-prev:before,
        .slick-next:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
          font-size: 24px;
        }
        .slick-prev {
          left: -25px;
        }
        .slick-next {
          right: -25px;
        }
        @media (max-width: 768px) {
          .slick-prev:before,
          .slick-next:before {
            font-size: 16px;
          }
          .slick-prev {
            left: -15px;
          }
          .slick-next {
            right: -15px;
          }
        }
        @media (max-width: 640px) {
          .slick-prev,
          .slick-next {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ExploreCollections;