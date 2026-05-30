"use client";

import React from "react";
import {
  ComicButton,
  ComicActionButtons,
  ComicButtonGroup,
} from "../components/ComicButton";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ComicRectangleCard = ({
  comic,
  onWishlistToggle,
  isWishlisted = false,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div
      className={`
        hidden md:flex h-[500px] mx-auto w-[90%] max-w-6xl 
        ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
        ${theme.shadow?.book || "shadow-2xl"} 
        ${theme.background?.section || "bg-white dark:bg-gray-800"} 
        overflow-hidden rounded-xl 
        transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
      `}
    >
      {/* Image section */}
      <div
        className={`
          w-[40%] h-full 
          ${theme.background?.bookCoverSide || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"} 
          flex items-center justify-center p-6 relative group
        `}
      >
        <img
          src={comic.image}
          alt={comic.title}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Category Badge */}
        <div
          className={`
            absolute top-4 left-4 
            ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} 
            ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} 
            px-3 py-1 
            ${theme.border?.button || "border border-gray-200 dark:border-gray-600"} 
            ${theme.shadow?.navigationDotContainer || "shadow-sm"} 
            font-semibold text-xs rounded-full backdrop-blur-sm
          `}
        >
          {comic.category}
        </div>

        {/* Value Badge */}
        {comic.valueToday && (
          <div
            className={`
              absolute bottom-4 left-4 
              ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} 
              ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} 
              px-3 py-1 
              ${theme.border?.button || "border border-gray-200 dark:border-gray-600"} 
              ${theme.shadow?.navigationDotContainer || "shadow-sm"} 
              font-bold text-xs rounded-full backdrop-blur-sm
            `}
          >
            💎 {comic.valueToday}
          </div>
        )}
      </div>

      {/* Details section */}
      <div className="w-[60%] p-6 flex flex-col">
        <div className="flex-1">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-3">
            <h2
              className={`text-2xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}
            >
              {comic.title}
            </h2>
            <div className="flex items-center">
              <span
                className={`text-lg font-bold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}
              >
                {comic.rating}/10
              </span>
            </div>
          </div>

          {/* Publisher and Date */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-sm font-semibold ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
            >
              {comic.publisher}
            </span>
            <span
              className={`w-1 h-1 rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-600" : "bg-gray-300")}`}
            ></span>
            <span
              className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
            >
              {comic.publicationDate}
            </span>
            {comic.coverPrice && (
              <>
                <span
                  className={`w-1 h-1 rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-600" : "bg-gray-300")}`}
                ></span>
                <span
                  className={`text-sm font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}
                >
                  {comic.coverPrice}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p
            className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-4 line-clamp-3 leading-relaxed`}
          >
            {comic.description}
          </p>

          {/* Characters Introduced */}
          {comic.charactersIntroduced &&
            comic.charactersIntroduced.length > 0 && (
              <div className="mb-4">
                <h3
                  className={`text-sm font-semibold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2`}
                >
                  {t("comic.characters_introduced") || "Characters Introduced:"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {comic.charactersIntroduced
                    .slice(0, 4)
                    .map((character, index) => (
                      <span
                        key={index}
                        className={`
                      text-xs px-2 py-1 
                      ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
                      ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} 
                      ${isDarkMode ? "bg-sky-900/30" : "bg-sky-100"} 
                      rounded-full
                    `}
                      >
                        {character}
                      </span>
                    ))}
                  {comic.charactersIntroduced.length > 4 && (
                    <span
                      className={`text-xs ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                    >
                      +{comic.charactersIntroduced.length - 4}{" "}
                      {t("book.more") || "more"}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Fun Fact */}
          {comic.funFact && (
            <div
              className={`p-3 ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} rounded-lg mb-2`}
            >
              <p
                className={`text-xs ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
              >
                <span
                  className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}
                >
                  💡 {t("comic.fun_fact") || "Fun Fact:"}{" "}
                </span>
                {comic.funFact}
              </p>
            </div>
          )}
        </div>

        {/* Perfectly aligned buttons */}
        <div
          className={`
            flex-shrink-0 pt-4 border-t 
            ${isDarkMode ? "border-gray-700" : "border-gray-200"}
          `}
        >
          <ComicButtonGroup direction="vertical" className="space-y-3">
            {/* First row - 3 equal buttons */}
            <ComicButtonGroup direction="horizontal" className="flex-1 gap-2">
              <ComicActionButtons.ViewDetails
                comicSlug={comic.slug}
                size="md"
                className="min-w-0 flex-1"
              />
              <ComicActionButtons.ReadDigital
                comicSlug={comic.slug}
                size="md"
                className="min-w-0 flex-1"
              />
              <ComicActionButtons.QuickSummary
                comicSlug={comic.slug}
                size="md"
                className="min-w-0 flex-1"
              />
            </ComicButtonGroup>

            {/* Second row - 3 equal buttons */}
            <ComicButtonGroup direction="horizontal" className="flex-1 gap-2">
              <ComicActionButtons.CollectorGuide
                comicSlug={comic.slug}
                size="md"
                className="min-w-0 flex-1"
              />
              <ComicActionButtons.AddWishlist
                comicSlug={comic.slug}
                isWishlisted={isWishlisted}
                onToggle={() => onWishlistToggle(comic.id, !isWishlisted)}
                size="md"
                className="min-w-0 flex-1"
              />
              <ComicActionButtons.ShareComic
                comicSlug={comic.slug}
                size="md"
                className="min-w-0 flex-1"
              />
            </ComicButtonGroup>
          </ComicButtonGroup>
        </div>
      </div>
    </div>
  );
};

export default ComicRectangleCard;
