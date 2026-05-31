"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTrophy,
  FaSearch,
  FaFilter,
  FaTimes,
  FaBook,
  FaArrowRight,
  FaUser,
  FaCalendarAlt,
  FaThumbsUp,
  FaComment,
  FaMedal,
  FaCrown,
} from "react-icons/fa";

// Sample top rated books data
const topRatedData = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    slug: "atomic-habits",
    coverImage: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?w=200&h=300&fit=crop",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day.",
    rating: 4.9,
    reviewCount: 28765,
    price: "$12.99",
    originalPrice: "$22.99",
    category: "Self-Help",
    publishedYear: 2018,
    awards: ["Goodreads Choice Award", "Audible Best of the Year"],
    tags: ["Productivity", "Habits", "Personal Growth"],
    isTopRated: true,
    rank: 1,
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    slug: "project-hail-mary",
    coverImage: "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?w=200&h=300&fit=crop",
    description: "A lone astronaut must save humanity from extinction in this thrilling science fiction adventure.",
    rating: 4.9,
    reviewCount: 19876,
    price: "$16.99",
    originalPrice: "$27.99",
    category: "Science Fiction",
    publishedYear: 2021,
    awards: ["Audie Award", "Goodreads Choice Award"],
    tags: ["Sci-Fi", "Adventure", "Space"],
    isTopRated: true,
    rank: 2,
  },
  {
    id: 3,
    title: "The Midnight Library",
    author: "Matt Haig",
    slug: "the-midnight-library",
    coverImage: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=200&h=300&fit=crop",
    description: "Between life and death there is a library. When Nora Seed finds herself in the Midnight Library, she has a chance to make things right.",
    rating: 4.8,
    reviewCount: 15234,
    price: "$14.99",
    originalPrice: "$24.99",
    category: "Fiction",
    publishedYear: 2020,
    awards: ["Goodreads Choice Award", "British Book Award"],
    tags: ["Contemporary", "Philosophical", "Magical Realism"],
    isTopRated: true,
    rank: 3,
  },
  {
    id: 4,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    slug: "the-silent-patient",
    coverImage: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=200&h=300&fit=crop",
    description: "A gripping psychological thriller about a woman's act of violence against her husband.",
    rating: 4.8,
    reviewCount: 18765,
    price: "$13.99",
    originalPrice: "$23.99",
    category: "Thriller",
    publishedYear: 2019,
    awards: ["Edgar Award Nominee", "Goodreads Choice Award"],
    tags: ["Psychological Thriller", "Mystery", "Suspense"],
    isTopRated: true,
    rank: 4,
  },
  {
    id: 5,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    slug: "where-the-crawdads-sing",
    coverImage: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=200&h=300&fit=crop",
    description: "A beautiful coming-of-age story that blends mystery, romance, and nature into an unforgettable tale.",
    rating: 4.8,
    reviewCount: 23456,
    price: "$15.99",
    originalPrice: "$25.99",
    category: "Fiction",
    publishedYear: 2018,
    awards: ["Goodreads Choice Award", "Book of the Month"],
    tags: ["Mystery", "Romance", "Nature"],
    isTopRated: true,
    rank: 5,
  },
  {
    id: 6,
    title: "Educated",
    author: "Tara Westover",
    slug: "educated",
    coverImage: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=200&h=300&fit=crop",
    description: "A memoir about a woman who grows up in a survivalist family and eventually leaves to pursue education.",
    rating: 4.8,
    reviewCount: 19876,
    price: "$14.99",
    originalPrice: "$24.99",
    category: "Memoir",
    publishedYear: 2018,
    awards: ["National Book Critics Circle Award", "Audie Award"],
    tags: ["Memoir", "Inspirational", "Education"],
    isTopRated: true,
    rank: 6,
  },
  {
    id: 7,
    title: "Dune",
    author: "Frank Herbert",
    slug: "dune",
    coverImage: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?w=200&h=300&fit=crop",
    description: "The epic science fiction classic about politics, religion, and ecology on the desert planet Arrakis.",
    rating: 4.7,
    reviewCount: 87654,
    price: "$18.99",
    originalPrice: "$29.99",
    category: "Science Fiction",
    publishedYear: 1965,
    awards: ["Hugo Award", "Nebula Award"],
    tags: ["Classic", "Sci-Fi", "Political"],
    isTopRated: false,
    rank: 7,
  },
  {
    id: 8,
    title: "Becoming",
    author: "Michelle Obama",
    slug: "becoming",
    coverImage: "https://images.pexels.com/photos/1676991/pexels-photo-1676991.jpeg?w=200&h=300&fit=crop",
    description: "The intimate, powerful, and inspiring memoir by the former First Lady of the United States.",
    rating: 4.8,
    reviewCount: 34567,
    price: "$19.99",
    originalPrice: "$29.99",
    category: "Memoir",
    publishedYear: 2018,
    awards: ["Grammy Award for Best Spoken Word Album"],
    tags: ["Memoir", "Leadership", "Inspiration"],
    isTopRated: false,
    rank: 8,
  },
];

