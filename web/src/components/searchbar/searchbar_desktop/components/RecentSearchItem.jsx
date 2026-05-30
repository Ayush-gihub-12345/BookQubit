// d:/Projects/done/bookqubit_done/web/src/components/searchbar/searchbar_desktop/components/RecentSearchItem.jsx
"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { FaHistory } from "react-icons/fa";

const RecentSearchItem = ({ recent, index, isSelected, onClick }) => {
  const { theme, themeName } = useTheme();
  
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  return (
    <div
      data-index={index}
      onClick={() => onClick(recent)}
      className={`dropdown-item ${isSelected ? "selected" : ""}`}
    >
      <FaHistory
        className={`icon-sm ${theme.textColors?.secondary || "text-gray-400"}`}
      />
      <span
        className={`item-text ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
      >
        {recent}
      </span>
    </div>
  );
};

export default RecentSearchItem;