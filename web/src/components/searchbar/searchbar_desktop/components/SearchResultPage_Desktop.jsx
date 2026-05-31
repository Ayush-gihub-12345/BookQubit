// d:/Projects/done/bookqubit_done/web/src/components/searchbar/searchbar_desktop/components/SearchResultPage_Desktop.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";
import SearchBookCard_Desktop from "./SearchBookCard_Desktop";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSpinner,
  FaThLarge,
  FaList,
  FaArrowLeft,
} from "react-icons/fa";

const SearchResultPage_Desktop = ({ initialQuery, onClose }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, themeName } = useTheme();
  const { language, t } = useLanguage();
  const { currentFont } = useFont();

  const urlQuery = searchParams?.get("q") || initialQuery || "";
  const [query, setQuery] = useState(urlQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    authors: [],
    collections: [],
  });

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    authors: [],
    collections: [],
  });

  // Search books
  const performSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setFilteredResults([]);
        return;
      }

      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const books = getBooksByLanguage(language);
      const results = books.filter((book) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          book.title?.toLowerCase().includes(searchLower) ||
          book.author?.toLowerCase().includes(searchLower) ||
          book.description?.toLowerCase().includes(searchLower) ||
          book.category?.toLowerCase().includes(searchLower) ||
          book.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      });

      setSearchResults(results);
      setFilteredResults(results);

      // Extract filter options
      const categories = [
        ...new Set(results.map((book) => book.category).filter(Boolean)),
      ];
      const authors = [
        ...new Set(results.map((book) => book.author).filter(Boolean)),
      ];
      const collections = [
        ...new Set(results.map((book) => book.collection).filter(Boolean)),
      ];

      setFilterOptions({ categories, authors, collections });
      setIsLoading(false);
    },
    [language],
  );

  // Initial search on mount
  useEffect(() => {
    if (urlQuery) {
      performSearch(urlQuery);
    }
  }, [urlQuery, performSearch]);

  // Apply filters
  useEffect(() => {
    let results = [...searchResults];

    if (selectedFilters.categories.length > 0) {
      results = results.filter((book) =>
        selectedFilters.categories.includes(book.category),
      );
    }

    if (selectedFilters.authors.length > 0) {
      results = results.filter((book) =>
        selectedFilters.authors.includes(book.author),
      );
    }

    if (selectedFilters.collections.length > 0) {
      results = results.filter((book) =>
        selectedFilters.collections.includes(book.collection),
      );
    }

    setFilteredResults(results);
  }, [selectedFilters, searchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      // Update URL without full page reload
      window.history.pushState(
        {},
        "",
        `/search?q=${encodeURIComponent(query)}`,
      );
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setFilteredResults([]);
    window.history.pushState({}, "", "/search");
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      authors: [],
      collections: [],
    });
  };

  const handleAddToWishlist = (book) => {
    console.log("Added to wishlist:", book.title);
  };

  const handleShare = (book) => {
    console.log("Share:", book.title);
  };

  const totalResults = filteredResults.length;
  const hasActiveFilters = Object.values(selectedFilters).some(
    (arr) => arr.length > 0,
  );
  const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")}`}
      style={fontStyle}
    >
      <div className="min-h-screen">
        {/* Search Header */}
        <div
          className={`sticky top-0 z-10 ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white")} border-b ${theme.border?.default || "border-gray-200 dark:border-gray-700"} shadow-sm`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            {/* Back Button and Title */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800`}
                aria-label="Go back"
              >
                <FaArrowLeft
                  className={
                    theme.textColors?.primary || "text-gray-900 dark:text-white"
                  }
                />
              </button>
              <h1
                className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                {t("search.results") || "Search Results"}
              </h1>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      t("search.placeholder") ||
                      "Search for books, authors, or genres..."
                    }
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500
                      ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
                      ${theme.border?.default || "border-gray-200 dark:border-gray-700"}
                      ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
                    `}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <FaTimes
                        className={
                          theme.textColors?.secondary || "text-gray-400"
                        }
                      />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-50
                    ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
                    ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"}
                  `}
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    t("search.search") || "Search"
                  )}
                </button>
              </div>
            </form>

            {/* Results Stats & Controls */}
            {!isLoading && (searchResults.length > 0 || query) && (
              <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
                <div
                  className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                >
                  {totalResults}{" "}
                  {totalResults === 1
                    ? t("book.singular") || "book"
                    : t("book.plural") || "books"}{" "}
                  found
                  {hasActiveFilters && " with selected filters"}
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "list"
                          ? `bg-white dark:bg-gray-700 ${theme.textColors?.highlight || "text-sky-600"} shadow-sm`
                          : theme.textColors?.secondary || "text-gray-500"
                      }`}
                      title="List view"
                    >
                      <FaList size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "grid"
                          ? `bg-white dark:bg-gray-700 ${theme.textColors?.highlight || "text-sky-600"} shadow-sm`
                          : theme.textColors?.secondary || "text-gray-500"
                      }`}
                      title="Grid view"
                    >
                      <FaThLarge size={16} />
                    </button>
                  </div>

                  {/* Filter Toggle Button */}
                  {(filterOptions.categories.length > 0 ||
                    filterOptions.authors.length > 0) && (
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                        ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                        ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
                      `}
                    >
                      <FaFilter />
                      {t("filter.filters") || "Filters"}
                      {hasActiveFilters && (
                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-sky-500 text-white">
                          {Object.values(selectedFilters).reduce(
                            (a, b) => a + b.length,
                            0,
                          )}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters &&
          (filterOptions.categories.length > 0 ||
            filterOptions.authors.length > 0) && (
            <div className={`max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8`}>
              <div
                className={`p-6 rounded-xl ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
                ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
                  >
                    {t("filter.refine") || "Refine Results"}
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline`}
                    >
                      {t("filter.clear_all") || "Clear All"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categories Filter */}
                  {filterOptions.categories.length > 0 && (
                    <div>
                      <h4
                        className={`text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-gray-300" : "text-gray-700")}`}
                      >
                        {t("book.category") || "Category"}
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filterOptions.categories.map((category) => (
                          <label
                            key={category}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.categories.includes(
                                category,
                              )}
                              onChange={() =>
                                handleFilterChange("categories", category)
                              }
                              className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span
                              className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                            >
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Authors Filter */}
                  {filterOptions.authors.length > 0 && (
                    <div>
                      <h4
                        className={`text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-gray-300" : "text-gray-700")}`}
                      >
                        {t("book.author") || "Author"}
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filterOptions.authors.map((author) => (
                          <label
                            key={author}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.authors.includes(author)}
                              onChange={() =>
                                handleFilterChange("authors", author)
                              }
                              className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span
                              className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                            >
                              {author}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collections Filter */}
                  {filterOptions.collections.length > 0 && (
                    <div>
                      <h4
                        className={`text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-gray-300" : "text-gray-700")}`}
                      >
                        {t("book.collection") || "Collection"}
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filterOptions.collections.map((collection) => (
                          <label
                            key={collection}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.collections.includes(
                                collection,
                              )}
                              onChange={() =>
                                handleFilterChange("collections", collection)
                              }
                              className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span
                              className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                            >
                              {collection}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Results Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner
                className={`animate-spin text-4xl ${theme.textColors?.highlight || "text-sky-600"} mb-4`}
              />
              <p className={theme.textColors?.secondary || "text-gray-600"}>
                {t("search.searching") || "Searching for books..."}
              </p>
            </div>
          )}

          {/* Results - List View */}
          {!isLoading && viewMode === "list" && filteredResults.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {filteredResults.map((book) => (
                <SearchBookCard_Desktop
                  key={book.id}
                  book={book}
                  showActions={true}
                  onAddToWishlist={handleAddToWishlist}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}

          {/* Results - Grid View */}
          {!isLoading && viewMode === "grid" && filteredResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResults.map((book) => (
                <SearchBookCard_Desktop
                  key={book.id}
                  book={book}
                  showActions={true}
                  compact={true}
                  onAddToWishlist={handleAddToWishlist}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading &&
            query &&
            filteredResults.length === 0 &&
            searchResults.length === 0 && (
              <div className="text-center py-20">
                <FaSearch
                  className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`}
                />
                <h2
                  className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
                >
                  {t("search.no_results") || "No results found"}
                </h2>
                <p className={theme.textColors?.secondary || "text-gray-600"}>
                  {t("search.try_different") ||
                    "Try searching with different keywords or check your spelling"}
                </p>
              </div>
            )}

          {/* Initial State */}
          {!isLoading && !query && !searchResults.length && (
            <div className="text-center py-20">
              <FaSearch
                className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`}
              />
              <h2
                className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                {t("search.start_searching") || "Start searching for books"}
              </h2>
              <p className={theme.textColors?.secondary || "text-gray-600"}>
                {t("search.enter_keywords") ||
                  "Enter a book title, author name, or genre to begin"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage_Desktop;
