"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchAndFilter from "./components/SearchAndFilter";
import CollectionSection from "./components/CollectionSection";
import Pagination from "./components/Pagination";
import useCollectionFiltering from "./hooks/useCollectionFiltering";

const CollectionsList = () => {
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();
  const params = useParams();
  const pathname = usePathname();
  
  // Get language from URL (first path segment)
  const getLanguageFromURL = () => {
    const segments = pathname?.split('/').filter(Boolean);
    const firstSegment = segments?.[0];
    // List of supported languages
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'hi', 'ar', 'ur', 'bn', 'pt', 'ru', 'it', 'ko', 'nl', 'tr', 'vi', 'th', 'pl', 'sv', 'ta', 'te', 'ml', 'kn', 'mr'];
    if (firstSegment && supportedLanguages.includes(firstSegment)) {
      return firstSegment;
    }
    return contextLanguage || 'en';
  };
  
  const currentLanguage = getLanguageFromURL();
  const [currentPage, setCurrentPage] = useState(1);
  const collectionsPerPage = 6;
  
  const {
    books,
    collections,
    allCollections,
    searchTerm,
    setSearchTerm,
    selectedCollections,
    showCollectionFilter,
    setShowCollectionFilter,
    handleCollectionToggle,
    clearFilters,
    toggleCollectionFilter,
    isLoading,
  } = useCollectionFiltering(currentLanguage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCollections]);

  // Guard against undefined theme
  if (!theme || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Get collections array for pagination
  const collectionsArray = Object.entries(collections);
  const totalCollections = collectionsArray.length;
  const totalPages = Math.ceil(totalCollections / collectionsPerPage);
  
  // Get current page collections
  const startIndex = (currentPage - 1) * collectionsPerPage;
  const endIndex = startIndex + collectionsPerPage;
  const currentCollections = collectionsArray.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`
        ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} 
        min-h-screen 
        ${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}
      `}
    >
      <div className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}>
        <h1
          className={`
            text-4xl font-bold 
            ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} 
            mb-8 text-center
          `}
        >
          {t("collections.title") || "Book Collections"}
        </h1>

        {/* Language Indicator (optional - for debugging) */}
        <div className="text-right text-xs opacity-50 mb-2">
          <span className={theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}>
            {t("common.language") || "Language"}: {currentLanguage.toUpperCase()}
          </span>
        </div>

        {/* Search and Filter Section */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCollections={selectedCollections}
          showCollectionFilter={showCollectionFilter}
          allCollections={allCollections}
          handleCollectionToggle={handleCollectionToggle}
          clearFilters={clearFilters}
          toggleCollectionFilter={toggleCollectionFilter}
          theme={theme}
          isDarkMode={isDarkMode}
          t={t}
        />

        {/* Results Info */}
        {totalCollections > 0 && (
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("collections.showing") || "Showing"} {(startIndex + 1)}-{Math.min(endIndex, totalCollections)} {t("collections.of") || "of"} {totalCollections} {t("collections.collections") || "collections"}
            </p>
          </div>
        )}

        {/* Collections Grid */}
        {totalCollections === 0 ? (
          <div
            className={`
              text-center py-12 
              ${theme.background?.bookCoverSide || "bg-gray-100 dark:bg-gray-800"} 
              ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
              rounded-xl
            `}
          >
            <p
              className={`
                text-lg 
                ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} 
                mb-4
              `}
            >
              {t("collections.no_collections_found") ||
                "No collections found matching your filters."}
            </p>
            <button
              onClick={clearFilters}
              className={`
                px-6 py-2 
                ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} 
                ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} 
                text-white 
                ${theme.border?.button || ""} 
                rounded-lg transition-all hover:shadow-lg
              `}
            >
              {t("collections.clear_filters") || "Clear Filters"}
            </button>
          </div>
        ) : (
          <>
            {currentCollections.map(([collectionName, collectionBooks]) => (
              <CollectionSection
                key={collectionName}
                collectionName={collectionName}
                collectionBooks={collectionBooks}
                theme={theme}
                isDarkMode={isDarkMode}
                t={t}
              />
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                theme={theme}
                isDarkMode={isDarkMode}
                t={t}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionsList;