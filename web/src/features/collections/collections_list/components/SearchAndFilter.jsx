import React from "react";
import FilterChips from "./FilterChips";

const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  selectedCollections,
  showCollectionFilter,
  allCollections,
  handleCollectionToggle,
  clearFilters,
  toggleCollectionFilter,
  theme,
  isDarkMode,
  t,
}) => {
  return (
    <div
      className={`mb-12 p-6 ${theme.background?.bookCoverSide || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} ${theme.shadow?.book || "shadow-2xl"} rounded-xl`}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <label
          htmlFor="search"
          className={`block text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-2`}
        >
          {t("collections.search_collections") || "Search Collections & Books"}
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            placeholder={
              t("collections.search_placeholder") ||
              "Search by collection name, title, author, or description..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.border?.button || "border border-gray-300 dark:border-gray-600"} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Collection Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleCollectionFilter}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            showCollectionFilter
              ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white`
              : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"}`
          }`}
        >
          <span>
            {t("collections.filter_by_collections") || "Filter by Collections"}
          </span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${showCollectionFilter ? "rotate-180" : ""}`}
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

        {(searchTerm || selectedCollections.length > 0) && (
          <button
            onClick={clearFilters}
            className={`px-4 py-2 text-sm font-medium ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} ${theme.border?.button || "border border-gray-300 dark:border-gray-600"} rounded-lg transition-all`}
          >
            {t("collections.clear_all_filters") || "Clear All Filters"}
          </button>
        )}
      </div>

      {/* Collection Filter (Collapsible) */}
      {showCollectionFilter && (
        <div
          className={`mb-4 p-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg`}
        >
          <label
            className={`block text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-3`}
          >
            {t("collections.select_collections") ||
              "Select Collections to Filter:"}
          </label>
          <div className="flex flex-wrap gap-2">
            {allCollections.map((collection) => (
              <button
                key={collection}
                onClick={() => handleCollectionToggle(collection)}
                className={`px-3 py-2 text-sm font-medium rounded-full transition-all ${
                  selectedCollections.includes(collection)
                    ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white ${theme.shadow?.button || "shadow-md"}`
                    : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700" : "bg-gray-100")} ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} ${theme.border?.button || "border border-gray-300 dark:border-gray-600"} hover:${theme.background?.bookCoverSide || "bg-gray-200 dark:bg-gray-600"}`
                }`}
              >
                {collection}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <FilterChips
        searchTerm={searchTerm}
        selectedCollections={selectedCollections}
        setSearchTerm={setSearchTerm}
        handleCollectionToggle={handleCollectionToggle}
        theme={theme}
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

export default SearchAndFilter;