"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaStar,
  FaFire,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaBook,
  FaArrowRight,
  FaUser,
  FaClock,
  FaTag,
  FaDownload,
  FaEye,
} from "react-icons/fa";

// Sample new releases data
const newReleasesData = [
  {
    id: 1,
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    slug: "fourth-wing",
    coverImage: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=200&h=300&fit=crop",
    description: "Enter the brutal and elite world of a war college for dragon riders in this epic fantasy.",
    rating: 4.9,
    reviews: 15234,
    price: "$17.99",
    originalPrice: "$28.99",
    category: "Fantasy",
    publishedDate: "2024-05-01",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Fantasy", "Romance", "Dragons", "Young Adult"],
    preorder: false,
    releaseCountdown: false,
    isHot: true,
  },
  {
    id: 2,
    title: "The Bee Sting",
    author: "Paul Murray",
    slug: "the-bee-sting",
    coverImage: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?w=200&h=300&fit=crop",
    description: "A tour de force about family, fortune, and the tragicomic fate of the modern Irish family.",
    rating: 4.8,
    reviews: 8765,
    price: "$21.99",
    originalPrice: "$32.99",
    category: "Literary Fiction",
    publishedDate: "2024-05-15",
    format: ["Hardcover", "eBook", "Audiobook", "Paperback"],
    tags: ["Literary Fiction", "Family Saga", "Irish Literature"],
    preorder: false,
    releaseCountdown: false,
    isHot: true,
  },
  {
    id: 3,
    title: "The Woman in Me",
    author: "Britney Spears",
    slug: "the-woman-in-me",
    coverImage: "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?w=200&h=300&fit=crop",
    description: "The long-awaited memoir from the pop icon, revealing her journey to freedom.",
    rating: 4.7,
    reviews: 23456,
    price: "$24.99",
    originalPrice: "$34.99",
    category: "Memoir",
    publishedDate: "2024-05-20",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Memoir", "Celebrity", "Inspirational"],
    preorder: false,
    releaseCountdown: false,
    isHot: true,
  },
  {
    id: 4,
    title: "Emily Wilde's Map of the Otherlands",
    author: "Heather Fawcett",
    slug: "emily-wilde-map-otherlands",
    coverImage: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=200&h=300&fit=crop",
    description: "The enchanting sequel to the international bestseller about a Cambridge professor investigating faerie folklore.",
    rating: 4.8,
    reviews: 5432,
    price: "$18.99",
    originalPrice: "$29.99",
    category: "Fantasy",
    publishedDate: "2024-06-01",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Fantasy", "Historical Fiction", "Romance"],
    preorder: true,
    releaseCountdown: { days: 25, hours: 12, minutes: 30 },
    isHot: false,
  },
  {
    id: 5,
    title: "The Heaven & Earth Grocery Store",
    author: "James McBride",
    slug: "heaven-earth-grocery-store",
    coverImage: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=200&h=300&fit=crop",
    description: "A historical novel about a small-town community and a mystery that unfolds beneath the surface.",
    rating: 4.6,
    reviews: 9876,
    price: "$19.99",
    originalPrice: "$29.99",
    category: "Historical Fiction",
    publishedDate: "2024-06-10",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Historical Fiction", "Mystery", "Community"],
    preorder: true,
    releaseCountdown: { days: 34, hours: 8, minutes: 15 },
    isHot: false,
  },
  {
    id: 6,
    title: "First Lie Wins",
    author: "Ashley Elston",
    slug: "first-lie-wins",
    coverImage: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=200&h=300&fit=crop",
    description: "A thrilling cat-and-mouse game about a woman living under an assumed identity.",
    rating: 4.7,
    reviews: 12345,
    price: "$16.99",
    originalPrice: "$27.99",
    category: "Thriller",
    publishedDate: "2024-05-20",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Thriller", "Mystery", "Suspense"],
    preorder: false,
    releaseCountdown: false,
    isHot: true,
  },
  {
    id: 7,
    title: "House of Flame and Shadow",
    author: "Sarah J. Maas",
    slug: "house-of-flame-shadow",
    coverImage: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?w=200&h=300&fit=crop",
    description: "The epic third installment in the Crescent City series.",
    rating: 4.9,
    reviews: 34567,
    price: "$22.99",
    originalPrice: "$34.99",
    category: "Fantasy",
    publishedDate: "2024-07-15",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Fantasy", "Romance", "Adventure"],
    preorder: true,
    releaseCountdown: { days: 69, hours: 14, minutes: 45 },
    isHot: false,
  },
  {
    id: 8,
    title: "The Fury",
    author: "Alex Michaelides",
    slug: "the-fury",
    coverImage: "https://images.pexels.com/photos/1676991/pexels-photo-1676991.jpeg?w=200&h=300&fit=crop",
    description: "A masterfully paced thriller about a reclusive ex-movie star and her friends.",
    rating: 4.5,
    reviews: 5678,
    price: "$19.99",
    originalPrice: "$29.99",
    category: "Thriller",
    publishedDate: "2025-01-15",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Thriller", "Psychological", "Suspense"],
    preorder: true,
    releaseCountdown: { days: 253, hours: 10, minutes: 20 },
    isHot: false,
  },
  {
    id: 9,
    title: "The Warm Hands of Ghosts",
    author: "Katherine Arden",
    slug: "warm-hands-of-ghosts",
    coverImage: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?w=200&h=300&fit=crop",
    description: "A haunting historical fantasy set during World War I.",
    rating: 4.8,
    reviews: 2345,
    price: "$18.99",
    originalPrice: "$28.99",
    category: "Historical Fantasy",
    publishedDate: "2024-08-15",
    format: ["Hardcover", "eBook", "Audiobook"],
    tags: ["Historical Fantasy", "Historical Fiction", "Supernatural"],
    preorder: true,
    releaseCountdown: { days: 100, hours: 5, minutes: 30 },
    isHot: false,
  },
];

