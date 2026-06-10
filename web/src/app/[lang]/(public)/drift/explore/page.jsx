"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaBookOpen,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaShare,
  FaSearch,
  FaFilter,
  FaTimes,
  FaRegBookmark,
  FaBookmark,
  FaThLarge,
  FaList,
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useFont } from "@/contexts/FontContext";

const ExplorePage = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const router = useRouter();

  // State for books and filters
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState({});

  // Categories
  const categories = [
    { id: "all", name: "All Books", icon: "📚" },
    { id: "fiction", name: "Fiction", icon: "📖" },
    { id: "fantasy", name: "Fantasy", icon: "🐉" },
    { id: "sci-fi", name: "Sci-Fi", icon: "🚀" },
    { id: "mystery", name: "Mystery", icon: "🔍" },
    { id: "romance", name: "Romance", icon: "💕" },
    { id: "biography", name: "Biography", icon: "👤" },
    { id: "self-help", name: "Self-Help", icon: "🌱" },
  ];

  // Mock books data - replace with API call
  const mockBooks = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      category: "fiction",
      rating: 4.5,
      coverUrl: "https://covers.openlibrary.org/b/id/8233190-L.jpg",
      description: "Between life and death there is a library...",
      pageCount: 288,
      published: 2020,
      language: "English",
      slug: "the-midnight-library",
    },
    {
      id: 2,
      title: "Project Hail Mary",
      author: "Andy Weir",
      category: "sci-fi",
      rating: 4.8,
      coverUrl: "https://covers.openlibrary.org/b/id/11241975-L.jpg",
      description: "A lone astronaut must save humanity...",
      pageCount: 496,
      published: 2021,
      language: "English",
      slug: "project-hail-mary",
    },
    {
      id: 3,
      title: "The Name of the Wind",
      author: "Patrick Rothfuss",
      category: "fantasy",
      rating: 4.7,
      coverUrl: "https://covers.openlibrary.org/b/id/6898790-L.jpg",
      description: "The tale of Kvothe, a legendary figure...",
      pageCount: 662,
      published: 2007,
      language: "English",
      slug: "the-name-of-the-wind",
    },
    {
      id: 4,
      title: "Atomic Habits",
      author: "James Clear",
      category: "self-help",
      rating: 4.6,
      coverUrl: "https://covers.openlibrary.org/b/id/12649079-L.jpg",
      description: "Tiny changes, remarkable results...",
      pageCount: 320,
      published: 2018,
      language: "English",
      slug: "atomic-habits",
    },
    {
      id: 5,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      category: "mystery",
      rating: 4.4,
      coverUrl: "https://covers.openlibrary.org/b/id/9900010-L.jpg",
      description: "A woman's act of violence...",
      pageCount: 336,
      published: 2019,
      language: "English",
      slug: "the-silent-patient",
    },
    {
      id: 6,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      category: "romance",
      rating: 4.6,
      coverUrl: "https://covers.openlibrary.org/b/id/8253990-L.jpg",
      description: "A classic tale of love and misunderstanding...",
      pageCount: 279,
      published: 1813,
      language: "English",
      slug: "pride-and-prejudice",
    },
  ];

  // Load books
  useEffect(() => {
    setTimeout(() => {
      setBooks(mockBooks);
      setFilteredBooks(mockBooks);
      setLoading(false);
    }, 500);
  }, []);

  // Filter books based on search and category
  useEffect(() => {
    let filtered = books;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [searchTerm, selectedCategory, books]);

  const handleWishlistToggle = (bookId) => {
    setWishlist((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  const handleBookClick = (slug) => {
    router.push(`/books/${slug}`);
  };

  const handleShare = async (book) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out "${book.title}" by ${book.author}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${
          i < Math.floor(rating)
            ? theme.iconColors?.starFilled || "text-amber-400"
            : theme.iconColors?.starEmpty || "text-gray-300 dark:text-gray-600"
        } ${i > 0 ? "ml-1" : ""}`}
        size={14}
      />
    ));
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.background?.page || "bg-gray-50 dark:bg-gray-900"}`}
        style={{ fontFamily: currentFont?.family }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className={theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}>
            Loading amazing books...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.background?.page || "bg-gray-50 dark:bg-gray-900"}`}
      style={{ fontFamily: currentFont?.family }}
    >
      {/* Hero Header */}
      <div
        className={`relative overflow-hidden ${theme.background?.section || "bg-gradient-to-r from-sky-600 to-indigo-600"} py-12 px-4`}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4`}
          >
            🔍 {t("explore.title") || "Explore Books"}
          </h1>
          <p className={`text-white/90 text-lg max-w-2xl mx-auto`}>
            {t("explore.subtitle") ||
              "Discover your next favorite read from our collection"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
              />
              <input
                type="text"
                placeholder={t("explore.search") || "Search by title or author..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.background?.card || "bg-white dark:bg-gray-800"} ${theme.border?.default || "border-gray-200 dark:border-gray-700"} ${theme.textColors?.primary || "text-gray-900 dark:text-white"} focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all`}
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl ${theme.background?.card || "bg-white dark:bg-gray-800"} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} ${theme.textColors?.primary || "text-gray-700 dark:text-gray-300"} hover:${theme.background?.hover || "hover:bg-gray-50 dark:hover:bg-gray-700"} transition-all`}
            >
              <FaFilter />
              <span>{t("explore.filters") || "Filters"}</span>
              {showFilters ? <FaTimes /> : null}
            </button>

            {/* View Mode Toggle */}
            <div
              className={`flex rounded-xl overflow-hidden ${theme.background?.card || "bg-white dark:bg-gray-800"} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}`}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 transition-all ${
                  viewMode === "grid"
                    ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-500"} text-white`
                    : theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"
                }`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 transition-all ${
                  viewMode === "list"
                    ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-500"} text-white`
                    : theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"
                }`}
              >
                <FaList />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div
              className={`mt-4 p-4 rounded-xl ${theme.background?.card || "bg-white dark:bg-gray-800"} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} animate-fadeIn`}
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-500"} text-white`
                        : `${theme.background?.hover || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || "text-gray-700 dark:text-gray-300"}`
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-6 ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}>
          {t("explore.showing") || "Showing"} {filteredBooks.length}{" "}
          {t("explore.results") || "results"}
        </div>

        {/* Books Grid/List View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.slug)}
                className={`group cursor-pointer rounded-xl overflow-hidden ${theme.background?.card || "bg-white dark:bg-gray-800"} ${theme.shadow?.container || "shadow-lg"} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                {/* Book Cover */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Wishlist Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(book.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {wishlist[book.id] ? (
                      <FaHeart className="text-rose-500" size={18} />
                    ) : (
                      <FaHeart className="text-gray-400" size={18} />
                    )}
                  </button>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3
                    className={`font-semibold text-lg ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-1 line-clamp-1`}
                  >
                    {book.title}
                  </h3>
                  <p
                    className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-2`}
                  >
                    {t("book.by") || "by"} {book.author}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">{renderStars(book.rating)}</div>
                    <span
                      className={`text-xs ${theme.background?.badge || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} px-2 py-1 rounded`}
                    >
                      {book.published}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.slug)}
                className={`flex gap-4 p-4 rounded-xl cursor-pointer ${theme.background?.card || "bg-white dark:bg-gray-800"} ${theme.shadow?.container || "shadow"} hover:shadow-lg transition-all`}
              >
                {/* Book Cover Thumbnail */}
                <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Book Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-semibold text-lg ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-1`}
                      >
                        {book.title}
                      </h3>
                      <p
                        className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-2`}
                      >
                        {t("book.by") || "by"} {book.author}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(book.id);
                      }}
                      className={`p-2 rounded-full transition-all ${
                        wishlist[book.id]
                          ? "text-rose-500"
                          : theme.textColors?.secondary || "text-gray-400"
                      }`}
                    >
                      {wishlist[book.id] ? <FaHeart size={20} /> : <FaHeart size={20} />}
                    </button>
                  </div>

                  <p
                    className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-3 line-clamp-2`}
                  >
                    {book.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center">{renderStars(book.rating)}</div>
                    <span
                      className={`text-xs ${theme.textColors?.secondary || "text-gray-500 dark:text-gray-500"}`}
                    >
                      {book.pageCount} pages
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(book);
                      }}
                      className={`p-1.5 rounded ${theme.background?.hover || "hover:bg-gray-100 dark:hover:bg-gray-700"} transition-colors`}
                    >
                      <FaShare size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div
            className={`text-center py-20 rounded-xl ${theme.background?.card || "bg-white dark:bg-gray-800"}`}
          >
            <p className={`text-6xl mb-4`}>📚</p>
            <h3
              className={`text-xl font-semibold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2`}
            >
              {t("explore.no_books") || "No books found"}
            </h3>
            <p className={theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}>
              {t("explore.try_different") || "Try a different search or category"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;