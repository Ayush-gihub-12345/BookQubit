import React from "react";

const FilterChips = ({
  searchTerm,
  selectedCollections,
  setSearchTerm,
  handleCollectionToggle,
  theme,
  isDarkMode,
  t,
}) => {
  if (!searchTerm && selectedCollections.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <span
        className={`text-sm ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
      >
        {t("collections.active_filters") || "Active filters:"}
      </span>
      {searchTerm && (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
        >
          {t("collections.search") || "Search"}: "{searchTerm}"
          <button
            onClick={() => setSearchTerm("")}
            className="ml-2 hover:text-red-500"
          >
            ✕
          </button>
        </span>
      )}
      {selectedCollections.map((collection) => (
        <span
          key={collection}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
        >
          {collection}
          <button
            onClick={() => handleCollectionToggle(collection)}
            className="ml-2 hover:text-red-500"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
};

export default FilterChips;