// d:/Projects/done/bookqubit_done/web/src/components/searchbar/searchbar_desktop/components/SearchSuggestionItem.jsx
"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { FaArrowRight, FaBook, FaSearch } from "react-icons/fa";

const SearchSuggestionItem = ({ suggestion, index, isSelected, onClick, isDarkMode: propIsDarkMode }) => {
  const { theme, themeName } = useTheme();
  
  const isDarkMode = propIsDarkMode !== undefined 
    ? propIsDarkMode 
    : (themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk");

  // Determine if it's a search term suggestion or a book suggestion
  const isSearchTerm = suggestion.type === "search" || !suggestion.id;
  const displayText = suggestion.title || suggestion.query || suggestion;
  const displayAuthor = suggestion.author;
  const displayImage = suggestion.imageUrl;

  const handleClick = () => {
    if (onClick) {
      onClick(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      data-index={index}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      className={`
        dropdown-item group flex items-center gap-3 px-4 py-3 cursor-pointer
        transition-all duration-200 ease-out
        ${isSelected 
          ? `bg-gradient-to-r ${isDarkMode ? 'from-gray-700/50 to-gray-700/30' : 'from-gray-50 to-transparent'}`
          : 'hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent dark:hover:from-gray-800/50'
        }
        ${isSelected ? 'border-l-4 border-sky-500' : 'border-l-4 border-transparent'}
      `}
    >
      {/* Icon or Image */}
      <div className="flex-shrink-0">
        {displayImage ? (
          <div className="relative w-10 h-14 rounded-md overflow-hidden shadow-sm">
            <img
              src={displayImage}
              alt={displayText}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-book-small.jpg';
              }}
            />
          </div>
        ) : (
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            transition-all duration-200
            ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
            ${isSelected 
              ? 'text-sky-500 scale-110' 
              : `text-gray-400 group-hover:text-sky-500 group-hover:scale-110`
            }
          `}>
            {isSearchTerm ? (
              <FaSearch className="w-4 h-4" />
            ) : (
              <FaBook className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`
              item-title text-sm font-medium truncate
              transition-colors duration-200
              ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
              ${isSelected ? theme.textColors?.highlight || "text-sky-600" : ""}
            `}
          >
            {displayText}
          </span>
          
          {/* Type badge for search terms */}
          {isSearchTerm && (
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full
              ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
            `}>
              {suggestion.type === "search" ? "Search" : "Quick Search"}
            </span>
          )}
        </div>

        {/* Author - only for book suggestions */}
        {displayAuthor && (
          <span
            className={`
              item-author text-xs block mt-0.5
              ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")}
              ${isSelected ? 'opacity-80' : 'group-hover:opacity-90'}
              transition-opacity duration-200
            `}
          >
            {displayAuthor}
          </span>
        )}

        {/* Category or additional info */}
        {suggestion.category && !displayAuthor && (
          <span
            className={`
              item-category text-xs block mt-0.5
              ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")}
            `}
          >
            {suggestion.category}
          </span>
        )}
      </div>

      {/* Arrow Icon */}
      <div className={`
        flex-shrink-0 transition-all duration-200
        ${isSelected 
          ? 'translate-x-1 opacity-100' 
          : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
        }
      `}>
        <FaArrowRight
          className={`
            w-3.5 h-3.5
            ${isSelected 
              ? theme.textColors?.highlight || "text-sky-600" 
              : theme.textColors?.secondary || "text-gray-400"
            }
          `}
        />
      </div>

      {/* Selected indicator dot */}
      {isSelected && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
      )}
    </div>
  );
};

export default SearchSuggestionItem;