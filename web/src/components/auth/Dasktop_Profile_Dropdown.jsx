// In UserDropDown.jsx, update the import and conditional rendering
"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import MobileProfile from "@/components/auth/Mobile_Profile"; // Add this import
import {
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
  FaTachometerAlt,
  FaBookReader,
  FaChevronDown,
  FaCrown,
  FaStar,
  FaTrophy,
  FaMedal,
  FaFire,
} from "react-icons/fa";

export default function UserDropDown({ user }) {
  const [open, setOpen] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [rankingNumber, setRankingNumber] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { theme, themeName } = useTheme();

  if (!user) return null;

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Generate random ranking and ranking number on component mount
  useEffect(() => {
    const rankings = [
      {
        rank: "Bookworm Novice",
        icon: <FaStar />,
        color:
          theme.textColors?.highlight ||
          (isDarkMode ? "text-amber-400" : "text-amber-500"),
        bgColor:
          theme.background?.navigationDots ||
          (isDarkMode ? "bg-amber-900/30" : "bg-amber-50"),
        borderColor:
          theme.border?.default ||
          (isDarkMode ? "border-amber-800" : "border-amber-200"),
      },
      {
        rank: "Page Turner",
        icon: <FaStar />,
        color:
          theme.textColors?.highlight ||
          (isDarkMode ? "text-amber-300" : "text-amber-400"),
        bgColor:
          theme.background?.navigationDots ||
          (isDarkMode ? "bg-amber-900/30" : "bg-amber-50"),
        borderColor:
          theme.border?.default ||
          (isDarkMode ? "border-amber-800" : "border-amber-200"),
      },
      {
        rank: "Story Devourer",
        icon: <FaBookReader />,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: isDarkMode ? "bg-emerald-900/30" : "bg-emerald-50",
        borderColor: isDarkMode ? "border-emerald-800" : "border-emerald-200",
      },
      {
        rank: "Literary Sage",
        icon: <FaCrown />,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: isDarkMode ? "bg-purple-900/30" : "bg-purple-50",
        borderColor: isDarkMode ? "border-purple-800" : "border-purple-200",
      },
      {
        rank: "Chapter Conqueror",
        icon: <FaTrophy />,
        color: "text-rose-600 dark:text-rose-400",
        bgColor: isDarkMode ? "bg-rose-900/30" : "bg-rose-50",
        borderColor: isDarkMode ? "border-rose-800" : "border-rose-200",
      },
      {
        rank: "Bibliophile Elite",
        icon: <FaMedal />,
        color: "text-sky-600 dark:text-sky-400",
        bgColor: isDarkMode ? "bg-sky-900/30" : "bg-sky-50",
        borderColor: isDarkMode ? "border-sky-800" : "border-sky-200",
      },
      {
        rank: "Wordsmith Master",
        icon: <FaCrown />,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: isDarkMode ? "bg-yellow-900/30" : "bg-yellow-50",
        borderColor: isDarkMode ? "border-yellow-800" : "border-yellow-200",
      },
      {
        rank: "Reading Legend",
        icon: <FaFire />,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: isDarkMode ? "bg-orange-900/30" : "bg-orange-50",
        borderColor: isDarkMode ? "border-orange-800" : "border-orange-200",
      },
    ];

    const randomRank = rankings[Math.floor(Math.random() * rankings.length)];
    setUserRank(randomRank);
    const randomRankNumber = Math.floor(Math.random() * 10000) + 1;
    setRankingNumber(randomRankNumber);
  }, [isDarkMode, theme]);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigate = (path) => {
    setOpen(false);
    router.push(path);
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

  // Desktop button (with dropdown)
  const DesktopButton = () => (
    <button
      onClick={() => setOpen(!open)}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-xl
        ${
          isDarkMode
            ? `${theme.background?.navigationDots || "bg-gray-800"} border ${theme.border?.default || "border-gray-700"} hover:border-gray-600`
            : `${theme.background?.navigationDots || "bg-white"} border ${theme.border?.default || "border-sky-200"} hover:border-sky-300`
        }
        border shadow-md transition-all duration-300
        hover:shadow-lg hover:scale-[1.02]
        active:scale-[0.98] relative
      `}
    >
      <div className="relative">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full ${theme.background?.bookCoverSide || "bg-gradient-to-br from-sky-100 to-purple-100"} flex items-center justify-center`}
          >
            <FaUserCircle
              className={`w-6 h-6 ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}
            />
          </div>
        )}
      </div>

      <div className="text-left hidden sm:block">
        <span
          className={`block text-sm font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-gray-200" : "text-gray-800")} leading-tight`}
        >
          {displayName}
        </span>
        {userRank && (
          <span
            className={`flex items-center gap-1 text-xs ${userRank.color} font-medium`}
          >
            {userRank.icon}
            <span className="truncate max-w-[100px]">{userRank.rank}</span>
          </span>
        )}
      </div>

      {rankingNumber && rankingNumber <= 1000 && (
        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getRankingBadgeStyle(rankingNumber)} flex items-center justify-center text-[10px] font-bold shadow-sm`}
        >
          {rankingNumber <= 10 ? "🔥" : rankingNumber <= 100 ? "⭐" : "🏆"}
        </div>
      )}

      <FaChevronDown
        className={`
          w-3 h-3 transition-transform duration-300 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} hidden sm:block
          ${open ? "rotate-180" : ""}
        `}
      />
    </button>
  );

  // For mobile: use MobileProfile component
  if (isMobile) {
    return <MobileProfile user={user} />;
  }

  // Desktop: render dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <DesktopButton />

      {open && (
        <div
          className={`
            absolute right-0 mt-2 w-72 
            ${theme.background?.section || (isDarkMode ? "bg-gray-800/95" : "bg-white/95")} backdrop-blur-sm
            border ${theme.border?.default || (isDarkMode ? "border-gray-700" : "border-sky-200/50")} 
            shadow-xl ${isDarkMode ? "shadow-gray-900/50" : "shadow-sky-100/50"} 
            z-50 rounded-xl overflow-hidden
          `}
        >
          {/* Desktop dropdown content - same as before */}
          <div
            className={`${userRank?.bgColor || (isDarkMode ? "bg-gray-800" : "bg-gradient-to-r from-sky-50 to-purple-50")} px-4 py-3 border-b ${userRank?.borderColor || (isDarkMode ? "border-gray-700" : "border-sky-100")}`}
          >
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full ${theme.background?.bookCoverSide || "bg-gradient-to-br from-sky-100 to-purple-100"} flex items-center justify-center`}
                >
                  <FaUserCircle
                    className={`w-10 h-10 ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")} truncate`}
                >
                  {displayName}
                </p>
                <p
                  className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} truncate`}
                >
                  {userEmail}
                </p>
                {userRank && (
                  <div
                    className={`flex items-center gap-2 mt-1 ${userRank.color}`}
                  >
                    {userRank.icon}
                    <span className="text-xs font-semibold">
                      {userRank.rank}
                    </span>
                  </div>
                )}
              </div>
              {rankingNumber && (
                <div className="flex flex-col items-center">
                  <div
                    className={`px-2 py-1 rounded-lg ${getRankingBadgeStyle(rankingNumber)} text-xs font-bold`}
                  >
                    #{formatRankingNumber(rankingNumber)}
                  </div>
                  <span
                    className={`text-[10px] ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-1`}
                  >
                    Global Rank
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="py-1">
            {[
              {
                label: "Profile",
                path: "/profile",
                icon: (
                  <FaUser
                    className={
                      theme.textColors?.highlight ||
                      (isDarkMode ? "text-blue-400" : "text-sky-600")
                    }
                  />
                ),
                description: "View and edit your profile",
              },
              {
                label: "Dashboard",
                path: "/user-dashboard",
                icon: <FaTachometerAlt className="text-emerald-500" />,
                description: "Your reading dashboard",
              },
              {
                label: "Bookworm Leaderboard",
                path: "/bookworm-leaderboard",
                icon: <FaBookReader className="text-amber-500" />,
                description: rankingNumber
                  ? `Rank #${formatRankingNumber(rankingNumber)} worldwide`
                  : "See your reading rank",
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full text-left px-4 py-3 flex items-start gap-3
                  hover:bg-gradient-to-r ${isDarkMode ? "hover:from-gray-700/50" : "hover:from-sky-50/50"} hover:to-transparent 
                  transition-all duration-200 group/item
                  border-b ${isDarkMode ? "border-gray-700" : "border-sky-50"} last:border-b-0
                  hover:pl-5 relative
                `}
              >
                <div
                  className={`mt-1 ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`block font-medium ${theme.textColors?.primary || (isDarkMode ? "text-gray-200" : "text-gray-800")} group-hover/item:text-sky-600 transition-colors`}
                    >
                      {item.label}
                    </span>
                    {item.label === "Bookworm Ranking" && rankingNumber && (
                      <div className="flex items-center gap-1">
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRankingBadgeStyle(rankingNumber)}`}
                        >
                          #{formatRankingNumber(rankingNumber)}
                        </div>
                        {rankingNumber <= 100 && (
                          <FaCrown className="text-yellow-500 text-xs" />
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-0.5 block`}
                  >
                    {item.description}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {rankingNumber && (
            <div
              className={`px-4 py-2 border-t ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-sky-100 bg-gray-50"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")}`}
                >
                  Ranking Progress
                </span>
                <span
                  className={`text-xs font-semibold ${theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600")}`}
                >
                  Top {Math.round((rankingNumber / 10000) * 100)}%
                </span>
              </div>
              <div
                className={`w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-1.5`}
              >
                <div
                  className={`h-1.5 rounded-full ${rankingNumber <= 1000 ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-sky-400 to-blue-500"}`}
                  style={{
                    width: `${Math.max(5, (1 - rankingNumber / 10000) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div
            className={`relative px-3 py-2 border-t ${theme.border?.default || (isDarkMode ? "border-gray-700" : "border-sky-100")}`}
          >
            <button
              onClick={handleLogout}
              className={`
              w-full text-left px-4 py-2.5 flex items-center gap-2 
              text-rose-600 hover:text-rose-700 hover:bg-gradient-to-r 
              ${isDarkMode ? "hover:from-rose-900/30" : "hover:from-rose-50/50"} hover:to-transparent transition-all duration-200
              rounded-lg group/logout font-medium
            `}
            >
              <FaSignOutAlt className="group-hover/logout:translate-x-1 transition-transform" />
              Logout
              <span
                className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} ml-auto`}
              >
                ({displayName})
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
