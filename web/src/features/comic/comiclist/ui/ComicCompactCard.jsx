"use client";

import React from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { useRTL } from "@/contexts/RTLContext";
import "./ComicCompactCard.css";

const ComicCompactCard = ({
  comic,
  collections = [],
  showCollections = true,
  className = "",
  currentLang: propLang,
}) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();
  const { currentFont } = useFont();
  const { direction, textAlign, flexDirection } = useRTL();

  // Get language from URL
  const getCurrentLanguage = () => {
    if (propLang) return propLang;
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
  };

  const currentLanguage = getCurrentLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Helper function to get collections as array
  const getCollectionsAsArray = (collection) => {
    if (!collection) return [];
    return Array.isArray(collection) ? collection : [collection];
  };

  // Use provided collections or extract from comic
  const comicCollections =
    collections.length > 0
      ? collections
      : getCollectionsAsArray(comic.collection || comic.series);

  // Fallback image
  const fallbackImage = "/placeholder-comic.jpg";

  // Get the correct slug (handle language-specific slugs)
  const getComicSlug = () => {
    if (currentLanguage === "hi" && comic.hindiSlug) return comic.hindiSlug;
    if (currentLanguage === "ur" && comic.urduSlug) return comic.urduSlug;
    if (currentLanguage === "ar" && comic.arabicSlug) return comic.arabicSlug;
    if (currentLanguage === "bn" && comic.bengaliSlug) return comic.bengaliSlug;
    return comic.slug || comic.id;
  };

  const comicSlug = getComicSlug();

  // Handle card click - navigate to comic details with language
  const handleCardClick = () => {
    router.push(`/${currentLanguage}/comics/${comicSlug}`);
  };

  // Handle tag click - stop propagation to prevent card navigation
  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    // Navigate to tag page with language
    const tagSlug = tag
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    router.push(`/${currentLanguage}/tags/${tagSlug}`);
  };

  // Apply font family inline style
  const fontStyle = currentFont?.family
    ? {
        fontFamily: currentFont.family,
      }
    : {};

  // Render stars for rating (out of 10, convert to 5 stars)
  const renderStars = (rating) => {
    const starRating = rating / 2;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;

    return (
      <div className="compact-stars">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <svg
                key={i}
                className={`compact-star-icon ${theme.iconColors?.starFilled || "text-amber-400"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <svg
                key={i}
                className={`compact-star-icon ${theme.iconColors?.starFilled || "text-amber-400"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <defs>
                  <linearGradient id={`half-star-${comic.id}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-star-${comic.id})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            );
          } else {
            return (
              <svg
                key={i}
                className={`compact-star-icon ${theme.iconColors?.starEmpty || "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div
      dir={direction}
      style={fontStyle}
      onClick={handleCardClick}
      className={`comic-compact-card
        ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} 
        ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
        overflow-hidden rounded-xl 
        flex flex-col h-full
        ${className}
        ${direction === "rtl" ? "rtl" : ""}
      `}
    >
      <div className="p-5">
        <div className={`flex flex-col sm:flex-row gap-4 ${flexDirection}`}>
          {/* Comic Cover Image */}
          <div className="flex-shrink-0">
            <img
              src={comic.image || comic.imageUrl || fallbackImage}
              alt={comic.title}
              className="comic-compact-cover w-24 h-36 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
              loading="lazy"
            />
          </div>

          {/* Comic Details */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`compact-title ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-1 ${textAlign}`}
            >
              {comic.title}
            </h3>

            {/* Publisher */}
            <p
              className={`compact-publisher ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-2 ${textAlign}`}
            >
              {t("comic.published_by") || "Published by"} {comic.publisher}
            </p>

            {/* Rating */}
            <div
              className="flex items-center mb-3"
              style={{
                flexDirection: direction === "rtl" ? "row-reverse" : "row",
              }}
            >
              {renderStars(comic.rating || 0)}
              <span
                className={`compact-rating-value ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}
              >
                ({comic.rating?.toFixed(1) || "0"}/10)
              </span>
            </div>

            {/* Description */}
            <p
              className={`compact-description ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-3 ${textAlign}`}
            >
              {comic.description}
            </p>

            {/* Collections/Series Tags */}
            {showCollections && comicCollections.length > 0 && (
              <div className={`flex flex-wrap gap-1.5 mb-3 ${flexDirection}`}>
                {comicCollections.slice(0, 2).map((collection, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => handleTagClick(e, collection)}
                    className={`compact-tag clickable-element ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} ${isDarkMode ? "bg-sky-900/30" : "bg-sky-50"}`}
                  >
                    {collection}
                  </span>
                ))}
                {comicCollections.length > 2 && (
                  <span
                    className={`compact-tag ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    +{comicCollections.length - 2} {t("comic.more") || "More"}
                  </span>
                )}
              </div>
            )}

            {/* Characters Introduced Tags */}
            {comic.charactersIntroduced &&
              comic.charactersIntroduced.length > 0 && (
                <div className={`flex flex-wrap gap-1.5 mb-3 ${flexDirection}`}>
                  {comic.charactersIntroduced
                    .slice(0, 2)
                    .map((character, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => handleTagClick(e, character)}
                        className={`compact-tag clickable-element ${theme.textColors?.badge || "text-purple-800 dark:text-purple-400"} ${isDarkMode ? "bg-purple-900/30" : "bg-purple-50"}`}
                      >
                        {character}
                      </span>
                    ))}
                  {comic.charactersIntroduced.length > 2 && (
                    <span
                      className={`compact-tag ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                    >
                      +{comic.charactersIntroduced.length - 2}{" "}
                      {t("comic.more_characters") || "More"}
                    </span>
                  )}
                </div>
              )}

            {/* View Details Button with language-aware link */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/${currentLanguage}/comics/${comicSlug}`);
              }}
              className={`view-details-button clickable-element ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white`}
            >
              {t("comic.view_details") || "View Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicCompactCard;
