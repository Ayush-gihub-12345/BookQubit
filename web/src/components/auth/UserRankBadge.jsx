// src/components/auth/UserRankBadge.jsx
"use client";

import React from "react";
import { FaStar, FaCrown, FaFire, FaTrophy, FaMedal, FaBookReader } from "react-icons/fa";

const rankConfig = {
  "Bookworm Novice": { icon: <FaStar />, color: "text-amber-500" },
  "Page Turner": { icon: <FaStar />, color: "text-amber-400" },
  "Story Devourer": { icon: <FaBookReader />, color: "text-emerald-600" },
  "Literary Sage": { icon: <FaCrown />, color: "text-purple-600" },
  "Chapter Conqueror": { icon: <FaTrophy />, color: "text-rose-600" },
  "Bibliophile Elite": { icon: <FaMedal />, color: "text-sky-600" },
  "Wordsmith Master": { icon: <FaCrown />, color: "text-yellow-600" },
  "Reading Legend": { icon: <FaFire />, color: "text-orange-600" },
};

export const UserRankBadge = ({ rank, rankingNumber, isDarkMode }) => {
  const config = rankConfig[rank] || rankConfig["Bookworm Novice"];
  
  return (
    <div className="flex items-center gap-2">
      <span className={config.color}>{config.icon}</span>
      <span className="text-xs font-semibold">{rank}</span>
      {rankingNumber && rankingNumber <= 1000 && (
        <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRankingBadgeStyle(rankingNumber, isDarkMode)} ml-2`}>
          #{rankingNumber.toLocaleString()}
        </div>
      )}
    </div>
  );
};

const getRankingBadgeStyle = (rank, isDarkMode) => {
  if (rank <= 10) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
  if (rank <= 100) return "bg-gradient-to-r from-gray-300 to-gray-400 text-white";
  if (rank <= 1000) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
  return isDarkMode ? "bg-gradient-to-r from-sky-700 to-sky-800 text-white" : "bg-gradient-to-r from-sky-500 to-sky-600 text-white";
};