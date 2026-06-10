"use client";

import React from "react";

const CategoryFilter = ({
  showCategoryFilter,
  setShowCategoryFilter,
  allCategories = [],
  selectedCategories = [],
  handleCategoryToggle,
  searchTerm = "",
  setSearchTerm,
  clearFilters,
  theme,
  themeName,
  t
}) => {
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  
  return (
    <div
      className={`
        mb-12 p-6 
        ${theme?.background?.bookCoverSide || 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'} 
        ${theme?.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        ${theme?.shadow?.book || 'shadow-2xl'} 
        rounded-xl
      `}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <label
          htmlFor="search"
          className={`
            block text-sm font-medium 
            ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} 
            mb-2
          `}
        >
          {t("category.search_categories") || "Search Categories & Books"}
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            placeholder={t("category.search_placeholder") || "Search by category name, title, author, or description..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full px-4 py-3 
              ${theme?.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} 
              ${theme?.border?.button || 'border border-gray-300 dark:border-gray-600'} 
              ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} 
              rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all
            `}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={t("common.clear") || "Clear search"}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          className={`
            flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all 
            ${showCategoryFilter
              ? `${theme?.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white`
              : `${theme?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} ${theme?.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}`
            }
          `}
          aria-expanded={showCategoryFilter}
          aria-label={t("category.toggle_filter") || "Toggle category filter"}
        >
          <span>{t("category.filter_by_categories") || "Filter by Categories"}</span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${showCategoryFilter ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {(searchTerm || selectedCategories.length > 0) && (
          <button
            onClick={clearFilters}
            className={`
              px-4 py-2 text-sm font-medium 
              ${theme?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} 
              ${theme?.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'} 
              ${theme?.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} 
              ${theme?.border?.button || 'border border-gray-300 dark:border-gray-600'} 
              rounded-lg transition-all
            `}
          >
            {t("category.clear_all_filters") || "Clear All Filters"}
          </button>
        )}
      </div>

      {/* Category Filter (Collapsible) */}
      {showCategoryFilter && (
        <div className={`mb-4 p-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg`}>
          <label
            className={`
              block text-sm font-medium 
              ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} 
              mb-3
            `}
          >
            {t("category.select_categories") || "Select Categories to Filter:"}
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-full transition-all 
                  ${selectedCategories.includes(category)
                    ? `${theme?.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white ${theme?.shadow?.button || 'shadow-md'}`
                    : `${theme?.background?.navigationDots || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} ${theme?.border?.button || 'border border-gray-300 dark:border-gray-600'} hover:${theme?.background?.bookCoverSide || 'bg-gray-200 dark:bg-gray-600'}`
                  }
                `}
                aria-pressed={selectedCategories.includes(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(searchTerm || selectedCategories.length > 0) && (
        <div className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <span className={`text-sm ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
            {t("category.active_filters") || "Active filters:"}
          </span>
          {searchTerm && (
            <span className={`
              inline-flex items-center px-3 py-1 rounded-full text-sm 
              ${theme?.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} 
              ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}
            `}>
              {t("category.search") || "Search"}: "{searchTerm}"
              <button 
                onClick={() => setSearchTerm("")} 
                className="ml-2 hover:text-red-500 transition-colors"
                aria-label={t("common.remove") || "Remove search filter"}
              >
                ✕
              </button>
            </span>
          )}
          {selectedCategories.map((category) => (
            <span 
              key={category} 
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm 
                ${theme?.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} 
                ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}
              `}
            >
              {category}
              <button 
                onClick={() => handleCategoryToggle(category)} 
                className="ml-2 hover:text-red-500 transition-colors"
                aria-label={`${t("common.remove") || "Remove"} ${category} ${t("category.filter") || "filter"}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;