"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const SearchBar = ({ onSearch, searchQuery: externalQuery, isDarkMode, theme }) => {
  const { t } = useLanguage(); // Get t from hook
  const [localQuery, setLocalQuery] = useState(externalQuery || "");

  useEffect(() => {
    setLocalQuery(externalQuery || "");
  }, [externalQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  const handleClear = () => {
    setLocalQuery("");
    onSearch("");
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t("comic.search_placeholder") || "Search by title, publisher, character, or category..."}
            className={`w-full pl-12 pr-24 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              isDarkMode 
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-sky-500" 
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-sky-500"
            }`}
          />
          
          {/* Action Buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-300 ${
                isDarkMode
                  ? "bg-sky-600 hover:bg-sky-700 text-white"
                  : "bg-sky-500 hover:bg-sky-600 text-white"
              }`}
            >
              {t("comic.search") || "Search"}
            </button>
          </div>
        </div>
      </form>
      
      {/* Search Tips */}
      <div className="text-center mt-2">
        <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
          🔍 {t("comic.search_tip") || "Try searching for 'Spider-Man', 'Marvel', 'Golden Age', or character names"}
        </p>
      </div>
    </div>
  );
};

export default SearchBar;