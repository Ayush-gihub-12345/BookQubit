// src/components/auth/UserAvatar.jsx
"use client";

import React from "react";
import { FaUserCircle } from "react-icons/fa";

export const UserAvatar = ({ user, size = "md", isDarkMode, showBadge = false, rankingNumber = null }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const getRankingBadgeStyle = (rank) => {
    if (rank <= 10) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
    if (rank <= 100) return "bg-gradient-to-r from-gray-300 to-gray-400 text-white";
    if (rank <= 1000) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return isDarkMode ? "bg-gradient-to-r from-sky-700 to-sky-800 text-white" : "bg-gradient-to-r from-sky-500 to-sky-600 text-white";
  };

  return (
    <div className="relative">
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || "User"}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-sky-100 to-purple-100 flex items-center justify-center`}>
          <FaUserCircle className={`${size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-8 h-8"} ${isDarkMode ? "text-blue-400" : "text-sky-600"}`} />
        </div>
      )}
      {showBadge && rankingNumber && rankingNumber <= 1000 && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getRankingBadgeStyle(rankingNumber)} flex items-center justify-center text-[10px] font-bold shadow-sm`}>
          {rankingNumber <= 10 ? "🔥" : rankingNumber <= 100 ? "⭐" : "🏆"}
        </div>
      )}
    </div>
  );
};