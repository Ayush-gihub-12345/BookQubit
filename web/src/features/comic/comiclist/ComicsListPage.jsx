"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getComicsByLanguage } from "@/data/comics/index";
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
  const params = useParams();
  const pathname = usePathname();
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();

  // Get language from URL
  const getCurrentLanguage = useCallback(() => {
    try {
      const segments = pathname?.split("/").filter(Boolean);
      const firstSegment = segments?.[0];
      const supportedLanguages = [
        "en",
        "es",
        "fr",
        "de",
        "ja",
        "zh",
        "hi",
        "ar",
        "ur",
        "bn",
        "pt",
        "ru",
        "it",
        "ko",
      ];
      if (firstSegment && supportedLanguages.includes(firstSegment)) {
        return firstSegment;
      }
      return params?.lang || contextLanguage || "en";
    } catch (error) {
      console.error("Error getting language from URL:", error);
      return "en";
    }
  }, [pathname, params?.lang, contextLanguage]);

  const currentLanguage = getCurrentLanguage();

  // State declarations
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPublisher, setSelectedPublisher] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [cardStyle, setCardStyle] = useState("square");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [comicsData, setComicsData] = useState([]);

  // Get comics based on language from URL
  useEffect(() => {
    setIsLoading(true);
    try {
      const data = getComicsByLanguage(currentLanguage);
      setComicsData(data || []);
    } catch (error) {
      console.error("Error loading comics:", error);
      setComicsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Reset filters when language changes
  useEffect(() => {
    setSelectedCategory("All");
    setSelectedPublisher("All");
    setSearchQuery("");
    setCurrentPage(1);
  }, [currentLanguage]);

  // Extract unique categories and publishers
  const { categories, publishers } = useMemo(() => {
    if (!comicsData || comicsData.length === 0) {
      return { categories: ["All"], publishers: ["All"] };
    }

    const uniqueCategories = [
      "All",
      ...new Set(comicsData.map((comic) => comic?.category).filter(Boolean)),
    ];
    const uniquePublishers = [
      "All",
      ...new Set(comicsData.map((comic) => comic?.publisher).filter(Boolean)),
    ];

    return { categories: uniqueCategories, publishers: uniquePublishers };
  }, [comicsData]);

  // Filter comics based on category, publisher, and search query
  const filteredComics = useMemo(() => {
    if (!comicsData || comicsData.length === 0) return [];

    return comicsData.filter((comic) => {
      if (!comic) return false;

      const categoryMatch =
        selectedCategory === "All" || comic.category === selectedCategory;
      const publisherMatch =
        selectedPublisher === "All" || comic.publisher === selectedPublisher;

      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        searchQuery === "" ||
        comic.title?.toLowerCase().includes(searchLower) ||
        comic.publisher?.toLowerCase().includes(searchLower) ||
        (comic.charactersIntroduced &&
          Array.isArray(comic.charactersIntroduced) &&
          comic.charactersIntroduced.some((char) =>
            char?.toLowerCase().includes(searchLower),
          )) ||
        (comic.description &&
          comic.description.toLowerCase().includes(searchLower)) ||
        (comic.category && comic.category.toLowerCase().includes(searchLower));

      return categoryMatch && publisherMatch && searchMatch;
    });
  }, [comicsData, selectedCategory, selectedPublisher, searchQuery]);

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredComics.length / itemsPerPage),
  );
  const paginatedComics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredComics.length);
    return filteredComics.slice(startIndex, endIndex);
  }, [filteredComics, currentPage, itemsPerPage]);

  // Ensure current page is valid when filtered results change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Handlers
  const handleTagClick = useCallback(
    (tag) => {
      if (categories.includes(tag)) {
        setSelectedCategory(tag);
      } else if (publishers.includes(tag)) {
        setSelectedPublisher(tag);
      }
      setCurrentPage(1);
    },
    [categories, publishers],
  );

  const handleWishlistToggle = useCallback((comicId, isWishlisted) => {
    setWishlist((prev) =>
      isWishlisted ? [...prev, comicId] : prev.filter((id) => id !== comicId),
    );
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("All");
    setSelectedPublisher("All");
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleItemsPerPageChange = useCallback((items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleCardStyleChange = useCallback((style) => {
    setCardStyle(style);
  }, []);

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p
            className={`mt-4 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
          >
            {t("common.loading") || "Loading comics..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen`}
    >
      <div
        className={`${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}
      >
        <div
          className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}
        >
          {/* Language Indicator */}
          <div className="text-right text-xs opacity-50 mb-4">
            <span
              className={
                theme.textColors?.secondary ||
                (isDarkMode ? "text-gray-400" : "text-gray-600")
              }
            >
              {t("common.language") || "Language"}:{" "}
              {currentLanguage.toUpperCase()}
            </span>
          </div>

          <ComicsHeader currentLang={currentLanguage} />

          <ViewControls
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            cardStyle={cardStyle}
            onCardStyleChange={handleCardStyleChange}
            showCardStyle={true}
            currentLang={currentLanguage}
          />

          <SearchBar
            onSearch={handleSearch}
            searchQuery={searchQuery}
            isDarkMode={isDarkMode}
            theme={theme}
            t={t}
          />

          <ActiveFilters
            selectedCategory={selectedCategory}
            selectedPublisher={selectedPublisher}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
            onClearSearch={handleClearSearch}
            t={t}
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
            t={t}
          />

          <ResultsCount
            filteredCount={filteredComics.length}
            totalCount={comicsData?.length || 0}
            searchQuery={searchQuery}
            t={t}
          />

          {filteredComics.length > 0 ? (
            <>
              <ComicsGrid
                comics={paginatedComics}
                viewMode={viewMode}
                cardStyle={cardStyle}
                wishlist={wishlist}
                onWishlistToggle={handleWishlistToggle}
                onTagClick={handleTagClick}
                currentLang={currentLanguage}
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
                t={t}
              />
            </>
          ) : (
            <EmptyState onResetFilters={handleResetFilters} t={t} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComicsListPage;
