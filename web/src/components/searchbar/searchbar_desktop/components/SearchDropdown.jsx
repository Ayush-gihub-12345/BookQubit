// d:/Projects/done/bookqubit_done/web/src/components/searchbar/searchbar_desktop/components/SearchDropdown.jsx
"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaHistory, FaSearch, FaTrash } from "react-icons/fa";
import SearchSuggestionItem from "./SearchSuggestionItem";
import RecentSearchItem from "./RecentSearchItem";
import NoResults from "./NoResults";

const SearchDropdown = ({
  query,
  filteredSuggestions,
  recentSearches,
  selectedIndex,
  onSuggestionClick,
  onRecentClick,
  onClearRecent,
  isDarkMode,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dropdownRef = useRef(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const hasSuggestions = filteredSuggestions.length > 0;
  const hasRecent = !query && recentSearches.length > 0;
  const showNoResults = query && !hasSuggestions;

  if (!hasSuggestions && !hasRecent && !showNoResults) return null;

  return (
    <div
      ref={dropdownRef}
      className={`
        search-dropdown absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden
        transition-all duration-200 ease-out origin-top
        animate-in fade-in slide-in-from-top-2
        ${isDarkMode ? "dark" : "light"}
        ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
        ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}
        ${theme.shadow?.container || "shadow-xl"}
        max-h-96 overflow-y-auto z-50
      `}
      ref={dropdownRef}
      role="listbox"
      aria-label={t("search.suggestions") || "Search suggestions"}
    >
      <style jsx>{`
        .search-dropdown {
          scrollbar-width: thin;
          scrollbar-color: ${isDarkMode ? '#4B5563' : '#CBD5E1'} ${isDarkMode ? '#1F2937' : '#F1F5F9'};
        }
        .search-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        .search-dropdown::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#1F2937' : '#F1F5F9'};
          border-radius: 10px;
        }
        .search-dropdown::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#4B5563' : '#CBD5E1'};
          border-radius: 10px;
        }
        .search-dropdown::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#6B7280' : '#94A3B8'};
        }
      `}</style>

      {/* Recent Searches */}
      {hasRecent && (
        <div className="dropdown-section border-b last:border-b-0">
          <div className="section-header px-4 py-3 flex items-center gap-2 sticky top-0 z-10 backdrop-blur-sm"
               style={{
                 background: isDarkMode 
                   ? 'rgba(31, 41, 55, 0.95)' 
                   : 'rgba(255, 255, 255, 0.95)',
                 borderBottom: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
               }}>
            <FaHistory
              className={`icon w-3.5 h-3.5 ${theme.textColors?.secondary || "text-gray-500"}`}
            />
            <span
              className={`section-title text-xs font-medium ${theme.textColors?.secondary || "text-gray-600"}`}
            >
              {t("search.recent") || "Recent Searches"}
            </span>
            <button
              onClick={onClearRecent}
              className="clear-recent ml-auto text-xs flex items-center gap-1 transition-colors hover:text-red-500"
              style={{
                color: theme.textColors?.secondary || (isDarkMode ? "#9CA3AF" : "#6B7280")
              }}
              aria-label={t("search.clear_all") || "Clear all recent searches"}
            >
              <FaTrash className="w-2.5 h-2.5" />
              {t("search.clear") || "Clear"}
            </button>
          </div>
          <div className="section-content">
            {recentSearches.map((recent, index) => (
              <RecentSearchItem
                key={`recent-${index}`}
                recent={recent}
                index={index}
                isSelected={selectedIndex === filteredSuggestions.length + index}
                onClick={onRecentClick}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {hasSuggestions && (
        <div className="dropdown-section border-b last:border-b-0">
          <div className="section-header px-4 py-3 flex items-center gap-2 sticky top-0 z-10 backdrop-blur-sm"
               style={{
                 background: isDarkMode 
                   ? 'rgba(31, 41, 55, 0.95)' 
                   : 'rgba(255, 255, 255, 0.95)',
                 borderBottom: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`
               }}>
            <FaSearch
              className={`icon w-3.5 h-3.5 ${theme.textColors?.secondary || "text-gray-500"}`}
            />
            <span
              className={`section-title text-xs font-medium ${theme.textColors?.secondary || "text-gray-600"}`}
            >
              {t("search.suggestions") || "Suggestions"}
            </span>
          </div>
          <div className="section-content">
            {filteredSuggestions.map((suggestion, index) => (
              <SearchSuggestionItem
                key={suggestion.id || suggestion.title || index}
                suggestion={suggestion}
                index={index}
                isSelected={selectedIndex === index}
                onClick={onSuggestionClick}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && <NoResults query={query} isDarkMode={isDarkMode} />}
    </div>
  );
};

export default SearchDropdown;