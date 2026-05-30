// src/components/auth/UserMenuItems.jsx
"use client";

import React from "react";
import { FaUser, FaTachometerAlt, FaBookReader, FaCrown } from "react-icons/fa";

const menuItems = [
  { label: "Profile", path: "/profile", icon: FaUser, description: "View and edit your profile", color: "text-sky-600" },
  { label: "Dashboard", path: "/dashboard", icon: FaTachometerAlt, description: "Your reading dashboard", color: "text-emerald-500" },
  { label: "Bookworm Ranking", path: "/bookworm-ranking", icon: FaBookReader, description: "See your reading rank", color: "text-amber-500" },
];

export const UserMenuItems = ({ onNavigate, rankingNumber, isDarkMode }) => {
  const getRankingBadgeStyle = (rank) => {
    if (rank <= 10) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
    if (rank <= 100) return "bg-gradient-to-r from-gray-300 to-gray-400 text-white";
    if (rank <= 1000) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    return isDarkMode ? "bg-gradient-to-r from-sky-700 to-sky-800 text-white" : "bg-gradient-to-r from-sky-500 to-sky-600 text-white";
  };

  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.path)}
            className={`
              w-full text-left px-4 py-3 flex items-start gap-3
              hover:bg-gradient-to-r ${isDarkMode ? "hover:from-gray-700/50" : "hover:from-sky-50/50"} hover:to-transparent 
              transition-all duration-200 group/item
              border-b ${isDarkMode ? "border-gray-700" : "border-sky-50"} last:border-b-0
              hover:pl-5 relative
            `}
          >
            <div className={`mt-1 ${item.color}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`block font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"} group-hover/item:text-sky-600 transition-colors`}>
                  {item.label}
                </span>
                {item.label === "Bookworm Ranking" && rankingNumber && (
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRankingBadgeStyle(rankingNumber)}`}>
                    #{rankingNumber.toLocaleString()}
                  </div>
                )}
              </div>
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-0.5 block`}>
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </>
  );
};