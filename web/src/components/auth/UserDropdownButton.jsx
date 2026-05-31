// src/components/auth/UserDropdownButton.jsx
"use client";

import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { UserAvatar } from "./UserAvatar";
import { UserRankBadge } from "./UserRankBadge";

export const UserDropdownButton = ({ user, userRank, rankingNumber, isDarkMode, isOpen, onClick, isMobile }) => {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={`
          group flex items-center justify-center w-10 h-10 rounded-full
          ${isDarkMode ? "bg-gray-800" : "bg-white"}
          border ${isDarkMode ? "border-gray-600" : "border-gray-300"}
          shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.05] active:scale-[0.98] relative
        `}
        aria-label="User menu"
      >
        <UserAvatar user={user} size="sm" isDarkMode={isDarkMode} showBadge rankingNumber={rankingNumber} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-xl
        ${isDarkMode
          ? `bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600`
          : `bg-gradient-to-r from-white to-sky-50 border-sky-200/70 hover:border-sky-300`
        }
        border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] relative
      `}
    >
      <UserAvatar user={user} size="sm" isDarkMode={isDarkMode} showBadge rankingNumber={rankingNumber} />
      
      <div className="text-left hidden sm:block">
        <span className={`block text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"} leading-tight`}>
          {displayName}
        </span>
        {userRank && <UserRankBadge rank={userRank.rank} rankingNumber={rankingNumber} isDarkMode={isDarkMode} />}
      </div>

      <FaChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDarkMode ? "text-gray-400" : "text-gray-500"} hidden sm:block ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
};