"use client";

import React, { useState, useMemo } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useD1Comics } from "@v1/client/content";
import ComicsHeader from "./components/ComicsHeader";
import ViewControls from "./components/ViewControls";
import FilterSection from "./components/FilterSection";
import ActiveFilters from "./components/ActiveFilters";
import ResultsCount from "./components/ResultsCount";
import ComicsGrid from "./components/ComicsGrid";
import EmptyState from "./components/EmptyState";
import SearchBar from "./components/SearchBar";
import Pagination from "./components/Pagination";

const ComicsListPage = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPublisher, setSelectedPublisher] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [cardStyle, setCardStyle] = useState("square");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { data: comicsData, loading } = useD1Comics(language, { limit: 200 });

  if (!theme || !comicsData) {
    return null;
  }

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const { categories, publishers } = useMemo(() => {
    if (!comicsData || comicsData.length === 0) {
      return { categories: ["All"], publishers: ["All"] };
    }
    const uniqueCategories = [
      "All",
      ...new Set(comicsData.map((comic) => comic.category)),
    ];
    const uniquePublishers = [
      "All",
      ...new Set(comicsData.map((comic) => comic.publisher)),
    ];
    return { categories: uniqueCategories, publishers: uniquePublishers };
  }, [comicsData]);

  // Filter comics based on category, publisher, and search query
  const filteredComics = useMemo(() => {
    if (!comicsData || comicsData.length === 0) return [];
    return comicsData.filter((comic) => {
      const categoryMatch =
        selectedCategory === "All" || comic.category === selectedCategory;
      const publisherMatch =
        selectedPublisher === "All" || comic.publisher === selectedPublisher;
      
      // Search match - check title, publisher, characters, category, and description
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = searchQuery === "" || 
        comic.title.toLowerCase().includes(searchLower) ||
        comic.publisher.toLowerCase().includes(searchLower) ||
        (comic.charactersIntroduced && comic.charactersIntroduced.some(char => 
          char.toLowerCase().includes(searchLower)
        )) ||
        (comic.description && comic.description.toLowerCase().includes(searchLower)) ||
        (comic.category && comic.category.toLowerCase().includes(searchLower));
      
      return categoryMatch && publisherMatch && searchMatch;
    });
  }, [comicsData, selectedCategory, selectedPublisher, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredComics.length / itemsPerPage);
  const paginatedComics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredComics.slice(startIndex, endIndex);
  }, [filteredComics, currentPage, itemsPerPage]);

  const handleTagClick = (tag) => {
    if (categories.includes(tag)) {
      setSelectedCategory(tag);
    } else if (publishers.includes(tag)) {
      setSelectedPublisher(tag);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleWishlistToggle = (comicId, isWishlisted) => {
    setWishlist((prev) =>
      isWishlisted ? [...prev, comicId] : prev.filter((id) => id !== comicId)
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedPublisher("All");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen`}
    >
      <div
        className={`${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}
      >
        <div className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}>
          <ComicsHeader />
          
          <ViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            cardStyle={cardStyle}
            onCardStyleChange={setCardStyle}
            showCardStyle={true}
          />

          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch}
            searchQuery={searchQuery}
            isDarkMode={isDarkMode}
            theme={theme}
          />

          <ActiveFilters
            selectedCategory={selectedCategory}
            selectedPublisher={selectedPublisher}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
            onClearSearch={handleClearSearch}
          />

          <FilterSection
            categories={categories}
            publishers={publishers}
            selectedCategory={selectedCategory}
            selectedPublisher={selectedPublisher}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
            onPublisherChange={(publisher) => {
              setSelectedPublisher(publisher);
              setCurrentPage(1);
            }}
          />

          <ResultsCount
            filteredCount={filteredComics.length}
            totalCount={comicsData.length}
            searchQuery={searchQuery}
          />

          {loading ? (
            <div className={`${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} py-12 text-center`}>
              Loading comics...
            </div>
          ) : filteredComics.length > 0 ? (
            <>
              <ComicsGrid
                comics={paginatedComics}
                viewMode={viewMode}
                cardStyle={cardStyle}
                wishlist={wishlist}
                onWishlistToggle={handleWishlistToggle}
                onTagClick={handleTagClick}
              />
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredComics.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                isDarkMode={isDarkMode}
                theme={theme}
              />
            </>
          ) : (
            <EmptyState onResetFilters={handleResetFilters} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicsListPage;
