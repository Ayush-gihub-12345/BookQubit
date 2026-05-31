"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaBookOpen,
  FaHeart,
  FaBookmark,
  FaStar,
  FaClock,
  FaFire,
  FaChartLine,
  FaCalendarAlt,
  FaArrowRight,
  FaEye,
  FaThumbsUp,
  FaComment,
  FaUserFriends,
  FaTrophy,
  FaMedal,
  FaGift,
  FaBell,
  FaCrown,
} from "react-icons/fa";

// Sample dashboard data
const dashboardData = {
  stats: {
    totalBooksRead: 47,
    totalPagesRead: 15234,
    readingStreak: 12,
    totalHours: 342,
    favoriteGenre: "Science Fiction",
    reviewsWritten: 23,
    wishlistCount: 15,
    followingCount: 89,
    followersCount: 156,
    achievements: 8,
    currentRank: "#42",
    rankTitle: "Elite Bookworm",
    points: 2805,
  },
  recentBooks: [
    { id: 1, title: "The Midnight Library", author: "Matt Haig", date: "2024-05-15", rating: 5, image: "" },
    { id: 2, title: "Atomic Habits", author: "James Clear", date: "2024-05-10", rating: 4, image: "" },
    { id: 3, title: "Project Hail Mary", author: "Andy Weir", date: "2024-05-05", rating: 5, image: "" },
    { id: 4, title: "Dune", author: "Frank Herbert", date: "2024-04-28", rating: 5, image: "" },
  ],
  readingActivity: [
    { day: "Mon", books: 3 },
    { day: "Tue", books: 5 },
    { day: "Wed", books: 2 },
    { day: "Thu", books: 7 },
    { day: "Fri", books: 4 },
    { day: "Sat", books: 6 },
    { day: "Sun", books: 3 },
  ],
  upcomingChallenges: [
    { id: 1, name: "Summer Reading Challenge", deadline: "2024-08-31", progress: 45, goal: 10, booksRead: 4 },
    { id: 2, name: "Classic Literature Month", deadline: "2024-06-30", progress: 30, goal: 5, booksRead: 1 },
  ],
  recentActivity: [
    { id: 1, action: "Finished reading", book: "The Midnight Library", date: "2 hours ago", type: "read" },
    { id: 2, action: "Wrote a review", book: "Atomic Habits", date: "1 day ago", type: "review" },
    { id: 3, action: "Added to wishlist", book: "Project Hail Mary", date: "2 days ago", type: "wishlist" },
    { id: 4, action: "Earned badge", badge: "Speed Reader", date: "3 days ago", type: "badge" },
    { id: 5, action: "Started following", user: "Sarah Johnson", date: "4 days ago", type: "follow" },
  ],
  upcomingEvents: [
    { id: 1, name: "Virtual Book Club Meeting", date: "2024-06-01", time: "7:00 PM", participants: 23 },
    { id: 2, name: "Author Q&A Session", date: "2024-06-05", time: "6:00 PM", participants: 156 },
  ],
};

