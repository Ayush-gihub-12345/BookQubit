"use client";

import React, { useState } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const FilterSection = ({ title, items, selectedItems, toggleItem }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? items : items.slice(0, 5);
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  return (
    <div>
      <h4 className={`font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
        {title}
      </h4>
      <div className="space-y-2">
        {displayedItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <input
              id={`${title}-${index}`}
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => toggleItem(item)}
              className={`
                h-4 w-4 rounded 
                focus:ring-2 focus:ring-sky-500
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
            />
            <label
              htmlFor={`${title}-${index}`}
              className={`ml-2 text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}
            >
              {item || t("filter.unknown") || "Unknown"}
            </label>
          </div>
        ))}
        {items.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`text-xs ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} hover:opacity-80 transition-opacity`}
          >
            {showAll 
              ? (t("filter.show_less") || "Show less") 
              : `${t("filter.show_all") || "Show all"} (${items.length})`}
          </button>
        )}
      </div>
    </div>
  );
};

const BooksFilter = ({
  showFilters,
  resetFilters,
  allTags,
  allAuthors,
  allCategories,
  allCollections,
  allSubjects,
  selectedTags,
  selectedAuthors,
  selectedCategories,
  selectedCollections,
  selectedSubjects,
  toggleFilter,
  setSelectedTags,
  setSelectedAuthors,
  setSelectedCategories,
  setSelectedCollections,
  setSelectedSubjects,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  if (!showFilters) return null;

  return (
    <div
      className={`
        p-4 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        ${theme.shadow?.container || 'shadow-lg'}
        ${theme.background?.card === '#ffffff' ? 'bg-white dark:bg-gray-800' : theme.background?.card || 'bg-white dark:bg-gray-800'}
        rounded-xl
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
          {t("filter.filter_books") || "Filter Books"}
        </h3>
        <button
          onClick={resetFilters}
          className={`text-sm ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} hover:opacity-80 transition-opacity`}
        >
          {t("filter.reset_all") || "Reset All Filters"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Tags Filter */}
        <FilterSection
          title={t("filter.tags") || "Tags"}
          items={allTags}
          selectedItems={selectedTags}
          toggleItem={(tag) => toggleFilter(tag, selectedTags, setSelectedTags)}
        />

        {/* Authors Filter */}
        <FilterSection
          title={t("filter.authors") || "Authors"}
          items={allAuthors}
          selectedItems={selectedAuthors}
          toggleItem={(author) =>
            toggleFilter(author, selectedAuthors, setSelectedAuthors)
          }
        />

        {/* Category Filter */}
        <FilterSection
          title={t("filter.categories") || "Categories"}
          items={allCategories}
          selectedItems={selectedCategories}
          toggleItem={(category) =>
            toggleFilter(category, selectedCategories, setSelectedCategories)
          }
        />

        {/* Collection Filter */}
        <FilterSection
          title={t("filter.collections") || "Collections"}
          items={allCollections}
          selectedItems={selectedCollections}
          toggleItem={(collection) =>
            toggleFilter(
              collection,
              selectedCollections,
              setSelectedCollections,
            )
          }
        />

        {/* Subjects Filter */}
        <FilterSection
          title={t("filter.subjects") || "Subjects"}
          items={allSubjects}
          selectedItems={selectedSubjects}
          toggleItem={(subject) =>
            toggleFilter(subject, selectedSubjects, setSelectedSubjects)
          }
        />
      </div>
    </div>
  );
};

export default BooksFilter;
export { FilterSection };