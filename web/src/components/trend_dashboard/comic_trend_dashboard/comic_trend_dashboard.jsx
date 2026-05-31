"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { ComicsData } from "@/data/comics/ComicsData_English";
import { 
  FaFire, 
  FaStar, 
  FaChartLine, 
  FaBookOpen,
  FaArrowRight,
  FaRegClock,
  FaCalendarAlt,
  FaDollarSign,
  FaUsers,
  FaBolt
} from "react-icons/fa";

const ComicTrendDashboard = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("trending");
  const [hoveredId, setHoveredId] = useState(null);

  const comicsData = useMemo(() => ComicsData || [], [language]);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // ✅ Memoized trend calculation to avoid random regeneration
  const calculateTrendScore = useCallback((comic, index) => {
    // Use deterministic values based on comic data or index to avoid randomness
    const baseSales = comic.sales || 20000 + (index * 3721) % 130000;
    const baseRating = comic.rating || 3.5 + (index * 0.13) % 1.5;
    const basePopularity = comic.popularity || 1 + (index * 7) % 100;
    
    const trendScore = Math.floor((baseSales / 1000) + (baseRating * 10) + (basePopularity / 10));
    const growthPercentage = 20 + (index * 11) % 60;
    
    return {
      trendScore,
      sales: baseSales,
      rating: baseRating,
      growth: `+${growthPercentage}%`,
      growthPercentage,
      readers: 10000 + (index * 1543) % 50000
    };
  }, []);

  const trendingComics = useMemo(() => {
    if (!comicsData || comicsData.length === 0) return [];
    
    return comicsData.slice(0, 10).map((comic, index) => {
      const trendData = calculateTrendScore(comic, index);
      return {
        id: comic.id ?? index + 1,
        title: comic.title ?? "Untitled Comic",
        publisher: comic.publisher ?? "Independent",
        issue: comic.issue ?? `#${comic.id ?? index + 1}`,
        cover: comic.image || comic.cover || "https://via.placeholder.com/100x150?text=Comic+Cover",
        slug: comic.slug ?? comic.id ?? index + 1,
        category: comic.category ?? "Comic",
        publicationDate: comic.publicationDate ?? "2024",
        description: comic.description ?? "An exciting comic book adventure that will keep you on the edge of your seat.",
        ...trendData
      };
    });
  }, [comicsData, calculateTrendScore]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setComics(trendingComics);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [trendingComics]);

  const getSortedComics = useMemo(() => {
    const sorted = [...comics];
    switch (sortBy) {
      case "trending":
        return sorted.sort((a, b) => b.trendScore - a.trendScore);
      case "sales":
        return sorted.sort((a, b) => b.sales - a.sales);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [comics, sortBy]);

  const getPrimaryGradient = () => {
    return theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-indigo-600';
  };

  const getPublisherColor = (publisher) => {
    const pub = (publisher || "Independent").toLowerCase();
    switch (pub) {
      case "marvel comics":
      case "marvel":
        return { bg: "from-red-600 to-red-700", text: "text-red-600", light: "bg-red-100 dark:bg-red-900/30" };
      case "dc comics":
      case "dc":
        return { bg: "from-blue-600 to-blue-700", text: "text-blue-600", light: "bg-blue-100 dark:bg-blue-900/30" };
      case "manga":
        return { bg: "from-orange-500 to-orange-600", text: "text-orange-500", light: "bg-orange-100 dark:bg-orange-900/30" };
      case "raj comics":
        return { bg: "from-amber-500 to-amber-600", text: "text-amber-500", light: "bg-amber-100 dark:bg-amber-900/30" };
      default:
        return { bg: "from-gray-500 to-gray-600", text: "text-gray-500", light: "bg-gray-100 dark:bg-gray-800" };
    }
  };

  const getRankGradient = (rank) => {
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
    if (!num && num !== 0) return "0";
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
          {t("trend.loading_comics") || "Loading trending comics..."}
        </p>
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-4">
          <FaBookOpen className="text-4xl text-gray-400" />
        </div>
        <h3 className={`text-xl font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}>
          {t("trend.no_comics") || "No comics found"}
        </h3>
        <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
          {t("trend.check_back_comics") || "Check back later for trending comics"}
        </p>
      </div>
    );
  }

  return (
    <div className="comic-trend-dashboard" style={{ fontFamily: currentFont?.family }}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} flex items-center gap-2`}>
            <span className="text-3xl">🎬</span>
            {t("trend.trending_comics") || "Trending Comics"}
          </h2>
          <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mt-1`}>
            Most popular comics in the community right now
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
            <option value="sales">💰 {t("trend.sort_sales") || "Top Sales"}</option>
            <option value="rating">⭐ {t("trend.sort_rating") || "Top Rated"}</option>
          </select>
        </div>
      </div>

      {/* Comics Grid */}
      <div className="grid grid-cols-1 gap-6">
        {getSortedComics.map((comic, idx) => {
          const publisherStyle = getPublisherColor(comic.publisher);
          const uniqueKey = comic.id ?? `comic-${idx}`;
          
          return (
            <Link href={`/comics/${comic.slug}`} key={uniqueKey}>
              <div 
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                onMouseEnter={() => setHoveredId(uniqueKey)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Rank Badge */}
                <div className={`absolute top-4 left-4 z-10 w-12 h-12 rounded-xl bg-gradient-to-r ${getRankGradient(idx + 1)} flex items-center justify-center text-white font-bold text-lg shadow-lg transform transition-transform group-hover:scale-110`}>
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

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Cover Image */}
                  <div className="relative flex-shrink-0">
                    <div className="relative overflow-hidden rounded-xl shadow-xl w-32 h-44 md:w-40 md:h-56">
                      <img 
                        src={comic.cover} 
                        alt={comic.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/160x220?text=Comic+Cover";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Issue Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-sky-500 rounded-full px-2 py-1 text-white text-xs font-bold shadow-lg">
                      {comic.issue}
                    </div>
                  </div>

                  {/* Comic Info */}
                  <div className="flex-1">
                    {/* Title and Publisher */}
                    <div className="mb-4">
                      <h3 className={`text-xl sm:text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors`}>
                        {comic.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${publisherStyle.light} ${publisherStyle.text}`}>
                          {comic.publisher}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                          <FaCalendarAlt size={12} />
                          <span>{comic.publicationDate}</span>
                        </div>
                        {comic.category && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs">
                            {comic.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-4 line-clamp-2`}>
                      {comic.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                          <FaFire size={14} />
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                            {comic.trendScore}
                          </div>
                          <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                            Trend Score
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                          <FaDollarSign size={14} />
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                            {formatNumber(comic.sales)}
                          </div>
                          <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                            Sales
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                          <FaStar size={14} />
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                            {(comic.rating ?? 4.5).toFixed(1)}
                          </div>
                          <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                            Rating
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                          <FaUsers size={14} />
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                            {formatNumber(comic.readers)}
                          </div>
                          <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                            Readers
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Growth Indicator */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${getGrowthColor(comic.growthPercentage)}`}>
                      <FaBolt size={12} />
                      <span>{comic.growth} growth this week</span>
                    </div>

                    {/* View Button */}
                    <div className={`mt-4 transition-all duration-300 overflow-hidden ${hoveredId === uniqueKey ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className={`flex items-center justify-center gap-2 w-full md:w-auto md:inline-flex px-6 py-2.5 rounded-xl font-semibold text-sm ${getPrimaryGradient()} text-white shadow-md hover:shadow-lg transition-all hover:scale-105`}>
                        <FaBookOpen size={14} />
                        <span>{t("trend.view_details") || "View Details"}</span>
                        <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                {hoveredId === uniqueKey && (
                  <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-sky-500/50 ring-offset-2 dark:ring-offset-gray-900 transition-all duration-300"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load More Button */}
      {comics.length >= 8 && (
        <div className="text-center mt-10">
          <button className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300`}>
            <FaRegClock size={14} />
            <span>Load More Comics</span>
          </button>
        </div>
      )}

      {/* ✅ Fixed styled-jsx syntax */}
      <style jsx>{`
        .comic-trend-dashboard {
          border-radius: 1rem;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping {
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @media (max-width: 768px) {
          .comic-trend-dashboard {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ComicTrendDashboard;