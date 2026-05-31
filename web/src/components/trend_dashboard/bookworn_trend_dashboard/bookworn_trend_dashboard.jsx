"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { 
  FaTrophy, 
  FaMedal, 
  FaBook, 
  FaClock, 
  FaHeart, 
  FaStar, 
  FaFire,
  FaUserGraduate,
  FaGem,
  FaCrown,
  FaArrowRight,
  FaUsers,
  FaChartLine
} from "react-icons/fa";

const BookwormTrendDashboard = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const [bookworms, setBookworms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const topBookworms = [
    {
      id: 1,
      name: "Sachin Chakrawarti",
      avatar: "https://i.pinimg.com/1200x/70/a6/d3/70a6d3030900b5e209e15e6077bde3e0.jpg",
      booksRead: 247,
      readingTime: "1,284 hours",
      favoriteGenre: "Fantasy",
      badges: ["Top Reader", "Speed Reader", "Review Master", "Legendary"],
      impact: 1523,
      level: "Diamond",
      streak: 156,
      contributions: 342
    },
    {
      id: 2,
      name: "Shraddha Kapoor",
      avatar: "https://i.pinimg.com/736x/a3/c2/de/a3c2de268d38b8e92c92efef4c64e31b.jpg",
      booksRead: 198,
      readingTime: "982 hours",
      favoriteGenre: "Science Fiction",
      badges: ["Review Master", "Genre Expert", "Elite"],
      impact: 1234,
      level: "Platinum",
      streak: 98,
      contributions: 267
    },
    {
      id: 3,
      name: "Priyal Shrivastava",
      avatar: "https://i.pinimg.com/1200x/83/f2/76/83f276814edfe54b4a1345ce3ab0e869.jpg",
      booksRead: 176,
      readingTime: "876 hours",
      favoriteGenre: "Classics",
      badges: ["Influencer", "Book Club Leader", "Gold"],
      impact: 987,
      level: "Gold",
      streak: 72,
      contributions: 198
    },
 
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setBookworms(topBookworms);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPrimaryGradient = () => {
    return theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-indigo-600';
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <FaCrown className="text-yellow-500" />;
      case 2: return <FaMedal className="text-gray-400" />;
      case 3: return <FaMedal className="text-amber-600" />;
      default: return <FaStar className="text-sky-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'diamond': return 'from-cyan-500 to-blue-500';
      case 'platinum': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-amber-500 to-yellow-500';
      case 'silver': return 'from-gray-300 to-gray-400';
      case 'bronze': return 'from-amber-600 to-orange-600';
      default: return 'from-sky-500 to-indigo-500';
    }
  };

  const formatNumber = (num) => {
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
          {t("trend.loading_bookworms") || "Loading top bookworms..."}
        </p>
      </div>
    );
  }

  return (
    <div className="bookworm-trend-dashboard" style={{ fontFamily: currentFont?.family }}>
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-8 pb-4">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className={`relative w-20 h-20 rounded-full ${getPrimaryGradient()} flex items-center justify-center shadow-2xl`}>
            <FaUsers className="text-white text-3xl" />
          </div>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} flex items-center gap-2`}>
          🐛 {t("trend.top_bookworms") || "Top Bookworms"}
        </h2>
        <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mt-2 max-w-2xl`}>
          {t("trend.bookworms_subtitle") || "Most active and influential readers in our community"}
        </p>
        <div className="flex justify-center mt-4">
          <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"></div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Readers", value: "12.4K", icon: <FaUsers />, color: "from-blue-500 to-cyan-500" },
          { label: "Books Read", value: "48.2K", icon: <FaBook />, color: "from-emerald-500 to-teal-500" },
          { label: "Total Impact", value: "156K", icon: <FaFire />, color: "from-red-500 to-orange-500" },
          { label: "Active Streak", value: "2.3K", icon: <FaChartLine />, color: "from-purple-500 to-pink-500" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${theme.background?.card || 'bg-white/80 dark:bg-gray-800/80'} backdrop-blur-sm rounded-2xl p-4 border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
              {stat.icon}
            </div>
            <h3 className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
              {stat.value}
            </h3>
            <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Bookworms List */}
      <div className="grid grid-cols-1 gap-5">
        {bookworms.map((bookworm) => (
          <div
            key={bookworm.id}
            className={`group relative ${theme.background?.card || 'bg-white dark:bg-gray-800'} rounded-2xl overflow-hidden border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}
            onMouseEnter={() => setHoveredId(bookworm.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Rank Badge */}
            <div className={`absolute top-4 left-4 z-10 w-12 h-12 rounded-xl bg-gradient-to-r ${getLevelColor(bookworm.level)} flex flex-col items-center justify-center text-white shadow-lg transform transition-transform group-hover:scale-110`}>
              <span className="text-lg font-bold">{bookworm.id}</span>
              <span className="text-[10px] opacity-90">{bookworm.level}</span>
            </div>

            {/* Rank Icon */}
            <div className="absolute top-4 right-4 z-10 text-2xl">
              {getRankIcon(bookworm.id)}
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-5">
                <div className="relative">
                  <img 
                    src={bookworm.avatar} 
                    alt={bookworm.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-sky-500 shadow-lg transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/96x96?text=User";
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-sky-500 rounded-full p-1.5 border-2 border-white dark:border-gray-800">
                    <FaBook size={12} className="text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className={`text-xl sm:text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2 flex items-center gap-2 flex-wrap`}>
                    {bookworm.name}
                    {bookworm.id === 1 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold">
                        <FaCrown size={10} />
                        Top Reader
                      </span>
                    )}
                  </h3>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {bookworm.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}
                      >
                        <FaStar size={10} className="text-amber-500" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                  <FaFire size={16} />
                  <div className="text-center">
                    <div className="text-xl font-bold">{bookworm.streak}</div>
                    <div className="text-[10px] opacity-90">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <FaBook size={18} />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {bookworm.booksRead}
                    </div>
                    <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                      Books Read
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <FaClock size={18} />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {bookworm.readingTime}
                    </div>
                    <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                      Reading Time
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <FaHeart size={18} />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {bookworm.favoriteGenre}
                    </div>
                    <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                      Favorite Genre
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <FaGem size={18} />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {formatNumber(bookworm.impact)}
                    </div>
                    <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                      Impact Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributions Section */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUserGraduate className="text-sky-500" />
                    <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                      Community Contributions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {bookworm.contributions}
                    </span>
                    <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                      contributions
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getPrimaryGradient()} transition-all duration-1000`}
                    style={{ width: `${Math.min((bookworm.contributions / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* View Profile Button - Visible on Hover */}
              <div className={`mt-5 transition-all duration-300 overflow-hidden ${hoveredId === bookworm.id ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm ${getPrimaryGradient()} text-white shadow-md hover:shadow-lg transition-all hover:scale-105`}>
                  <span>View Full Profile</span>
                  <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Hover Glow Effect */}
            {hoveredId === bookworm.id && (
              <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-sky-500/50 ring-offset-2 dark:ring-offset-gray-800 transition-all duration-300"></div>
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-8">
        <button className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-700 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300`}>
          <FaUsers size={14} />
          <span>View All Bookworms</span>
          <FaArrowRight size={12} />
        </button>
      </div>

      <style jsx="true">{`
        .bookworm-trend-dashboard {
          border-radius: 1rem;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (max-width: 640px) {
          .bookworm-trend-dashboard {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BookwormTrendDashboard;