const UserDashboardPage = () => {
  const { theme, themeName } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(dashboardData);

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const readingGoalProgress = (data.stats.totalBooksRead / 52) * 100;
  const maxBooksInWeek = Math.max(...data.readingActivity.map(d => d.books));

  if (loading) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
          <p className={`mt-4 ${theme.textColors?.secondary || 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-2`}>
            Welcome back, {user?.displayName || "Reader"}!
          </h1>
          <p className={`${theme.textColors?.secondary || 'text-gray-600'}`}>
            Here's an overview of your reading journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6 transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <FaBookOpen className="text-3xl text-blue-500" />
              <span className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.totalBooksRead}</span>
            </div>
            <h3 className={`text-sm font-medium ${theme.textColors?.secondary || 'text-gray-500'}`}>Books Read</h3>
            <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-400'}`}>+12 this month</p>
          </div>

          <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6 transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <FaFire className="text-3xl text-orange-500" />
              <span className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.readingStreak}</span>
            </div>
            <h3 className={`text-sm font-medium ${theme.textColors?.secondary || 'text-gray-500'}`}>Day Streak</h3>
            <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-400'}`}>Keep it going! 🔥</p>
          </div>

          <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6 transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <FaClock className="text-3xl text-emerald-500" />
              <span className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.totalHours}</span>
            </div>
            <h3 className={`text-sm font-medium ${theme.textColors?.secondary || 'text-gray-500'}`}>Hours Spent</h3>
            <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-400'}`}>~{Math.round(data.stats.totalHours / data.stats.totalBooksRead)} hrs/book</p>
          </div>

          <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6 transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <FaCrown className="text-3xl text-amber-500" />
              <span className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.currentRank}</span>
            </div>
            <h3 className={`text-sm font-medium ${theme.textColors?.secondary || 'text-gray-500'}`}>Global Rank</h3>
            <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-400'}`}>{data.stats.rankTitle}</p>
          </div>
        </div>

        {/* Reading Goal Progress */}
        <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6 mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>2024 Reading Goal</h3>
            <span className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'}`}>
              {data.stats.totalBooksRead}/52 books
            </span>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
            <div
              className="bg-gradient-to-r from-sky-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(readingGoalProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Books & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Books */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>Recently Read</h3>
                <Link href="/bookslist" className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline flex items-center gap-1`}>
                  View All <FaArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {data.recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <FaBookOpen className="text-gray-500" />
                      </div>
                      <div>
                        <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>{book.title}</p>
                        <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{book.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`w-3 h-3 ${i < book.rating ? 'text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <Link href={`/bookdeatils/${book.id}`} className={`text-xs ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Activity Chart */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Weekly Reading Activity</h3>
              <div className="flex items-end justify-between h-48 gap-2">
                {data.readingActivity.map((day, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div
                      className="bg-gradient-to-t from-sky-500 to-blue-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${(day.books / maxBooksInWeek) * 100}%`, minHeight: day.books > 0 ? '8px' : '0' }}
                    ></div>
                    <div className={`text-xs mt-2 ${theme.textColors?.secondary || 'text-gray-500'}`}>{day.day}</div>
                    <div className={`text-xs font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{day.books}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Recent Activity</h3>
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'read' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                      activity.type === 'review' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                      activity.type === 'badge' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                    }`}>
                      {activity.type === 'read' && <FaBookOpen size={14} />}
                      {activity.type === 'review' && <FaStar size={14} />}
                      {activity.type === 'wishlist' && <FaHeart size={14} />}
                      {activity.type === 'badge' && <FaMedal size={14} />}
                      {activity.type === 'follow' && <FaUserFriends size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${theme.textColors?.primary || 'text-gray-900'}`}>
                        {activity.action} <span className="font-semibold">"{activity.book || activity.badge || activity.user}"</span>
                      </p>
                      <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'} mt-0.5`}>{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Events */}
          <div className="space-y-6">
            {/* Reading Stats */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Reading Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>Total Pages Read</span>
                  <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.totalPagesRead.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>Average Rating Given</span>
                  <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>4.7/5</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>Favorite Genre</span>
                  <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.favoriteGenre}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>Reviews Written</span>
                  <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.reviewsWritten}</span>
                </div>
              </div>
            </div>

            {/* Wishlist & Followers */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-4 text-center`}>
                <FaHeart className="text-2xl text-pink-500 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.wishlistCount}</div>
                <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Wishlist Items</div>
              </div>
              <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-4 text-center`}>
                <FaUserFriends className="text-2xl text-blue-500 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{data.stats.followersCount}</div>
                <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Followers</div>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>Recent Achievements</h3>
                <Link href="/auth/profile?tab=achievements" className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Bookworm", icon: <FaBookOpen />, unlocked: true },
                  { name: "Speed Reader", icon: <FaFire />, unlocked: true },
                  { name: "Review Master", icon: <FaStar />, unlocked: true },
                  { name: "Collector", icon: <FaBookmark />, unlocked: false },
                ].map((badge, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg ${badge.unlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {badge.icon}
                    </div>
                    <span className={`text-sm ${badge.unlocked ? theme.textColors?.primary || 'text-gray-900' : theme.textColors?.secondary || 'text-gray-500'}`}>
                      {badge.name}
                    </span>
                    {!badge.unlocked && <span className="text-xs text-gray-400 ml-auto">Locked</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>Upcoming Events</h3>
                <Link href="/events" className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {data.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>{event.name}</p>
                      <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{event.date} • {event.time}</p>
                      <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-400'} mt-1`}>{event.participants} participants</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Points Summary */}
            <div className={`bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-6 text-white`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm opacity-90">Total Points</span>
                <FaTrophy className="text-yellow-300" />
              </div>
              <div className="text-3xl font-bold mb-2">{data.stats.points.toLocaleString()}</div>
              <div className="text-sm opacity-90 mb-3">{data.stats.rankTitle}</div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span>Next tier: 5,000 points</span>
                <span>{(data.stats.points / 5000 * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;