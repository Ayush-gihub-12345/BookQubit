// src/features/book/booklist/booklist.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { getBooksByLanguage } from "@/data/books";
import BookSquareCard from "@/features/book/booklist/ui/BookSquareCard";
import BookRectangleCard from "@/features/book/booklist/ui/BookRectangleCard";
import BookCompactCard from "@/features/book/booklist/ui/BookCompactCard";
import BooksSearch from "@/features/book/booklist/components/Books_Search";
import BooksFilter from "@/features/book/booklist/components/Books_Filter";
import BookViewChanger from "@/features/book/booklist/actions/Book_View_Changer";
import PaginationBooks from "@/features/book/booklist/components/PaginationBooks";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";

const BookList = () => {
  const params = useParams();
  const pathname = usePathname();
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();
  const { currentFont } = useFont();

  // Get current language from URL
  const getCurrentLanguage = () => {
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
    return params?.lang || contextLanguage || "en";
  };

  const currentLanguage = getCurrentLanguage();

  // Get books based on current language from URL
  const booksData = useMemo(() => {
    return getBooksByLanguage(currentLanguage);
  }, [currentLanguage]);

  // State for search and display
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [isMobile, setIsMobile] = useState(false);

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // State for sorting and display
  const [sortOption, setSortOption] = useState("title-asc");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewType("grid");
        setShowAdvancedControls(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedTags,
    selectedAuthors,
    selectedCategories,
    selectedCollections,
    selectedSubjects,
    sortOption,
    currentLanguage,
  ]);

  // Extract all filter options from books data
  const { allTags, allAuthors, allCategories, allCollections, allSubjects } =
    useMemo(() => {
      if (!booksData || booksData.length === 0) {
        return {
          allTags: [],
          allAuthors: [],
          allCategories: [],
          allCollections: [],
          allSubjects: [],
        };
      }

      return {
        allTags: Array.from(
          new Set(booksData.flatMap((book) => book.tags || [])),
        ).filter(Boolean),
        allAuthors: Array.from(
          new Set(booksData.map((book) => book.author)),
        ).filter(Boolean),
        allCategories: Array.from(
          new Set(booksData.map((book) => book.category)),
        ).filter(Boolean),
        allCollections: Array.from(
          new Set(booksData.map((book) => book.collection)),
        ).filter(Boolean),
        allSubjects: Array.from(
          new Set(booksData.flatMap((book) => book.subjects || [])),
        ).filter(Boolean),
      };
    }, [booksData]);

  // Sort books based on sort option
  const sortBooks = (books) => {
    if (!books || books.length === 0) return [];

    const sortedBooks = [...books];

    switch (sortOption) {
      case "title-asc":
        return sortedBooks.sort((a, b) => a.title?.localeCompare(b.title) || 0);
      case "title-desc":
        return sortedBooks.sort((a, b) => b.title?.localeCompare(a.title) || 0);
      case "author-asc":
        return sortedBooks.sort(
          (a, b) => a.author?.localeCompare(b.author) || 0,
        );
      case "author-desc":
        return sortedBooks.sort(
          (a, b) => b.author?.localeCompare(a.author) || 0,
        );
      case "date-newest":
        return sortedBooks.sort(
          (a, b) =>
            new Date(b.publishedDate || b.published || 0) -
            new Date(a.publishedDate || a.published || 0),
        );
      case "date-oldest":
        return sortedBooks.sort(
          (a, b) =>
            new Date(a.publishedDate || a.published || 0) -
            new Date(b.publishedDate || b.published || 0),
        );
      case "popular":
        return sortedBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "rating":
        return sortedBooks.sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0),
        );
      default:
        return sortedBooks;
    }
  };

  // Filter books based on all criteria
  const filteredBooks = useMemo(() => {
    if (!booksData || booksData.length === 0) return [];

    const filtered = booksData.filter((book) => {
      // Search term matching
      const matchesSearch =
        searchTerm === "" ||
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.description &&
          book.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter category matching
      const matchesTags =
        selectedTags.length === 0 ||
        (book.tags && selectedTags.some((tag) => book.tags?.includes(tag)));

      const matchesAuthors =
        selectedAuthors.length === 0 || selectedAuthors.includes(book.author);

      const matchesCategories =
        selectedCategories.length === 0 ||
        (book.category && selectedCategories.includes(book.category));

      const matchesCollections =
        selectedCollections.length === 0 ||
        (book.collection && selectedCollections.includes(book.collection));

      const matchesSubjects =
        selectedSubjects.length === 0 ||
        (book.subjects &&
          selectedSubjects.some((sub) => book.subjects?.includes(sub)));

      return (
        matchesSearch &&
        matchesTags &&
        matchesAuthors &&
        matchesCategories &&
        matchesCollections &&
        matchesSubjects
      );
    });

    // Apply sorting
    return sortBooks(filtered);
  }, [
    booksData,
    searchTerm,
    selectedTags,
    selectedAuthors,
    selectedCategories,
    selectedCollections,
    selectedSubjects,
    sortOption,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedAuthors([]);
    setSelectedCategories([]);
    setSelectedCollections([]);
    setSelectedSubjects([]);
    setSearchTerm("");
    setSortOption("title-asc");
    setCurrentPage(1);
  };

  // Determine which view to display based on viewType
  const renderBooksView = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredBooks.length);
    const currentBooks = filteredBooks.slice(startIndex, endIndex);

    if (currentBooks.length === 0) {
      return <NoResults />;
    }

    const handleTagClick = (tag) => {
      setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
      setCurrentPage(1);
    };

    switch (viewType) {
      case "grid":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <BookSquareCard
                key={book.id}
                book={book}
                onTagClick={handleTagClick}
                currentLang={currentLanguage}
              />
            ))}
          </div>
        );

      case "compact":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <BookCompactCard
                key={book.id}
                book={book}
                onTagClick={handleTagClick}
                currentLang={currentLanguage}
              />
            ))}
          </div>
        );

      case "list":
        return (
          <div className="space-y-6">
            {currentBooks.map((book) => (
              <BookRectangleCard
                key={book.id}
                book={book}
                onTagClick={handleTagClick}
                currentLang={currentLanguage}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <BookSquareCard
                key={book.id}
                book={book}
                onTagClick={handleTagClick}
                currentLang={currentLanguage}
              />
            ))}
          </div>
        );
    }
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Toggle advanced controls
  const toggleAdvancedControls = () => {
    setShowAdvancedControls(!showAdvancedControls);
  };

  // Helper function for toggle filter
  const toggleFilter = (filter, category, setCategory) => {
    if (category.includes(filter)) {
      setCategory(category.filter((item) => item !== filter));
    } else {
      setCategory([...category, filter]);
    }
    setCurrentPage(1);
  };

  // Format sort option display
  const formatSortOption = (option) => {
    const formatted = option
      .replace("-", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const sortMap = {
      "Title Asc": t("sort.title_asc") || "Title (A-Z)",
      "Title Desc": t("sort.title_desc") || "Title (Z-A)",
      "Author Asc": t("sort.author_asc") || "Author (A-Z)",
      "Author Desc": t("sort.author_desc") || "Author (Z-A)",
      "Date Newest": t("sort.date_newest") || "Date (Newest)",
      "Date Oldest": t("sort.date_oldest") || "Date (Oldest)",
      Popular: t("sort.popular") || "Most Popular",
      Rating: t("sort.rating") || "Highest Rated",
    };

    return sortMap[formatted] || formatted;
  };

  // No results component
  const NoResults = () => (
    <div className="text-center py-12">
      <svg
        className={`mx-auto h-12 w-12 ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <h3
        className={`mt-2 text-lg font-medium ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}
      >
        {t("book.not_found") || "No books found"}
      </h3>
      <p
        className={`mt-1 ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
      >
        {t("book.not_found_message") ||
          "Try adjusting your search or filter criteria"}
      </p>
      <div className="mt-6">
        <button
          onClick={resetFilters}
          className={`
            px-4 py-2 
            ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
            ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"}
            text-white
            rounded-lg
            shadow-md
            hover:shadow-lg
            transition-all duration-200
          `}
        >
          {t("filter.reset_all") || "Reset all filters"}
        </button>
      </div>
    </div>
  );

  const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div
      className={`min-h-screen ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} overflow-x-hidden`}
      style={fontStyle}
    >
      <div className="container mx-auto p-4 space-y-6 max-w-full">
        {/* Language Indicator */}
        <div className="text-right text-xs opacity-60">
          <span
            className={
              theme.textColors?.secondary ||
              (isDarkMode ? "text-gray-400" : "text-gray-600")
            }
          >
            {t("common.language") || "Language"}:{" "}
            {currentLanguage.toUpperCase()}
          </span>
        </div>

        {/* Search & Controls Bar */}
        <div
          className={`
            flex flex-col md:flex-row items-center justify-between gap-4 
            sticky top-0 z-10 
            ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white")} 
            ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}
            ${theme.shadow?.container || "shadow-lg"}
            p-4 rounded-lg
            backdrop-blur-sm bg-opacity-90
            w-full
          `}
        >
          <BooksSearch
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            theme={theme}
            isDarkMode={isDarkMode}
            t={t}
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <BookViewChanger
              viewType={viewType}
              setViewType={setViewType}
              isMobile={isMobile}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              sortOption={sortOption}
              setSortOption={setSortOption}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              showAdvancedControls={showAdvancedControls}
              theme={theme}
              isDarkMode={isDarkMode}
              t={t}
            />

            {!isMobile && (
              <button
                onClick={toggleAdvancedControls}
                className={`
                  p-2 rounded-md transition-all duration-200
                  ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"}
                  ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"}
                  ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"}
                  shadow-md hover:shadow-lg flex-shrink-0
                `}
                title={
                  showAdvancedControls
                    ? t("view.hide_advanced") || "Hide Advanced Controls"
                    : t("view.show_advanced") || "Show Advanced Controls"
                }
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-800" : "bg-gray-50")} rounded-lg p-4 ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} ${theme.shadow?.container || "shadow-lg"} overflow-x-auto`}
          >
            <BooksFilter
              showFilters={showFilters}
              resetFilters={resetFilters}
              allTags={allTags}
              allAuthors={allAuthors}
              allCategories={allCategories}
              allCollections={allCollections}
              allSubjects={allSubjects}
              selectedTags={selectedTags}
              selectedAuthors={selectedAuthors}
              selectedCategories={selectedCategories}
              selectedCollections={selectedCollections}
              selectedSubjects={selectedSubjects}
              toggleFilter={toggleFilter}
              setSelectedTags={setSelectedTags}
              setSelectedAuthors={setSelectedAuthors}
              setSelectedCategories={setSelectedCategories}
              setSelectedCollections={setSelectedCollections}
              setSelectedSubjects={setSelectedSubjects}
              theme={theme}
              isDarkMode={isDarkMode}
              t={t}
            />
          </div>
        )}

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div
            className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
          >
            {t("pagination.showing") || "Found"} {filteredBooks.length}{" "}
            {filteredBooks.length === 1
              ? t("book.singular") || "book"
              : t("book.plural") || "books"}
          </div>
          <div
            className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} flex items-center gap-2 flex-wrap`}
          >
            <span className="flex items-center gap-1 whitespace-nowrap">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              {t("sort.sorted_by") || "Sorted by"}:{" "}
              {formatSortOption(sortOption)}
            </span>
          </div>
        </div>

        {/* Book Cards */}
        {renderBooksView()}

        {/* Pagination */}
        {filteredBooks.length > 0 && (
          <PaginationBooks
            currentPage={currentPage}
            totalPages={Math.ceil(filteredBooks.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredBooks.length}
            theme={theme}
            isDarkMode={isDarkMode}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default BookList;
