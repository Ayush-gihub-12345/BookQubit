// src/components/auth/Mobile_Profile.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import {
  FaUserCircle,
  FaStar,
  FaBookReader,
  FaCrown,
  FaTrophy,
  FaMedal,
  FaFire,
  FaSignOutAlt,
} from "react-icons/fa";

export default function MobileProfile({ user }) {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const [userRank, setUserRank] = useState(null);
  const [rankingNumber, setRankingNumber] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Generate random ranking and ranking number on component mount
  useEffect(() => {
    const rankings = [
      {
        rank: "Bookworm Novice",
        icon: <FaStar />,
        color: theme.textColors?.highlight || (isDarkMode ? "text-amber-400" : "text-amber-500"),
      },
      {
        rank: "Page Turner",
        icon: <FaStar />,
        color: theme.textColors?.highlight || (isDarkMode ? "text-amber-300" : "text-amber-400"),
      },
      {
        rank: "Story Devourer",
        icon: <FaBookReader />,
        color: "text-emerald-600 dark:text-emerald-400",
      },
      {
        rank: "Literary Sage",
        icon: <FaCrown />,
        color: "text-purple-600 dark:text-purple-400",
      },
      {
        rank: "Chapter Conqueror",
        icon: <FaTrophy />,
        color: "text-rose-600 dark:text-rose-400",
      },
      {
        rank: "Bibliophile Elite",
        icon: <FaMedal />,
        color: "text-sky-600 dark:text-sky-400",
      },
      {
        rank: "Wordsmith Master",
        icon: <FaCrown />,
        color: "text-yellow-600 dark:text-yellow-400",
      },
      {
        rank: "Reading Legend",
        icon: <FaFire />,
        color: "text-orange-600 dark:text-orange-400",
      },
    ];

    const randomRank = rankings[Math.floor(Math.random() * rankings.length)];
    setUserRank(randomRank);

    // Generate a random ranking number between 1 and 10000
    const randomRankNumber = Math.floor(Math.random() * 10000) + 1;
    setRankingNumber(randomRankNumber);
  }, [isDarkMode, theme]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigate to profile page
  const handleProfileClick = () => {
    setShowMenu(false);
    router.push("/auth/profile");
  };

  // Navigate to dashboard
  const handleDashboardClick = () => {
    setShowMenu(false);
    router.push("/auth/userdashboard");
  };

  // Navigate to ranking
  const handleRankingClick = () => {
    setShowMenu(false);
    router.push("/auth/bookwormranking");
  };

  // Format ranking number with commas
  const formatRankingNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get ranking badge style based on position
  const getRankingBadgeStyle = (rank) => {
    if (rank <= 10)
      return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
    if (rank <= 100)
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-white";
    if (rank <= 1000)
      return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return isDarkMode
      ? "bg-gradient-to-r from-sky-700 to-sky-800 text-white"
      : "bg-gradient-to-r from-sky-500 to-sky-600 text-white";
  };

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const userEmail = user.email;

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`
          group flex items-center justify-center
          w-10 h-10 rounded-full
          ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-white")}
          border ${theme.border?.button || (isDarkMode ? "border-gray-600" : "border-gray-300")}
          shadow-md transition-all duration-300
          hover:shadow-lg hover:scale-[1.05]
          active:scale-[0.98] relative
        `}
        aria-label="User menu"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border-2 border-white"
          />
        ) : (
          <FaUserCircle
            className={`w-6 h-6 ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}
          />
        )}

        {/* Ranking Badge */}
        {rankingNumber && rankingNumber <= 1000 && (
          <div
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getRankingBadgeStyle(rankingNumber)} flex items-center justify-center text-[8px] font-bold shadow-sm`}
          >
            {rankingNumber <= 10 ? "🔥" : rankingNumber <= 100 ? "⭐" : "🏆"}
          </div>
        )}
      </button>

      {/* Mobile Menu Modal */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-[1001] animate-slide-up">
            <div
              className={`
                rounded-t-2xl
                ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
                border-t ${theme.border?.default || (isDarkMode ? "border-gray-700" : "border-gray-200")}
                shadow-xl
                max-h-[85vh] overflow-y-auto
              `}
            >
              {/* User Info Header */}
              <div className={`p-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} border-b ${theme.border?.default || (isDarkMode ? "border-gray-700" : "border-gray-200")}`}>
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={displayName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-full ${theme.background?.bookCoverSide || "bg-gradient-to-br from-sky-100 to-purple-100"} flex items-center justify-center`}
                    >
                      <FaUserCircle
                        className={`w-10 h-10 ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`text-base font-bold ${theme.textColors?.primary || (isDarkMode ? "text-gray-200" : "text-gray-800")}`}>
                      {displayName}
                    </p>
                    <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")}`}>
                      {userEmail}
                    </p>
                    {userRank && (
                      <div className={`flex items-center gap-2 mt-1 ${userRank.color}`}>
                        {userRank.icon}
                        <span className="text-xs font-semibold">{userRank.rank}</span>
                      </div>
                    )}
                  </div>
                  {rankingNumber && (
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-lg ${getRankingBadgeStyle(rankingNumber)} text-xs font-bold`}>
                        #{formatRankingNumber(rankingNumber)}
                      </div>
                      <span className={`text-[10px] ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-1 block`}>
                        Global Rank
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* Profile Item */}
                <button
                  onClick={handleProfileClick}
                  className={`
                    w-full text-left px-4 py-4 flex items-start gap-3
                    ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700/50" : "bg-gray-100")}
                    rounded-xl mb-2
                    active:scale-[0.98] transition-all
                  `}
                >
                  <div className={`mt-0.5 ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}>
                    <FaUserCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`block font-medium ${theme.textColors?.primary || (isDarkMode ? "text-gray-200" : "text-gray-800")}`}>
                        Profile
                      </span>
                    </div>
                    <span className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-1 block`}>
                      View and edit your profile
                    </span>
                  </div>
                </button>

                {/* Dashboard Item */}
                <button
                  onClick={handleDashboardClick}
                  className={`
                    w-full text-left px-4 py-4 flex items-start gap-3
                    ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700/50" : "bg-gray-100")}
                    rounded-xl mb-2
                    active:scale-[0.98] transition-all
                  `}
                >
                  <div className="mt-0.5 text-emerald-500">
                    <FaBookReader size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`block font-medium ${theme.textColors?.primary || (isDarkMode ? "text-gray-200" : "text-gray-800")}`}>
                        Dashboard
                      </span>
                    </div>
                    <span className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-1 block`}>
                      Your reading dashboard
                    </span>
                  </div>
                </button>

                {/* Ranking Item */}
                <button
                  onClick={handleRankingClick}
                  className={`
                    w-full text-left px-4 py-4 flex items-start gap-3
                    ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700/50" : "bg-gray-100")}
                    rounded-xl mb-2
                    active:scale-[0.98] transition-all
                  `}
                >
                  <div className="mt-0.5 text-amber-500">
                    <FaTrophy size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`block font-medium ${theme.textColors?.primary || (isDarkMode ? "text-gray-200" : "text-gray-800")}`}>
                        Bookworm Ranking
                      </span>
                      {rankingNumber && (
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${getRankingBadgeStyle(rankingNumber)}`}>
                          #{formatRankingNumber(rankingNumber)}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-1 block`}>
                      {rankingNumber
                        ? `Rank #${formatRankingNumber(rankingNumber)} worldwide`
                        : "See your reading rank"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Logout Button */}
              <div className={`p-4 border-t ${theme.border?.default || (isDarkMode ? "border-gray-700" : "border-gray-200")}`}>
                <button
                  onClick={handleLogout}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:from-rose-600 hover:to-rose-700"
                >
                  <FaSignOutAlt size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}