const categories = ["All", "Self-Help", "Science Fiction", "Fiction", "Thriller", "Memoir"];
const ratingFilters = [4.5, 4.0, 3.5, 3.0];

const TopRatedPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter books
  const filteredBooks = topRatedData.filter((book) => {
    const matchesSearch = searchTerm === "" ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesRating = minRating === 0 || book.rating >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
    if (sortBy === "price") return parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", ""));
    if (sortBy === "title") return a.title.localeCompare(b.title);
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
    setMinRating(0);
    setSortBy("rating");
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All" || minRating !== 0;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-amber-400 w-4 h-4" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-amber-400 w-4 h-4" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 w-4 h-4" />
        ))}
      </div>
    );
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaTrophy className={`text-4xl ${theme.textColors?.highlight || 'text-yellow-500'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Top Rated Books
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover the highest-rated books loved by readers around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search top rated books..."
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
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Minimum Rating</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMinRating(0)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all ${minRating === 0 ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                    >
                      All
                    </button>
                    {ratingFilters.map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${minRating === rating ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {rating}+ Stars
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
                    <option value="price">Price: Low to High</option>
                    <option value="title">Title A-Z</option>
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
          Showing {sortedBooks.length} top rated books
        </div>

        {/* Books Display */}
        {currentBooks.length === 0 ? (
          <div className="text-center py-16">
            <FaBook className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No books found</h3>
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
                    {book.rank <= 3 && (
                      <div className="flex items-center gap-1">
                        {book.rank === 1 && <FaCrown className="text-yellow-500 text-lg" />}
                        {book.rank === 2 && <FaMedal className="text-gray-400 text-lg" />}
                        {book.rank === 3 && <FaMedal className="text-amber-600 text-lg" />}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      <FaStar className="text-amber-400" /> {book.rating}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">{renderStars(book.rating)}</div>
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
                      <FaThumbsUp size={10} /> {book.reviewCount.toLocaleString()}
                    </span>
                  </div>
                  {book.awards && book.awards.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {book.awards.slice(0, 1).map((award, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                          🏆 {award}
                        </span>
                      ))}
                    </div>
                  )}
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
                        {book.rank <= 3 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${book.rank === 1 ? 'bg-yellow-500' : book.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'} text-white`}>
                            Top {book.rank}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{book.title}</h3>
                      <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>by {book.author}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(book.rating)}
                      <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>({book.reviewCount.toLocaleString()})</span>
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
                  {book.awards && book.awards.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {book.awards.map((award, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                          🏆 {award}
                        </span>
                      ))}
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

        {/* Top Rated Badge Info */}
        <div className={`mt-12 p-6 rounded-xl ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className={`text-2xl ${theme.textColors?.highlight || 'text-yellow-500'}`} />
            <h3 className={`text-lg font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>About Our Top Rated Selection</h3>
          </div>
          <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Our top rated books are determined by a combination of user ratings, review quality, and overall reader satisfaction. 
            Books must have at least 100 reviews to be considered for the top rated list, ensuring authentic feedback from real readers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopRatedPage;