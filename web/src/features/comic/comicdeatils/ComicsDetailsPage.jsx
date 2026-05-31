"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getComicsByLanguage } from "@/data/comics/index";
import { useComicDetails } from "./hooks/useComicDetails";
import { useWishlist } from "./hooks/useWishlist";
import { useRelatedComics } from "./hooks/useRelatedComics";
import ComicHeader from "./components/ComicHeader";
import ComicCover from "./components/ComicCover";
import ComicTabs from "./components/ComicTabs";
import NotFoundState from "./components/NotFoundState";
import RelatedComics from "./components/RelatedComics";
import YouMayAlsoLike from "./components/YouMayAlsoLike";
import RecommendedSection from "./components/RecommendedSection";

const ComicsDetailsPage = ({ initialLanguage }) => {
  const { slug } = useParams();
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use initialLanguage from props if available, otherwise use context language
  const effectiveLanguage = initialLanguage || contextLanguage;
  
  const { comic, loading, error } = useComicDetails(slug, effectiveLanguage);
  const { isWishlisted, toggleWishlist } = useWishlist(comic?.slug);
  
  // Get all comics for recommendations
  const allComics = getComicsByLanguage(effectiveLanguage);
  const { relatedByCategory, relatedByPublisher, relatedByCharacters } = useRelatedComics(comic, allComics);

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className={`mt-4 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !comic) {
    return <NotFoundState />;
  }

  return (
    <div className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen`}>
      <div className={`${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}>
        <div className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}>
          <ComicHeader />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <ComicCover 
                comic={comic} 
                isDarkMode={isDarkMode} 
                theme={theme}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
              />
            </div>

            <div className="lg:col-span-2">
              <ComicTabs 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                comic={comic}
                isDarkMode={isDarkMode}
                theme={theme}
                t={t}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
              />
            </div>
          </div>

          {/* Related Comics Sections */}
          {relatedByCategory.length > 0 && (
            <RelatedComics 
              comics={relatedByCategory}
              currentComicId={comic.id}
              title={t("comic.related_by_category") || `📚 More ${comic.category} Comics`}
              isDarkMode={isDarkMode}
              theme={theme}
              t={t}
            />
          )}

          {relatedByCharacters.length > 0 && (
            <RelatedComics 
              comics={relatedByCharacters}
              currentComicId={comic.id}
              title={t("comic.related_by_characters") || "🦸‍♂️ Comics with Shared Characters"}
              isDarkMode={isDarkMode}
              theme={theme}
              t={t}
            />
          )}

          <YouMayAlsoLike 
            currentComic={comic}
            allComics={allComics}
            isDarkMode={isDarkMode}
            theme={theme}
            t={t}
          />

          {relatedByPublisher.length > 0 && (
            <RecommendedSection 
              title={t("comic.related_by_publisher") || `🏢 More from ${comic.publisher}`}
              comics={relatedByPublisher}
              isDarkMode={isDarkMode}
              theme={theme}
              t={t}
              type="carousel"
            />
          )}

          {/* Divider for visual separation */}
          <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-center text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("comic.recommendation_disclaimer") || "Recommendations based on your reading preferences"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicsDetailsPage;