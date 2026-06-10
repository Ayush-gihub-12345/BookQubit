"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaStar,
  FaFire,
  FaTrophy,
  FaCrown,
  FaMedal,
  FaSearch,
  FaFilter,
  FaTimes,
  FaBook,
  FaArrowRight,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaHeart,
  FaEye,
  FaBookmark,
} from "react-icons/fa";

// Sample Featured Books data
const featuredBooksData = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    slug: "the-midnight-library",
    coverImage: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=200&h=300&fit=crop",
    description: "Between life and death there is a library. When Nora Seed finds herself in the Midnight Library, she has a chance to make things right.",
    rating: 4.8,
    reviews: 15234,
    price: "$14.99",
    originalPrice: "$24.99",
    category: "Fiction",
    publishedYear: 2020,
    featuredReason: "Editor's Pick",
    featuredBadge: "⭐ Editor's Choice",
    featuredColor: "from-amber-500 to-yellow-500",
    isBestseller: true,
    isAwardWinner: true,
    award: "Goodreads Choice Award 2020",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    slug: "atomic-habits",
    coverImage: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?w=200&h=300&fit=crop",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day.",
    rating: 4.9,
    reviews: 28765,
    price: "$12.99",
    originalPrice: "$22.99",
    category: "Self-Help",
    publishedYear: 2018,
    featuredReason: "Most Popular",
    featuredBadge: "🔥 Most Popular",
    featuredColor: "from-orange-500 to-red-500",
    isBestseller: true,
    isAwardWinner: false,
    award: null,
  },
  {
    id: 3,
    title: "Project Hail Mary",
    author: "Andy Weir",
    slug: "project-hail-mary",
    coverImage: "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?w=200&h=300&fit=crop",
    description: "A lone astronaut must save humanity from extinction in this thrilling science fiction adventure.",
    rating: 4.9,
    reviews: 19876,
    price: "$16.99",
    originalPrice: "$27.99",
    category: "Science Fiction",
    publishedYear: 2021,
    featuredReason: "Staff Pick",
    featuredBadge: "👥 Staff Pick",
    featuredColor: "from-emerald-500 to-teal-500",
    isBestseller: true,
    isAwardWinner: true,
    award: "Audie Award 2022",
  },
  {
    id: 4,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    slug: "the-silent-patient",
    coverImage: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=200&h=300&fit=crop",
    description: "A gripping psychological thriller about a woman's act of violence against her husband.",
    rating: 4.6,
    reviews: 18765,
    price: "$13.99",
    originalPrice: "$23.99",
    category: "Thriller",
    publishedYear: 2019,
    featuredReason: "Reader Favorite",
    featuredBadge: "❤️ Reader Favorite",
    featuredColor: "from-rose-500 to-pink-500",
    isBestseller: true,
    isAwardWinner: false,
    award: null,
  },
  {
    id: 5,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    slug: "where-the-crawdads-sing",
    coverImage: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=200&h=300&fit=crop",
    description: "A beautiful coming-of-age story that blends mystery, romance, and nature into an unforgettable tale.",
    rating: 4.7,
    reviews: 23456,
    price: "$15.99",
    originalPrice: "$25.99",
    category: "Fiction",
    publishedYear: 2018,
    featuredReason: "Award Winner",
    featuredBadge: "🏆 Award Winner",
    featuredColor: "from-purple-500 to-indigo-500",
    isBestseller: true,
    isAwardWinner: true,
    award: "Goodreads Choice Award 2019",
  },
  {
    id: 6,
    title: "Becoming",
    author: "Michelle Obama",
    slug: "becoming",
    coverImage: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=200&h=300&fit=crop",
    description: "The intimate, powerful, and inspiring memoir by the former First Lady of the United States.",
    rating: 4.8,
    reviews: 34567,
    price: "$19.99",
    originalPrice: "$29.99",
    category: "Memoir",
    publishedYear: 2018,
    featuredReason: "Featured Selection",
    featuredBadge: "📖 Featured Selection",
    featuredColor: "from-blue-500 to-cyan-500",
    isBestseller: true,
    isAwardWinner: true,
    award: "Grammy Award for Best Spoken Word Album",
  },
  {
    id: 7,
    title: "The Vanishing Half",
    author: "Brit Bennett",
    slug: "the-vanishing-half",
    coverImage: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?w=200&h=300&fit=crop",
    description: "A novel about twin sisters who choose to live in two different worlds, one black and one white.",
    rating: 4.5,
    reviews: 12345,
    price: "$14.99",
    originalPrice: "$24.99",
    category: "Literary Fiction",
    publishedYear: 2020,
    featuredReason: "Critics' Choice",
    featuredBadge: "📚 Critics' Choice",
    featuredColor: "from-indigo-500 to-purple-500",
    isBestseller: true,
    isAwardWinner: true,
    award: "New York Times Bestseller",
  },
  {
    id: 8,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    slug: "klara-and-the-sun",
    coverImage: "https://images.pexels.com/photos/1676991/pexels-photo-1676991.jpeg?w=200&h=300&fit=crop",
    description: "A remarkable story of an AI friend who observes the world and hopes to prevent her human from being lonely.",
    rating: 4.4,
    reviews: 9876,
    price: "$17.99",
    originalPrice: "$27.99",
    category: "Science Fiction",
    publishedYear: 2021,
    featuredReason: "Nobel Winner",
    featuredBadge: "🏅 Nobel Prize Winner",
    featuredColor: "from-amber-600 to-orange-600",
    isBestseller: true,
    isAwardWinner: true,
    award: "Nobel Prize in Literature",
  },
];