const categories = ["All", "Fantasy", "Literary Fiction", "Memoir", "Historical Fiction", "Thriller", "Historical Fantasy"];
const timeFilters = ["All", "This Week", "This Month", "Next Month", "Preorder Only"];

const NewReleasesPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter books
  const filteredBooks = newReleasesData.filter((book) => {
    const matchesSearch = searchTerm === "" ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    
    let matchesTime = true;
    const now = new Date();
    const pubDate = new Date(book.publishedDate);
    const daysDiff = Math.ceil((pubDate - now) / (1000 * 60 * 60 * 24));
    
    if (selectedTimeFilter === "This Week") {
      matchesTime = daysDiff >= -7 && daysDiff <= 7;
    } else if (selectedTimeFilter === "This Month") {
      matchesTime = daysDiff >= -30 && daysDiff <= 30;
    } else if (selectedTimeFilter === "Next Month") {
      matchesTime = daysDiff > 0 && daysDiff <= 30;
    } else if (selectedTimeFilter === "Preorder Only") {
      matchesTime = book.preorder === true;
    }
    
    return matchesSearch && matchesCategory && matchesTime;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "date") return new Date(b.publishedDate) - new Date(a.publishedDate);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", ""));
    if (sortBy === "popularity") return b.reviews - a.reviews;
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
    setSelectedTimeFilter("All");
    setSortBy("date");
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All" || selectedTimeFilter !== "All";

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isNewRelease = (dateString) => {
    const pubDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now - pubDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaFire className={`text-4xl ${theme.textColors?.highlight || 'text-orange-500'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            New Releases
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover the latest books hitting the shelves
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search new releases..."
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
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Release Time</label>
                  <div className="flex flex-wrap gap-2">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedTimeFilter(filter)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedTimeFilter === filter ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {filter}
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
                    <option value="date">Release Date (Newest)</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popularity">Most Popular</option>
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
          Showing {sortedBooks.length} new releases
        </div>

        {/* Books Display */}
        {currentBooks.length === 0 ? (
          <div className="text-center py-16">
            <FaBook className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No new releases found</h3>
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
                  <div className="absolute top-2 left-2 flex gap-1">
                    {book.preorder ? (
                      <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">Pre-Order</span>
                    ) : isNewRelease(book.publishedDate) && (
                      <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full animate-pulse">New!</span>
                    )}
                    {book.isHot && <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">🔥 Hot</span>}
                  </div>
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
                      <FaCalendarAlt size={10} /> {formatDate(book.publishedDate)}
                    </span>
                    {book.preorder && book.releaseCountdown && (
                      <span className="flex items-center gap-1 text-purple-500">
                        <FaClock size={10} /> Pre-order
                      </span>
                    )}
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
                      {book.preorder ? "Pre-order" : "View Details"}
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
                        {book.preorder ? (
                          <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">Pre-Order</span>
                        ) : isNewRelease(book.publishedDate) && (
                          <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full animate-pulse">New!</span>
                        )}
                        {book.isHot && <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full">🔥 Hot</span>}
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
                        <FaCalendarAlt size={12} /> {formatDate(book.publishedDate)}
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
                        {book.preorder ? "Pre-order Now" : "View Details"}
                      </Link>
                    </div>
                  </div>
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

export default NewReleasesPage;