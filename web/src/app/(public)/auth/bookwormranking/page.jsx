"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaTrophy,
  FaCrown,
  FaMedal,
  FaStar,
  FaFire,
  FaBookOpen,
  FaUsers,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaSearch,
  FaFilter,
  FaUserGraduate,
  FaAward,
  FaGem,
} from "react-icons/fa";

// Sample ranking data
const generateRankingData = () => {
  const ranks = [
    { rank: 1, name: "Alex Johnson", avatar: "", booksRead: 847, points: 12540, streak: 365, badges: 24, change: "up" },
    { rank: 2, name: "Sarah Williams", avatar: "", booksRead: 723, points: 10890, streak: 312, badges: 22, change: "up" },
    { rank: 3, name: "Michael Chen", avatar: "", booksRead: 698, points: 10470, streak: 298, badges: 21, change: "same" },
    { rank: 4, name: "Emily Rodriguez", avatar: "", booksRead: 654, points: 9810, streak: 267, badges: 19, change: "up" },
    { rank: 5, name: "David Kim", avatar: "", booksRead: 621, points: 9315, streak: 245, badges: 18, change: "down" },
    { rank: 6, name: "Lisa Anderson", avatar: "", booksRead: 598, points: 8970, streak: 234, badges: 17, change: "same" },
    { rank: 7, name: "James Wilson", avatar: "", booksRead: 567, points: 8505, streak: 221, badges: 16, change: "up" },
    { rank: 8, name: "Maria Garcia", avatar: "", booksRead: 543, points: 8145, streak: 209, badges: 15, change: "down" },
    { rank: 9, name: "Robert Taylor", avatar: "", booksRead: 521, points: 7815, streak: 198, badges: 15, change: "same" },
    { rank: 10, name: "Jennifer Lee", avatar: "", booksRead: 498, points: 7470, streak: 187, badges: 14, change: "up" },
    { rank: 11, name: "Thomas Brown", avatar: "", booksRead: 476, points: 7140, streak: 176, badges: 13, change: "down" },
    { rank: 12, name: "Patricia Martinez", avatar: "", booksRead: 454, points: 6810, streak: 165, badges: 13, change: "same" },
    { rank: 13, name: "Christopher Davis", avatar: "", booksRead: 432, points: 6480, streak: 154, badges: 12, change: "up" },
    { rank: 14, name: "Elizabeth White", avatar: "", booksRead: 411, points: 6165, streak: 143, badges: 11, change: "down" },
    { rank: 15, name: "Daniel Harris", avatar: "", booksRead: 398, points: 5970, streak: 132, badges: 11, change: "same" },
  ];
  
  // Add current user at rank 42
  return [
    ...ranks,
    { rank: 42, name: "You", avatar: "", booksRead: 187, points: 2805, streak: 56, badges: 7, change: "up", isCurrentUser: true },
  ];
};

const rankingTiers = [
  { name: "Legendary Reader", minPoints: 10000, icon: <FaCrown />, color: "from-yellow-500 to-amber-500", textColor: "text-yellow-500" },
  { name: "Master Bibliophile", minPoints: 7500, icon: <FaGem />, color: "from-purple-500 to-pink-500", textColor: "text-purple-500" },
  { name: "Elite Bookworm", minPoints: 5000, icon: <FaStar />, color: "from-blue-500 to-cyan-500", textColor: "text-blue-500" },
  { name: "Avid Reader", minPoints: 2500, icon: <FaFire />, color: "from-orange-500 to-red-500", textColor: "text-orange-500" },
  { name: "Book Enthusiast", minPoints: 1000, icon: <FaBookOpen />, color: "from-emerald-500 to-green-500", textColor: "text-emerald-500" },
  { name: "Casual Reader", minPoints: 0, icon: <FaUserGraduate />, color: "from-gray-400 to-gray-500", textColor: "text-gray-500" },
];

