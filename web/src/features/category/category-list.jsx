"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getBooksByLanguage } from "@/data/books";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategoryFilter } from "./hooks/use-category-filter";
import CategoryFilter from "./components/category-filter";
import CategorySection from "./components/category-section";

const CategoryList = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [books, setBooks] = useState([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load books based on language
  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const booksData = await getBooksByLanguage(language);
        setBooks(booksData || []);
      } catch (error) {
        console.error("Failed to load books:", error);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [language]);

  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    allCategories,
    booksByCategory,
    handleCategoryToggle,
    clearFilters,
    hasActiveFilters,
    totalFilteredCategoriesCount
  } = useCategoryFilter(books);

  // Memoize clear filters to prevent unnecessary re-renders
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setShowCategoryFilter(false); // Optionally close filter panel when clearing
  }, [clearFilters]);

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`
          ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} 
          min-h-screen 
          ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'}
        `}
      >
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
            <p className={`mt-4 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {t("common.loading") || "Loading books..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} 
        min-h-screen 
        ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'}
      `}
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        <header className="text-center mb-8">
          <h1
            className={`
              text-4xl font-bold 
              ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} 
              mb-4
            `}
          >
            {t("category.browse_by_category") || "Browse by Category"}
          </h1>
          {!isLoading && books.length > 0 && (
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {t("category.total_books") || "Total books"}: {books.length}
            </p>
          )}
        </header>

        <CategoryFilter
          showCategoryFilter={showCategoryFilter}
          setShowCategoryFilter={setShowCategoryFilter}
          allCategories={allCategories}
          selectedCategories={selectedCategories}
          handleCategoryToggle={handleCategoryToggle}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          clearFilters={handleClearFilters}
          theme={theme}
          themeName={themeName}
          t={t}
        />

        {Object.keys(booksByCategory).length === 0 ? (
          <div
            className={`
              text-center py-12 
              ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} 
              ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
              rounded-xl
            `}
          >
            <svg 
              className="w-16 h-16 mx-auto mb-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} mb-4`}>
              {searchTerm || selectedCategories.length > 0
                ? (t("category.no_results_for_filters") || "No categories found matching your filters.")
                : (t("category.no_books_available") || "No books available in this language.")}
            </p>
            {(searchTerm || selectedCategories.length > 0) && (
              <button
                onClick={handleClearFilters}
                className={`
                  px-6 py-2 
                  ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} 
                  ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} 
                  text-white 
                  ${theme.border?.button || ''} 
                  rounded-lg transition-all hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                `}
              >
                {t("category.clear_filters") || "Clear Filters"}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results summary */}
            {hasActiveFilters && (
              <div className="mb-6 text-center">
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  {t("category.showing_results") || "Showing"} {totalFilteredCategoriesCount} {t("category.categories") || "categories"}
                </p>
              </div>
            )}
            
            {/* Category sections */}
            {Object.entries(booksByCategory).map(([category, categoryBooks]) => (
              <CategorySection
                key={category}
                category={category}
                books={categoryBooks}
                theme={theme}
                themeName={themeName}
                t={t}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryList;