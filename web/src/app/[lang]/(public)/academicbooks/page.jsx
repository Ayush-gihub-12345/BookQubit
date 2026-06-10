"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaBook,
  FaGraduationCap,
  FaUniversity,
  FaChartLine,
  FaMicroscope,
  FaCalculator,
  FaFlask,
  FaLaptopCode,
  FaHeartbeat,
  FaLeaf,
  FaDatabase,
  FaBrain,
} from "react-icons/fa";
import { getAcademicBooksByLanguage } from "@/data/academic_books_data";

// Category icons mapping
const categoryIcons = {
  Mathematics: <FaCalculator />,
  Physics: <FaMicroscope />,
  "Computer Science": <FaLaptopCode />,
  Chemistry: <FaFlask />,
  Psychology: <FaBrain />,
  Business: <FaChartLine />,
  Economics: <FaChartLine />,
  Biology: <FaLeaf />,
  "Environmental Science": <FaLeaf />,
  Medicine: <FaHeartbeat />,
  Engineering: <FaMicroscope />,
  History: <FaUniversity />,
  Statistics: <FaDatabase />,
  Default: <FaGraduationCap />,
};

// Level colors
const levelColors = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const AcademicBooks = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [academicBooks, setAcademicBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const booksPerPage = 12;

  // Load academic books based on language
  useEffect(() => {
    setIsLoading(true);
    try {
      const booksData = getAcademicBooksByLanguage(language);
      console.log("Language:", language);
      console.log("Books data received:", booksData);
      console.log("Books data length:", booksData?.length);
      
      if (booksData && Array.isArray(booksData)) {
        setAcademicBooks(booksData);
      } else {
        console.error("Invalid books data format:", booksData);
        setAcademicBooks([]);
      }
    } catch (error) {
      console.error("Error loading academic books:", error);
      setAcademicBooks([]);
    }
    setIsLoading(false);
  }, [language]);

  if (!theme) return null;

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Get unique categories and levels
  const categories = academicBooks && academicBooks.length > 0
    ? ["All", ...new Set(academicBooks.map((book) => book.category).filter(Boolean))]
    : ["All"];

  const levels = academicBooks && academicBooks.length > 0
    ? ["All", ...new Set(academicBooks.map((book) => book.level).filter(Boolean))]
    : ["All"];

  // Filter books
  const filteredBooks = academicBooks && academicBooks.length > 0
    ? academicBooks.filter((book) => {
        const matchesSearch = searchTerm === "" ||
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
        const matchesLevel = selectedLevel === "All" || book.level === selectedLevel;

        return matchesSearch && matchesCategory && matchesLevel;
      })
    : [];

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "popular") return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "price") return (parseFloat(a.price?.replace("$", "") || 0) - parseFloat(b.price?.replace("$", "") || 0));
    if (sortBy === "newest") return (b.new ? 1 : 0) - (a.new ? 1 : 0);
    return 0;
  });

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== "All" || selectedLevel !== "All" || searchTerm !== "";

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(rating || 0) ? "text-amber-400" : "text-gray-300"}`} />
        ))}
        <span className={`text-xs ml-1 ${theme.textColors?.secondary || "text-gray-500"}`}>({rating || 0})</span>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen py-12 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
          <p className={`mt-4 ${theme.textColors?.secondary || "text-gray-600"}`}>{t("academic.message.loading") || "Loading academic books..."}</p>
        </div>
      </div>
    );
  }

  // Debug: Show if no books
  if (academicBooks.length === 0) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaBook className="text-6xl mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">No Academic Books Found</h2>
          <p className="mb-4">Please check if your academic books data files are properly set up.</p>
          <p className="text-sm text-gray-500">Language: {language}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}>
              <FaGraduationCap className={`text-4xl ${theme.textColors?.highlight || "text-sky-600"}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}>
            {t("academic.hero.title") || "Academic Books"}
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} max-w-3xl mx-auto`}>
            {t("academic.hero.subtitle") || "Explore our comprehensive collection of academic textbooks and research materials"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`} />
              <input
                type="text"
                placeholder={t("academic.search.placeholder") || "Search by title, author, subject, or tags..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || "border-gray-300 dark:border-gray-600"} ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${showFilters ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-600"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}`}
            >
              <FaFilter />
              {t("academic.filter.title") || "Filters"}
              {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">!</span>}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}`}
              >
                ⊞ {t("view.grid_view") || "Grid"}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}`}
              >
                ≡ {t("view.list_view") || "List"}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`p-4 rounded-lg ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} mb-4`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
                    {t("academic.filter.category") || "Category"}
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedCategory === category ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}`}
                      >
                        {category === "All" ? (t("academic.level.all") || "All") : (
                          <span className="flex items-center gap-1">
                            {categoryIcons[category] || categoryIcons.Default}
                            {t(`academic.category.${category.toLowerCase().replace(/ /g, "_")}`) || category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
                    {t("academic.filter.level") || "Level"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedLevel === level ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}`}
                      >
                        {level === "All" ? (t("academic.level.all") || "All") : (t(`academic.level.${level.toLowerCase()}`) || level)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sort and Results */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("academic.pagination.showing") || "Found"} {sortedBooks.length} {sortedBooks.length === 1 ? (t("book.singular") || "book") : (t("book.plural") || "books")}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>{t("sort.sort_by") || "Sort by"}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm ${theme.border?.default || "border-gray-300 dark:border-gray-600"} ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                <option value="popular">{t("sort.popular") || "Most Popular"}</option>
                <option value="rating">{t("sort.rating") || "Highest Rated"}</option>
                <option value="title">{t("sort.title_asc") || "Title A-Z"}</option>
                <option value="price">{t("sort.price_low_high") || "Price: Low to High"}</option>
                <option value="newest">{t("sort.date_newest") || "Newest First"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid/List View */}
        {currentBooks.length === 0 ? (
          <div className="text-center py-16">
            <FaBook className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
              {t("academic.search.no_results") || "No books found"}
            </h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("academic.search.try_adjusting") || "Try adjusting your search or filter criteria"}
            </p>
            <button onClick={clearFilters} className={`mt-4 px-6 py-2 ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}>
              {t("academic.filter.reset") || "Clear Filters"}
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <div key={book.id} className={`group ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                <div className={`p-4 ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-700" : "bg-gray-100")} flex justify-center items-center h-48`}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="h-full object-contain" />
                  ) : (
                    <FaBook className={`text-5xl ${theme.textColors?.highlight || "text-sky-600"}`} />
                  )}
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-lg line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>{book.title}</h3>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>{t("book.by") || "by"} {book.author} | {book.year}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(book.rating)}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[book.level] || "bg-gray-100 text-gray-700"}`}>
                      {t(`academic.level.${book.level?.toLowerCase()}`) || book.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-lg font-bold ${theme.textColors?.highlight || "text-sky-600"}`}>{book.price}</span>
                    <Link href={`/academicbooks/${book.slug}`} className={`px-3 py-1.5 text-sm ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}>
                      {t("book.view_details") || "View Details"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentBooks.map((book) => (
              <div key={book.id} className={`flex flex-col sm:flex-row gap-4 p-4 ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl transition-all hover:shadow-lg`}>
                <div className={`flex-shrink-0 w-32 h-40 ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-700" : "bg-gray-100")} rounded-lg flex items-center justify-center`}>
                  {book.coverImage ? <img src={book.coverImage} alt={book.title} className="h-32 object-contain" /> : <FaBook className={`text-3xl ${theme.textColors?.highlight || "text-sky-600"}`} />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>{book.title}</h3>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>{t("book.by") || "by"} {book.author} | {book.year} | {book.publisher}</p>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {renderStars(book.rating)}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[book.level] || "bg-gray-100 text-gray-700"}`}>
                      {t(`academic.level.${book.level?.toLowerCase()}`) || book.level}
                    </span>
                    <span className={`text-sm ${theme.textColors?.secondary || "text-gray-500"}`}>{book.pages} {t("book.pages") || "pages"}</span>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>{book.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className={`text-xl font-bold ${theme.textColors?.highlight || "text-sky-600"}`}>{book.price}</span>
                    <Link href={`/academicbooks/${book.slug}`} className={`px-3 py-1.5 text-sm ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}>
                      {t("book.view_details") || "View Details"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}>
              {t("pagination.prev") || "Previous"}
            </button>
            {[...Array(Math.min(totalPages, 10))].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded-lg transition-all ${currentPage === i + 1 ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}>
              {t("pagination.next") || "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicBooks;