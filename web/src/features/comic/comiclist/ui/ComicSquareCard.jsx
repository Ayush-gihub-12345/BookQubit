"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ComicSquareCard = ({
  comic,
  onTagClick,
  onWishlistToggle,
  currentLang: propLang,
}) => {
  const { theme, themeName } = useTheme();
  const { t, language: contextLanguage } = useLanguage();
  const params = useParams();
  const pathname = usePathname();
  const [isWishlisted, setIsWishlisted] = useState(false);

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
  if (!theme || !comic) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Function to render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = (rating / 2) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className={`w-3 h-3 ${theme.iconColors?.starFilled || "text-amber-400"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg
            key="half"
            className={`w-3 h-3 ${theme.iconColors?.starFilled || "text-amber-400"}`}
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
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className={`w-3 h-3 ${theme.iconColors?.starEmpty || "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span
          className={`text-xs ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ml-1`}
        >
          {comic.rating}
        </span>
      </div>
    );
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newWishlistState = !isWishlisted;
    setIsWishlisted(newWishlistState);
    if (onWishlistToggle) {
      onWishlistToggle(comic.id, newWishlistState);
    }
  };

  // Get the correct slug (handle language-specific slugs)
  const getComicSlug = () => {
    // For Hindi, use hindiSlug if available
    if (currentLanguage === "hi") {
      return comic.hindiSlug || comic.slug;
    }
    // For Urdu, use urduSlug if available
    if (currentLanguage === "ur") {
      return comic.urduSlug || comic.slug;
    }
    // For Arabic, use arabicSlug if available
    if (currentLanguage === "ar") {
      return comic.arabicSlug || comic.slug;
    }
    // For Bengali, use bengaliSlug if available
    if (currentLanguage === "bn") {
      return comic.bengaliSlug || comic.slug;
    }
    // Default to regular slug
    return comic.slug;
  };

  const comicSlug = getComicSlug();

  return (
    <div
      className={`
        w-full max-w-sm mx-auto 
        ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
        ${theme.shadow?.book || "shadow-2xl"} 
        ${theme.background?.section || "bg-white dark:bg-gray-800"} 
        overflow-hidden rounded-xl 
        transition-all duration-300 hover:scale-105 hover:shadow-xl
      `}
    >
      {/* Comic Cover Image with Overlays */}
      <div className="relative">
        <div
          className={`
            h-64 
            ${theme.background?.bookCoverSide || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"} 
            flex items-center justify-center p-4 overflow-hidden
          `}
        >
          <img
            src={comic.image}
            alt={comic.title}
            className="h-full w-full object-contain max-h-full max-w-full transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
        </div>

        {/* Category Badge */}
        <div
          className={`
            absolute top-3 left-3 
            ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} 
            ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} 
            px-2 py-1 
            ${theme.border?.button || "border border-gray-200 dark:border-gray-600"} 
            ${theme.shadow?.navigationDotContainer || "shadow-sm"} 
            font-semibold text-xs rounded-full backdrop-blur-sm
          `}
        >
          {comic.category}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`
            absolute top-3 right-3 p-2 
            ${theme.border?.button || "border border-gray-200 dark:border-gray-600"} 
            ${theme.shadow?.button || "shadow-md"} 
            rounded-full transition-all duration-300 backdrop-blur-sm 
            ${
              isWishlisted
                ? `${theme.buttonColors?.wishlistButton?.savedBackground || "bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-600"} ${theme.textColors?.wishlistSaved || "text-rose-600 dark:text-rose-400"}`
                : `${theme.buttonColors?.wishlistButton?.defaultBackground || "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"} ${theme.textColors?.wishlistDefault || "text-gray-600 dark:text-gray-400"} hover:${theme.textColors?.wishlistSaved || "text-rose-600 dark:text-rose-400"}`
            }
          `}
          aria-label={
            isWishlisted
              ? t("book.remove_from_wishlist") || "Remove from wishlist"
              : t("book.add_to_wishlist") || "Add to wishlist"
          }
        >
          <svg
            className="w-4 h-4"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Value Badge */}
        {comic.valueToday && (
          <div
            className={`
              absolute bottom-3 left-3 
              ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} 
              ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} 
              px-2 py-1 
              ${theme.border?.button || "border border-gray-200 dark:border-gray-600"} 
              ${theme.shadow?.navigationDotContainer || "shadow-sm"} 
              font-bold text-xs rounded-full backdrop-blur-sm
            `}
          >
            💎 {comic.valueToday.split(" ")[0]}
          </div>
        )}
      </div>

      {/* Comic Details */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3
            className={`text-lg font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} pr-2 line-clamp-2 flex-1`}
          >
            {comic.title}
          </h3>
          {renderStars(comic.rating)}
        </div>

        {/* Publisher and Date */}
        <div className="mb-3">
          <p
            className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-1`}
          >
            {comic.publisher}
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
            >
              {comic.publicationDate}
            </span>
            {comic.coverPrice && (
              <>
                <span
                  className={`text-xs ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                >
                  •
                </span>
                <span
                  className={`text-xs ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} font-semibold`}
                >
                  {comic.coverPrice}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p
          className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-3 line-clamp-2`}
        >
          {comic.description}
        </p>

        {/* Key Characters */}
        {comic.charactersIntroduced &&
          comic.charactersIntroduced.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {comic.charactersIntroduced
                  .slice(0, 2)
                  .map((character, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTagClick && onTagClick(character);
                      }}
                      className={`
                    text-xs px-2 py-1 
                    ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
                    ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} 
                    ${isDarkMode ? "bg-sky-900/30 hover:bg-sky-800/40" : "bg-sky-50 hover:bg-sky-100"} 
                    rounded-full transition-colors
                  `}
                    >
                      {character}
                    </button>
                  ))}
                {comic.charactersIntroduced.length > 2 && (
                  <span
                    className={`text-xs ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                  >
                    +{comic.charactersIntroduced.length - 2}{" "}
                    {t("book.more") || "more"}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Action Buttons with Language-aware Links */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/${currentLanguage}/comics/${comicSlug}`}
            className={`
              w-full py-2 text-center font-semibold rounded-lg 
              ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} 
              text-white 
              ${theme.border?.button || ""} 
              ${theme.shadow?.button || "shadow-md"} 
              transition-all duration-300 
              ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"}
              hover:scale-105 active:scale-95
            `}
          >
            {t("comic.view_details") || "View Details"}
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/${currentLanguage}/read/comic/${comicSlug}`}
              className={`
                flex-1 py-2 text-center font-semibold rounded-lg 
                ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} 
                ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} 
                ${theme.border?.button || ""} 
                ${theme.shadow?.button || "shadow-md"} 
                transition-all duration-300 
                ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"}
                hover:scale-105 active:scale-95 text-xs
              `}
            >
              {t("comic.read_digital") || "Read"}
            </Link>
            <Link
              href={`/${currentLanguage}/comics/${comicSlug}/collectors-guide`}
              className={`
                flex-1 py-2 text-center font-semibold rounded-lg 
                ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} 
                ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"} 
                ${theme.border?.button || ""} 
                ${theme.shadow?.button || "shadow-md"} 
                transition-all duration-300 
                ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"}
                hover:scale-105 active:scale-95 text-xs
              `}
            >
              {t("comic.collectors_guide") || "Collect"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicSquareCard;