const categories = ["All", "Fiction", "Self-Help", "Science Fiction", "Thriller", "Memoir", "Literary Fiction"];
const featuredTypes = ["All", "Editor's Pick", "Most Popular", "Staff Pick", "Reader Favorite", "Award Winner", "Featured Selection", "Critics' Choice"];

const FeaturedBooksPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFeaturedType, setSelectedFeaturedType] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating");
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter books
  const filteredBooks = featuredBooksData.filter((book) => {
    const matchesSearch = searchTerm === "" ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesFeaturedType = selectedFeaturedType === "All" || book.featuredReason === selectedFeaturedType;
    return matchesSearch && matchesCategory && matchesFeaturedType;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviews - a.reviews;
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "price") return parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", ""));
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedFeaturedType("All");
    setSortBy("rating");
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All" || selectedFeaturedType !== "All";

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaCrown className={`text-4xl ${theme.textColors?.highlight || 'text-yellow-500'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Featured Books
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover our hand-picked selection of exceptional books
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search featured books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${showFilters ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-600'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}`}
            >
              <FaFilter /> Filters {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">!</span>}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}
              >
                ≡ List
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`p-4 rounded-lg ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} mb-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedCategory === category ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Featured Type</label>
                  <div className="flex flex-wrap gap-2">
                    {featuredTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedFeaturedType(type)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedFeaturedType === type ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviews</option>
                    <option value="title">Title A-Z</option>
                    <option value="price">Price: Low to High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex justify-end mt-2">
              <button onClick={clearFilters} className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-6 text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Showing {sortedBooks.length} featured books
        </div>

        {/* Books Display */}
        {currentBooks.length === 0 ? (
          <div className="text-center py-16">
            <FaBook className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No featured books found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <div
                key={book.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="relative">
                  <div className={`p-4 ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} flex justify-center items-center h-56`}>
                    <img src={book.coverImage} alt={book.title} className="h-full object-contain" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <div className={`bg-gradient-to-r ${book.featuredColor} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
                      {book.featuredBadge}
                    </div>
                  </div>
                  {book.isAwardWinner && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        🏆 {book.award?.split(" ")[0]}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                    ))}
                    <span className={`text-xs ml-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>({book.reviews.toLocaleString()})</span>
                  </div>
                  <h3 className={`font-bold text-lg mb-1 line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {book.title}
                  </h3>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    by {book.author}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt size={10} /> {book.publishedYear}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaTag size={10} /> {book.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className={`text-lg font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{book.price}</span>
                      <span className={`text-xs line-through ml-2 ${theme.textColors?.secondary || 'text-gray-500'}`}>{book.originalPrice}</span>
                    </div>
                    <Link
                      href={`/bookdeatils/${book.slug}`}
                      className={`px-3 py-1.5 text-sm ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentBooks.map((book) => (
              <div
                key={book.id}
                className={`flex flex-col sm:flex-row gap-4 p-4 ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl transition-all hover:shadow-lg`}
              >
                <div className="flex-shrink-0 w-32 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <img src={book.coverImage} alt={book.title} className="h-32 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 bg-gradient-to-r ${book.featuredColor} text-white rounded-full`}>
                          {book.featuredReason}
                        </span>
                        {book.isAwardWinner && (
                          <span className="text-xs px-2 py-0.5 bg-amber-500 text-white rounded-full">🏆 Award Winner</span>
                        )}
                      </div>
                      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{book.title}</h3>
                      <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>by {book.author}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                      <span className={`text-sm ml-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>({book.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{book.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={12} /> {book.publishedYear}
                      </span>
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaTag size={12} /> {book.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className={`text-xl font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{book.price}</span>
                        <span className={`text-xs line-through ml-2 ${theme.textColors?.secondary || 'text-gray-500'}`}>{book.originalPrice}</span>
                      </div>
                      <Link
                        href={`/bookdeatils/${book.slug}`}
                        className={`px-4 py-2 text-sm ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  {book.award && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <FaTrophy size={12} /> {book.award}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg transition-all ${currentPage === i + 1 ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedBooksPage;