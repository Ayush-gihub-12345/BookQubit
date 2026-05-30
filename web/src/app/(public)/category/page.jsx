"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getBooksByLanguage } from "@/data/books";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

// Pagination Component - Moved outside
const Pagination = ({ currentPage, totalPages, onPageChange, theme, t }) => {
  const { theme: themeFromProps } = theme;
  
  if (totalPages <= 1) return null;
  
  // Check if current theme is dark mode
  const isDarkMode = themeFromProps?.themeName === 'dark' || themeFromProps?.themeName === 'midnight' || themeFromProps?.themeName === 'cyberpunk';
  
  return (
    <div className="flex justify-center gap-2 mt-8 mb-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${themeFromProps?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${themeFromProps?.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
      >
        {t("pagination.prev") || "Previous"}
      </button>
      {[...Array(Math.min(totalPages, 10))].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded-lg transition-all ${
            currentPage === i + 1
              ? `${themeFromProps?.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white`
              : `${themeFromProps?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${themeFromProps?.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${themeFromProps?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${themeFromProps?.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
      >
        {t("pagination.next") || "Next"}
      </button>
    </div>
  );
};

const Category = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [books, setBooks] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  // Load books based on language
  React.useEffect(() => {
    const booksData = getBooksByLanguage(language);
    setBooks(booksData);
  }, [language]);

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Get all unique categories from all books
  const allCategories = useMemo(() => {
    const categories = new Set();
    books.forEach((book) => {
      if (book.category) {
        categories.add(book.category);
      }
    });
    return Array.from(categories).sort();
  }, [books]);

  // Group books by category with filtering
  const booksByCategory = useMemo(() => {
    const categoriesObj = books.reduce((acc, book) => {
      if (book.category) {
        if (!acc[book.category]) {
          acc[book.category] = [];
        }
        acc[book.category].push(book);
      }
      return acc;
    }, {});

    // Filter categories based on search term and selected categories
    const filteredCategories = {};

    Object.entries(categoriesObj).forEach(([category, categoryBooks]) => {
      // Check if category name matches search term
      const categoryMatchesSearch =
        searchTerm === "" ||
        category.toLowerCase().includes(searchTerm.toLowerCase());

      // Check if category is selected in filter
      const categoryMatchesFilter =
        selectedCategories.length === 0 ||
        selectedCategories.includes(category);

      const filteredBooks = categoryBooks.filter((book) => {
        // Search term filter (book level)
        const bookMatchesSearch =
          searchTerm === "" ||
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (book.description &&
            book.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          category.toLowerCase().includes(searchTerm.toLowerCase());

        return bookMatchesSearch;
      });

      // Only include categories that match the filter AND (have books after filtering OR if category name matches search)
      if (
        categoryMatchesFilter &&
        (filteredBooks.length > 0 || categoryMatchesSearch)
      ) {
        filteredCategories[category] = filteredBooks;
      }
    });

    return filteredCategories;
  }, [books, searchTerm, selectedCategories]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCurrentPage(1); // Reset page when filter changes
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setCurrentPage(1); // Reset page when clearing filters
  };

  const toggleCategoryFilter = () => {
    setShowCategoryFilter((prev) => !prev);
  };

  // Pagination helper function
  const getPaginatedBooks = (books) => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return books.slice(startIndex, endIndex);
  };

  // Calculate total pages for a category
  const getTotalPages = (bookCount) => {
    return Math.ceil(bookCount / booksPerPage);
  };

  // Reset to first page when category changes
  const handleCategoryPageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'}`}
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        <h1
          className={`text-4xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-8 text-center`}
        >
          {t("category.browse_by_category") || "Browse by Category"}
        </h1>

        {/* Search and Filter Section */}
        <div
          className={`mb-12 p-6 ${theme.background?.bookCoverSide || 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.book || 'shadow-2xl'} rounded-xl`}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <label
              htmlFor="search"
              className={`block text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-2`}
            >
              {t("category.search_categories") || "Search Categories & Books"}
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder={t("category.search_placeholder") || "Search by category name, title, author, or description..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.border?.button || 'border border-gray-300 dark:border-gray-600'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleCategoryFilter}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showCategoryFilter
                  ? `${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white`
                  : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}`
              }`}
            >
              <span>{t("category.filter_by_categories") || "Filter by Categories"}</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${showCategoryFilter ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {(searchTerm || selectedCategories.length > 0) && (
              <button
                onClick={clearFilters}
                className={`px-4 py-2 text-sm font-medium ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} ${theme.border?.button || 'border border-gray-300 dark:border-gray-600'} rounded-lg transition-all`}
              >
                {t("category.clear_all_filters") || "Clear All Filters"}
              </button>
            )}
          </div>

          {/* Category Filter (Collapsible) */}
          {showCategoryFilter && (
            <div
              className={`mb-4 p-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg`}
            >
              <label
                className={`block text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-3`}
              >
                {t("category.select_categories") || "Select Categories to Filter:"}
              </label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-2 text-sm font-medium rounded-full transition-all ${
                      selectedCategories.includes(category)
                        ? `${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white ${theme.shadow?.button || 'shadow-md'}`
                        : `${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} ${theme.border?.button || 'border border-gray-300 dark:border-gray-600'} hover:${theme.background?.bookCoverSide || 'bg-gray-200 dark:bg-gray-600'}`
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(searchTerm || selectedCategories.length > 0) && (
            <div
              className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <span className={`text-sm ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                {t("category.active_filters") || "Active filters:"}
              </span>
              {searchTerm && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                >
                  {t("category.search") || "Search"}: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                >
                  {category}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="ml-2 hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        {Object.keys(booksByCategory).length === 0 ? (
          <div
            className={`text-center py-12 ${theme.background?.bookCoverSide || 'bg-gray-100 dark:bg-gray-800'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl`}
          >
            <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} mb-4`}>
              {t("category.no_categories_found") || "No categories found matching your filters."}
            </p>
            <button
              onClick={clearFilters}
              className={`px-6 py-2 ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} text-white ${theme.border?.button || ''} rounded-lg transition-all hover:shadow-lg`}
            >
              {t("category.clear_filters") || "Clear Filters"}
            </button>
          </div>
        ) : (
          Object.entries(booksByCategory).map(([category, categoryBooks]) => {
            const totalPages = getTotalPages(categoryBooks.length);
            const paginatedBooks = getPaginatedBooks(categoryBooks);
            
            return (
              <section key={category} className="mb-16">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                  <div className="flex items-center">
                    <h2
                      className={`text-2xl font-semibold ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} mr-4`}
                    >
                      {category}
                    </h2>
                    <span
                      className={`text-sm ${theme.textColors?.badge || 'text-sky-800 dark:text-sky-400'} ${isDarkMode ? "bg-sky-900/30" : "bg-sky-100"} px-3 py-1 rounded-full`}
                    >
                      {categoryBooks.length}{" "}
                      {categoryBooks.length === 1 ? t("book.singular") || "book" : t("book.plural") || "books"}
                    </span>
                  </div>
                </div>

                {paginatedBooks.length === 0 ? (
                  <div
                    className={`text-center py-8 ${theme.background?.bookCoverSide || 'bg-gray-100 dark:bg-gray-800'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl`}
                  >
                    <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {t("category.no_books_match") || "No books in this category match your current search."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedBooks.map((book) => (
                        <div
                          key={book.id}
                          className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.book || 'shadow-2xl'} overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                        >
                          <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={book.imageUrl}
                                  alt={book.title}
                                  className="w-24 h-36 object-cover rounded-lg shadow-md"
                                  onError={(e) => {
                                    e.target.src = "/placeholder-book.jpg";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h3
                                  className={`text-lg font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-1 line-clamp-2`}
                                >
                                  {book.title}
                                </h3>
                                <p
                                  className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} mb-2`}
                                >
                                  {t("book.by") || "by"} {book.author}
                                </p>
                                <div className="flex items-center mb-3">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${i < Math.floor(book.rating || 0) ? (theme.iconColors?.starFilled || 'text-amber-400') : (theme.iconColors?.starEmpty || 'text-gray-300')}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <p
                                  className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} line-clamp-2 mb-3`}
                                >
                                  {book.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {book.tags?.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className={`text-xs ${theme.textColors?.badge || 'text-sky-800 dark:text-sky-400'} ${isDarkMode ? "bg-sky-900/30" : "bg-sky-50"} px-2 py-1 rounded-full`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <Link
                                  href={`/books/${book.slug || book.id}`}
                                  className={`inline-block w-full text-center px-4 py-2 text-sm font-medium ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} rounded-lg transition-all hover:shadow-lg`}
                                >
                                  {t("book.view_details") || "View Details"}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination for this category */}
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handleCategoryPageChange}
                      theme={{ theme, themeName }}
                      t={t}
                    />
                  </>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Category;