"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getBooksByLanguage } from "@/data/books";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import Link from "next/link";
import { 
  FaFire, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaStar, 
  FaChartLine, 
  FaBookOpen,
  FaArrowRight,
  FaTrophy,
  FaLongArrowAltUp,
  FaRegClock
} from "react-icons/fa";

const BookTrendDashboard = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("trending");
  const [hoveredBook, setHoveredBook] = useState(null);

  const booksData = useMemo(() => {
    return getBooksByLanguage(language);
  }, [language]);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const calculateTrendScore = (book) => {
    const views = book.views || book.popularity || Math.floor(Math.random() * 20000) + 5000;
    const likes = book.likes || book.rating ? Math.floor(book.rating * 1000) : Math.floor(Math.random() * 5000) + 500;
    const comments = book.comments || Math.floor(Math.random() * 1000) + 100;
    
    return {
      trendScore: Math.floor((views / 200) + (likes / 10) + (comments / 2)),
      views,
      likes,
      comments,
      growth: `+${Math.floor(Math.random() * 60) + 20}%`,
      growthPercentage: Math.floor(Math.random() * 60) + 20
    };
  };

  const trendingBooks = useMemo(() => {
    if (!booksData || booksData.length === 0) return [];
    
    return booksData.slice(0, 12).map((book, index) => {
      const trendData = calculateTrendScore(book);
      return {
        id: book.id || index + 1,
        title: book.title,
        author: book.author,
        cover: book.imageUrl || book.coverImage || "https://via.placeholder.com/100x150?text=Book+Cover",
        slug: book.slug || book.id,
        rating: book.rating || 4.5,
        category: book.category || "General",
        ...trendData
      };
    });
  }, [booksData]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setBooks(trendingBooks);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [trendingBooks]);

  const getSortedBooks = () => {
    switch (sortBy) {
      case "trending":
        return [...books].sort((a, b) => b.trendScore - a.trendScore);
      case "views":
        return [...books].sort((a, b) => b.views - a.views);
      case "likes":
        return [...books].sort((a, b) => b.likes - a.likes);
      case "rating":
        return [...books].sort((a, b) => b.rating - a.rating);
      default:
        return books;
    }
  };

  const getPrimaryGradient = () => {
    if (theme.buttonColors?.primaryButton?.background) {
      return theme.buttonColors.primaryButton.background;
    }
    return 'bg-gradient-to-r from-sky-600 to-indigo-600';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-amber-500 to-yellow-500";
    if (rank === 2) return "from-gray-400 to-gray-500";
    if (rank === 3) return "from-amber-600 to-orange-600";
    return "from-sky-500 to-indigo-500";
  };

  const getGrowthColor = (percentage) => {
    if (percentage > 50) return "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30";
    if (percentage > 30) return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    return "text-amber-500 bg-amber-100 dark:bg-amber-900/30";
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className={`absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-transparent ${getPrimaryGradient()} animate-spin`}></div>
        </div>
        <p className={`mt-4 ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
          {t("trend.loading_books") || "Loading trending books..."}
        </p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-4">
          <FaBookOpen className="text-4xl text-gray-400" />
        </div>
        <h3 className={`text-xl font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}>
          {t("trend.no_books") || "No books found"}
        </h3>
        <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
          {t("trend.check_back") || "Check back later for trending books"}
        </p>
      </div>
    );
  }

  return (
    <div className="book-trend-dashboard" style={{ fontFamily: currentFont?.family }}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} flex items-center gap-2`}>
            <span className="text-3xl">📚</span>
            {t("trend.trending_books") || "Trending Books"}
          </h2>
          <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mt-1`}>
            Most popular books in the community right now
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <FaChartLine className="text-sky-500" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-xl ${theme.background?.section || 'bg-white dark:bg-gray-900'} ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer text-sm font-medium`}
          >
            <option value="trending">🔥 {t("trend.sort_trending") || "Trending"}</option>
            <option value="views">👁️ {t("trend.sort_views") || "Most Views"}</option>
            <option value="likes">❤️ {t("trend.sort_likes") || "Most Likes"}</option>
            <option value="rating">⭐ {t("trend.sort_rating") || "Top Rated"}</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getSortedBooks().map((book, idx) => (
          <Link href={`/books/${book.slug}`} key={book.id}>
            <div 
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              onMouseEnter={() => setHoveredBook(book.id)}
              onMouseLeave={() => setHoveredBook(null)}
            >
              {/* Rank Badge */}
              <div className={`absolute top-4 left-4 z-10 w-10 h-10 rounded-xl bg-gradient-to-r ${getRankColor(idx + 1)} flex items-center justify-center text-white font-bold text-lg shadow-lg transform transition-transform group-hover:scale-110`}>
                {idx + 1}
              </div>

              {/* Hot Badge for Top 3 */}
              {(idx === 0 || idx === 1 || idx === 2) && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-ping opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-red-500 to-orange-500 rounded-full px-3 py-1 flex items-center gap-1">
                      <FaFire className="text-white text-xs" />
                      <span className="text-white text-xs font-bold">HOT</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Cover */}
              <div className="relative overflow-hidden h-64">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Cover";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Category Tag */}
                {book.category && (
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {book.category}
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="p-5">
                {/* Rating */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-amber-400 text-sm" />
                    <span className={`text-sm font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {book.rating.toFixed(1)}
                    </span>
                    <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                      ({(book.likes / 100).toFixed(0)}+)
                    </span>
                  </div>
                  
                  {/* Growth Indicator */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getGrowthColor(book.growthPercentage)}`}>
                    <FaLongArrowAltUp size={10} />
                    <span>{book.growth}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold mb-1 ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors`}>
                  {book.title}
                </h3>
                
                {/* Author */}
                <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-3`}>
                  by {book.author}
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <FaEye size={12} />
                      <span>{formatNumber(book.views)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <FaHeart size={12} />
                      <span>{formatNumber(book.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <FaComment size={12} />
                      <span>{formatNumber(book.comments)}</span>
                    </div>
                  </div>
                  
                  {/* Trend Score */}
                  <div className="flex items-center gap-1">
                    <FaFire className="text-orange-500 text-xs" />
                    <span className="text-xs font-bold text-orange-500">{book.trendScore}</span>
                  </div>
                </div>

                {/* View Button */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm ${getPrimaryGradient()} text-white shadow-md hover:shadow-lg transition-all`}>
                    <FaBookOpen size={14} />
                    <span>{t("trend.view_details") || "View Details"}</span>
                    <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              {hoveredBook === book.id && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-sky-500/50 ring-offset-2 dark:ring-offset-gray-900 transition-all duration-300"></div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {books.length >= 8 && (
        <div className="text-center mt-10">
          <button className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300`}>
            <FaRegClock size={14} />
            <span>Load More</span>
          </button>
        </div>
      )}

      <style jsx="true">{`
        .book-trend-dashboard {
          border-radius: 1rem;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 640px) {
          .book-trend-dashboard {
            padding: 0;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default BookTrendDashboard;