const BookwormRankingPage = () => {
  const { theme, themeName } = useTheme();
  const [user, setUser] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rank");
  const [userRank, setUserRank] = useState(null);
  const itemsPerPage = 10;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const data = generateRankingData();
    setRankingData(data);
    const currentUserRank = data.find(r => r.isCurrentUser);
    setUserRank(currentUserRank);
  }, []);

  // Get user's tier
  const getUserTier = (points) => {
    return rankingTiers.find(tier => points >= tier.minPoints) || rankingTiers[rankingTiers.length - 1];
  };

  const userTier = userRank ? getUserTier(userRank.points) : null;

  // Filter and sort data
  const filteredData = rankingData.filter(reader => {
    const matchesSearch = searchTerm === "" || 
      reader.name.toLowerCase().includes(searchTerm.toLowerCase());
    const tier = getUserTier(reader.points);
    const matchesTier = selectedTier === "All" || tier.name === selectedTier;
    return matchesSearch && matchesTier;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "rank") return a.rank - b.rank;
    if (sortBy === "points") return b.points - a.points;
    if (sortBy === "booksRead") return b.booksRead - a.booksRead;
    if (sortBy === "streak") return b.streak - a.streak;
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500" />;
    if (rank === 2) return <FaMedal className="text-gray-400" />;
    if (rank === 3) return <FaMedal className="text-amber-600" />;
    return null;
  };

  const getChangeIcon = (change) => {
    if (change === "up") return <FaArrowUp className="text-green-500 text-xs" />;
    if (change === "down") return <FaArrowDown className="text-red-500 text-xs" />;
    return <FaMinus className="text-gray-500 text-xs" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTier("All");
    setSortBy("rank");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || selectedTier !== "All";

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
            Bookworm Ranking
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            See where you stand among the most passionate readers in our community
          </p>
        </div>

        {/* User Stats Card */}
        {userRank && (
          <div className={`mb-8 p-6 rounded-2xl bg-gradient-to-r ${userTier?.color} text-white shadow-xl`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                  #{userRank.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {userTier?.icon}
                    <h2 className="text-2xl font-bold">{userTier?.name}</h2>
                  </div>
                  <p className="text-white/90 mt-1">Global Ranking #{userRank.rank}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{userRank.points.toLocaleString()}</div>
                  <div className="text-sm text-white/80">Total Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userRank.booksRead}</div>
                  <div className="text-sm text-white/80">Books Read</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userRank.streak}</div>
                  <div className="text-sm text-white/80">Day Streak</div>
                </div>
              </div>
              <Link
                href="/auth/profile"
                className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition backdrop-blur-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
              />
            </div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-48 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              <option value="All">All Tiers</option>
              {rankingTiers.map(tier => (
                <option key={tier.name} value={tier.name}>{tier.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-48 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              <option value="rank">Sort by Rank</option>
              <option value="points">Sort by Points</option>
              <option value="booksRead">Sort by Books Read</option>
              <option value="streak">Sort by Streak</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button onClick={clearFilters} className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-4 text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Showing {currentData.length} of {sortedData.length} readers
        </div>

        {/* Ranking Table */}
        <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden shadow-lg`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Reader</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Points</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Books Read</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Streak</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Badges</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((reader) => {
                  const tier = getUserTier(reader.points);
                  const isCurrentUser = reader.isCurrentUser;
                  
                  return (
                    <tr
                      key={reader.rank}
                      className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${
                        isCurrentUser ? (isDarkMode ? 'bg-sky-900/30' : 'bg-sky-50') : ''
                      } hover:bg-gray-50 dark:hover:bg-gray-700 transition`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(reader.rank)}
                          <span className={`font-bold ${reader.rank <= 3 ? 'text-yellow-500' : ''}`}>#{reader.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tier.color.replace('text-', 'bg-')}/20`}>
                            {tier.icon}
                          </div>
                          <div>
                            <div className={`font-medium ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                              {reader.name}
                              {isCurrentUser && <span className="ml-2 text-xs text-sky-500">(You)</span>}
                            </div>
                            <div className={`text-xs ${tier.textColor}`}>{tier.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{reader.points.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{reader.booksRead}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <FaFire className="text-orange-500 text-xs" />
                          {reader.streak}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <FaAward className="text-amber-500 text-xs" />
                          {reader.badges}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getChangeIcon(reader.change)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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

        {/* How Points Work Section */}
        <div className={`mt-12 p-6 rounded-xl ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
            <FaChartLine /> How Ranking Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className={`font-semibold mb-2 ${theme.textColors?.highlight || 'text-sky-600'}`}>Points System</h4>
              <ul className={`text-sm space-y-1 ${theme.textColors?.secondary || 'text-gray-600'}`}>
                <li>• Read a book: +50 points</li>
                <li>• Write a review: +20 points</li>
                <li>• Daily login: +5 points</li>
                <li>• Reading streak: +10 points/day</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-2 ${theme.textColors?.highlight || 'text-sky-600'}`}>Bonus Points</h4>
              <ul className={`text-sm space-y-1 ${theme.textColors?.secondary || 'text-gray-600'}`}>
                <li>• Finish reading challenge: +100 points</li>
                <li>• Get featured review: +50 points</li>
                <li>• Refer a friend: +200 points</li>
                <li>• Complete profile: +30 points</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-2 ${theme.textColors?.highlight || 'text-sky-600'}`}>Tiers</h4>
              <ul className={`text-sm space-y-1 ${theme.textColors?.secondary || 'text-gray-600'}`}>
                <li>• 10,000+ points: Legendary Reader</li>
                <li>• 7,500+ points: Master Bibliophile</li>
                <li>• 5,000+ points: Elite Bookworm</li>
                <li>• 2,500+ points: Avid Reader</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookwormRankingPage;