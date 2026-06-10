"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useBooks } from "@/hooks/useBooks";
import { useTheme } from "@/themes/useTheme";
import {
  FaBook,
  FaCalendarAlt,
  FaChartLine,
  FaFilter,
  FaFire,
  FaSearch,
  FaStar,
  FaTag,
  FaTrophy,
} from "react-icons/fa";

const placeholderCover =
  "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=240&h=360&fit=crop";

const pageConfig = {
  bestsellers: {
    title: "Bestselling Books",
    description: "Books currently highlighted by your database.",
    empty: "No bestselling books found",
    icon: FaFire,
    accent: "from-orange-500 to-red-500",
    badge: "Bestseller",
    sortLabel: "Bestselling",
  },
  newreleases: {
    title: "New Releases",
    description: "Recently added books from your database.",
    empty: "No new releases found",
    icon: FaChartLine,
    accent: "from-emerald-500 to-teal-500",
    badge: "New Release",
    sortLabel: "Newest",
  },
  toprated: {
    title: "Top Rated Books",
    description: "Highest rated books from your database.",
    empty: "No top rated books found",
    icon: FaTrophy,
    accent: "from-amber-500 to-yellow-500",
    badge: "Top Rated",
    sortLabel: "Top Rated",
  },
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getBookDate = (book) => {
  const raw = book.publishedDate || book.createdAt || book.updatedAt || book.published;
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const getBookYear = (book) => {
  const rawYear = book.publishedYear || book.year || book.published;
  if (rawYear && /^\d{4}$/.test(String(rawYear))) return rawYear;
  return getBookDate(book)?.getFullYear() || "";
};

const normalizeBook = (book, index, config) => ({
  ...book,
  rank: index + 1,
  title: book.title || "Untitled Book",
  author: book.author || "Unknown Author",
  slug: book.slug || String(book.id),
  coverImage: book.coverImage || book.imageUrl || placeholderCover,
  description: book.description || "",
  category: book.category || book.genre || "General",
  rating: toNumber(book.rating, 0),
  reviews: toNumber(book.reviews || book.reviewCount || book.popularity, 0),
  price: book.price || "",
  originalPrice: book.originalPrice || "",
  publishedYear: getBookYear(book),
  badge: book.badge || config.badge,
});

const sortBooksForVariant = (books, variant) => {
  const sorted = [...books];

  if (variant === "newreleases") {
    return sorted.sort((a, b) => {
      const aTime = getBookDate(a)?.getTime() || 0;
      const bTime = getBookDate(b)?.getTime() || 0;
      return bTime - aTime;
    });
  }

  if (variant === "toprated") {
    return sorted.sort(
      (a, b) =>
        toNumber(b.rating) - toNumber(a.rating) ||
        (a.title || "").localeCompare(b.title || ""),
    );
  }

  return sorted.sort(
    (a, b) =>
      toNumber(b.popularity || b.reviews || b.reviewCount || b.rating) -
        toNumber(a.popularity || a.reviews || a.reviewCount || a.rating) ||
      (a.title || "").localeCompare(b.title || ""),
  );
};

const BookShowcasePage = ({ variant }) => {
  const config = pageConfig[variant] || pageConfig.bestsellers;
  const { theme, themeName } = useTheme();
  const { books, loading, language } = useBooks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const normalizedBooks = useMemo(
    () =>
      sortBooksForVariant(books, variant).map((book, index) =>
        normalizeBook(book, index, config),
      ),
    [books, config, variant],
  );

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(normalizedBooks.map((book) => book.category))).filter(Boolean),
    ],
    [normalizedBooks],
  );

  if (!theme) return null;

  const Icon = config.icon;
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const query = searchTerm.toLowerCase();
  const filteredBooks = normalizedBooks.filter((book) => {
    const matchesSearch =
      query === "" ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.description.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentBooks = filteredBooks.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  const bookHref = (book) => `/${language || "en"}/books/${book.slug || book.id}`;

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen py-12`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div
              className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
            >
              <Icon
                className={`text-4xl ${theme.textColors?.highlight || "text-sky-500"}`}
              />
            </div>
          </div>
          <h1
            className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}
          >
            {config.title}
          </h1>
          <p
            className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} max-w-3xl mx-auto`}
          >
            {config.description}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
              />
              <input
                type="text"
                placeholder={`Search ${config.title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || "border-gray-300 dark:border-gray-600"} ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${showFilters ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-600"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}`}
            >
              <FaFilter /> Filters
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">
                  !
                </span>
              )}
            </button>
            <div className="flex gap-2">
              {["grid", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${viewMode === mode ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {showFilters && (
            <div
              className={`p-4 rounded-lg ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} mb-4`}
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedCategory === category ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex justify-end mt-2">
              <button
                onClick={resetFilters}
                className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline`}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div
          className={`mb-6 text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
        >
          Showing {filteredBooks.length} books sorted by {config.sortLabel}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto" />
            <p
              className={`mt-4 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
            >
              Loading books...
            </p>
          </div>
        ) : currentBooks.length === 0 ? (
          <div className="text-center py-16">
            <FaBook
              className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
            >
              {config.empty}
            </h3>
            <p
              className={`${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
            >
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <article
                key={book.id}
                className={`group ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
              >
                <div className="relative">
                  <div
                    className={`p-4 ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-700" : "bg-gray-100")} flex justify-center items-center h-56`}
                  >
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-full object-contain"
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <span
                      className={`bg-gradient-to-r ${config.accent} text-white text-xs px-2 py-1 rounded-full`}
                    >
                      #{book.rank} {book.badge}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(book.rating) ? "text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span
                      className={`text-xs ml-1 ${theme.textColors?.secondary || "text-gray-500"}`}
                    >
                      ({book.reviews.toLocaleString()})
                    </span>
                  </div>
                  <h3
                    className={`font-bold text-lg mb-1 line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
                  >
                    {book.title}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
                  >
                    by {book.author}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    {book.publishedYear && (
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} /> {book.publishedYear}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FaTag size={10} /> {book.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {book.price && (
                        <span
                          className={`text-lg font-bold ${theme.textColors?.highlight || "text-sky-600"}`}
                        >
                          {book.price}
                        </span>
                      )}
                    </div>
                    <Link
                      href={bookHref(book)}
                      className={`px-3 py-1.5 text-sm ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentBooks.map((book) => (
              <article
                key={book.id}
                className={`flex flex-col sm:flex-row gap-4 p-4 ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl transition-all hover:shadow-lg`}
              >
                <div className="flex-shrink-0 w-32 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-32 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 bg-gradient-to-r ${config.accent} text-white rounded-full mb-2`}
                  >
                    #{book.rank} {book.badge}
                  </span>
                  <h3
                    className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
                  >
                    {book.title}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
                  >
                    by {book.author}
                  </p>
                  <p
                    className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
                  >
                    {book.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-4 text-sm">
                      {book.publishedYear && (
                        <span
                          className={`flex items-center gap-1 ${theme.textColors?.secondary || "text-gray-500"}`}
                        >
                          <FaCalendarAlt size={12} /> {book.publishedYear}
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1 ${theme.textColors?.secondary || "text-gray-500"}`}
                      >
                        <FaTag size={12} /> {book.category}
                      </span>
                    </div>
                    <Link
                      href={bookHref(book)}
                      className={`px-4 py-2 text-sm ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg transition-all ${currentPage === i + 1 ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white` : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookShowcasePage;
