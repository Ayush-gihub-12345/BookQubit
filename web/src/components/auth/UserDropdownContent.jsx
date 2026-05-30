// src/components/auth/UserDropdownContent.jsx
"use client";

import React from "react";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import { UserAvatar } from "./UserAvatar";
import { UserRankBadge } from "./UserRankBadge";
import { UserMenuItems } from "./UserMenuItems";

export const UserDropdownContent = ({ user, userRank, rankingNumber, isDarkMode, onClose, onNavigate, onLogout, isMobile }) => {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email;

  const getRankingBadgeStyle = (rank) => {
    if (rank <= 10) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
    if (rank <= 100) return "bg-gradient-to-r from-gray-300 to-gray-400 text-white";
    if (rank <= 1000) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return isDarkMode ? "bg-gradient-to-r from-sky-700 to-sky-800 text-white" : "bg-gradient-to-r from-sky-500 to-sky-600 text-white";
  };

  const DropdownContainer = ({ children }) => (
    <div className={`
      absolute right-0 mt-2 w-72 
      ${isDarkMode ? "bg-gray-800/95" : "bg-white/95"} backdrop-blur-sm
      border ${isDarkMode ? "border-gray-700" : "border-sky-200/50"} 
      shadow-xl ${isDarkMode ? "shadow-gray-900/50" : "shadow-sky-100/50"} 
      z-50 rounded-xl overflow-hidden
    `}>
      {children}
    </div>
  );

  const MobileContainer = ({ children }) => (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`
        relative w-full max-w-sm mx-4 rounded-2xl
        ${isDarkMode ? "bg-gray-800" : "bg-white"}
        border ${isDarkMode ? "border-gray-700" : "border-gray-200"}
        shadow-xl animate-slide-up max-h-[80vh] overflow-y-auto
      `}>
        {children}
      </div>
    </div>
  );

  const Header = () => (
    <div className={`sticky top-0 ${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex items-center justify-between`}>
      <h3 className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>Account</h3>
      <button onClick={onClose} className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
        <FaTimes className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
      </button>
    </div>
  );

  const UserInfoSection = () => (
    <div className={`p-4 ${userRank?.bgColor || (isDarkMode ? "bg-gray-800" : "bg-gradient-to-r from-sky-50 to-purple-50")}`}>
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="lg" isDarkMode={isDarkMode} />
        <div className="flex-1">
          <p className={`text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{displayName}</p>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{userEmail}</p>
          {userRank && <UserRankBadge rank={userRank.rank} rankingNumber={rankingNumber} isDarkMode={isDarkMode} />}
        </div>
        {rankingNumber && (
          <div className="flex flex-col items-center">
            <div className={`px-2 py-1 rounded-lg ${getRankingBadgeStyle(rankingNumber)} text-xs font-bold`}>
              #{rankingNumber.toLocaleString()}
            </div>
            <span className={`text-[10px] ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>Global Rank</span>
          </div>
        )}
      </div>

      {rankingNumber && (
        <div className="mt-3 flex items-center justify-between">
          <div className={`px-3 py-1.5 rounded-lg ${getRankingBadgeStyle(rankingNumber)} text-xs font-bold`}>
            #{rankingNumber.toLocaleString()} Global Rank
          </div>
          <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Top {Math.round((rankingNumber / 10000) * 100)}%
          </span>
        </div>
      )}
    </div>
  );

  const RankingProgress = () => (
    <div className={`px-4 py-2 border-t ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-sky-100 bg-gray-50"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Ranking Progress</span>
        <span className={`text-xs font-semibold ${isDarkMode ? "text-blue-400" : "text-sky-600"}`}>
          Top {Math.round((rankingNumber / 10000) * 100)}%
        </span>
      </div>
      <div className={`w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-1.5`}>
        <div className={`h-1.5 rounded-full ${rankingNumber <= 1000 ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-sky-400 to-blue-500"}`}
          style={{ width: `${Math.max(5, (1 - rankingNumber / 10000) * 100)}%` }} />
      </div>
    </div>
  );

  const LogoutButton = () => (
    <div className={`relative px-3 py-2 border-t ${isDarkMode ? "border-gray-700" : "border-sky-100"}`}>
      <div className={`absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent ${isDarkMode ? "via-gray-600" : "via-sky-200"} to-transparent`} />
      <button onClick={onLogout} className={`
        w-full text-left px-4 py-2.5 flex items-center gap-2 text-rose-600 hover:text-rose-700 
        hover:bg-gradient-to-r ${isDarkMode ? "hover:from-rose-900/30" : "hover:from-rose-50/50"} 
        hover:to-transparent transition-all duration-200 rounded-lg group/logout font-medium
      `}>
        <FaSignOutAlt className="group-hover/logout:translate-x-1 transition-transform" />
        Logout
        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} ml-auto`}>({displayName})</span>
      </button>
    </div>
  );

  const Content = () => (
    <>
      <Header />
      <UserInfoSection />
      <div className="py-1">
        <UserMenuItems onNavigate={onNavigate} rankingNumber={rankingNumber} isDarkMode={isDarkMode} />
      </div>
      {rankingNumber && <RankingProgress />}
      <LogoutButton />
    </>
  );

  if (isMobile) {
    return (
      <MobileContainer>
        <Content />
      </MobileContainer>
    );
  }

  return (
    <DropdownContainer>
      <Content />
    </DropdownContainer>
  );
};