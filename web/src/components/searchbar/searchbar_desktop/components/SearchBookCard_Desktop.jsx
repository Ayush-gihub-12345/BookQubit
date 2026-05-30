// src/components/searchbar/searchbar_desktop/components/SearchBookCard_Desktop.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaStar,
  FaBookOpen,
  FaUser,
  FaTag,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaShare,
} from "react-icons/fa";

const SearchBookCard_Desktop = ({
  book,
  onAddToWishlist,
  onShare,
  showActions = true,
  compact = false,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const placeholderImage = "/placeholder-book.jpg";
  const bookImage =
    !imageError && book.imageUrl ? book.imageUrl : placeholderImage;

  // Render star rating
  const renderStars = (rating = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-xs ${
              i < fullStars
                ? theme.iconColors?.starFilled || "text-amber-400"
                : i === fullStars && hasHalfStar
                  ? "text-amber-400"
                  : theme.iconColors?.starEmpty || "text-gray-300"
            }`}
          />
        ))}
        <span
          className={`text-xs ml-2 ${theme.textColors?.secondary || "text-gray-500"}`}
        >
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  // Truncate text
  const truncateText = (text, maxLength = compact ? 100 : 200) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    if (onAddToWishlist) onAddToWishlist(book);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(book);
    } else if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Compact card design (for search dropdown suggestions)
  if (compact) {
    return (
      <Link href={`/books/${book.slug || book.id}`} className="block">
        <div
          className={`
            group flex items-center gap-3 p-3 rounded-lg
            transition-all duration-200 cursor-pointer
            hover:bg-gradient-to-r ${isDarkMode ? "hover:from-gray-700/50" : "hover:from-gray-50/50"}
            ${isDarkMode ? "hover:border-gray-600" : "hover:border-gray-300"}
          `}
        >
          {/* Book Cover Thumbnail */}
          <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden shadow-md">
            <img
              src={bookImage}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <h4
              className={`text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} truncate`}
            >
              {book.title}
            </h4>
            <p
              className={`text-xs ${theme.textColors?.secondary || "text-gray-500"} truncate`}
            >
              {book.author}
            </p>
            {book.rating && (
              <div className="mt-1">{renderStars(book.rating)}</div>
            )}
          </div>

          <FaArrowRight
            className={`text-xs ${theme.textColors?.secondary || "text-gray-400"} opacity-0 group-hover:opacity-100 transition-all`}
          />
        </div>
      </Link>
    );
  }

  // Full card design (for search results page)
  return (
    <div
      className={`
        group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl
        transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
        ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
        ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}
        ${theme.shadow?.container || "shadow-lg"}
      `}
    >
      {/* Book Cover Image */}
      <Link
        href={`/books/${book.slug || book.id}`}
        className="flex-shrink-0 self-center md:self-auto"
      >
        <div className="relative w-32 h-48 md:w-40 md:h-56 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
          <img
            src={bookImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Book Details */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/books/${book.slug || book.id}`} className="flex-1">
            <h2
              className={`
                text-xl md:text-2xl font-bold mb-2 line-clamp-2
                ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
                hover:${theme.textColors?.highlight || "text-sky-600"}
                transition-colors duration-200
              `}
            >
              {book.title}
            </h2>
          </Link>

          {/* Wishlist Button */}
          {showActions && (
            <button
              onClick={handleWishlist}
              className={`flex-shrink-0 p-2 rounded-full transition-all hover:scale-110
                ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
              `}
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {isInWishlist ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart
                  className={`${theme.textColors?.secondary || "text-gray-500"} text-xl`}
                />
              )}
            </button>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <FaUser
            className={`text-xs ${theme.textColors?.secondary || "text-gray-500"}`}
          />
          <span
            className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
          >
            {t("book.by")} {book.author}
          </span>
        </div>

        {/* Rating */}
        {book.rating && <div className="mb-3">{renderStars(book.rating)}</div>}

        {/* Description */}
        {book.description && (
          <p
            className={`text-sm ${theme.textColors?.secondary || "text-gray-600"} mb-4 line-clamp-3`}
          >
            {truncateText(book.description)}
          </p>
        )}

        {/* Tags and Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {book.category && (
            <span
              className={`
                text-xs px-2 py-1 rounded-full inline-flex items-center gap-1
                ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700" : "bg-gray-100")}
                ${theme.textColors?.secondary || "text-gray-600"}
              `}
            >
              <FaTag className="text-xs" />
              {book.category}
            </span>
          )}
          {book.collection && (
            <span
              className={`
                text-xs px-2 py-1 rounded-full
                ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700" : "bg-gray-100")}
                ${theme.textColors?.secondary || "text-gray-600"}
              `}
            >
              {book.collection}
            </span>
          )}
          {book.tags?.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className={`
                text-xs px-2 py-1 rounded-full
                ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700" : "bg-gray-100")}
                ${theme.textColors?.secondary || "text-gray-600"}
              `}
            >
              {tag}
            </span>
          ))}
          {book.tags?.length > 2 && (
            <span
              className={`text-xs px-2 py-1 ${theme.textColors?.secondary || "text-gray-500"}`}
            >
              +{book.tags.length - 2} more
            </span>
          )}
        </div>

        {/* Key Points / Highlights */}
        {book.keyPoints && book.keyPoints.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FaBookOpen
                className={`text-xs ${theme.textColors?.highlight || "text-sky-600"}`}
              />
              <span
                className={`text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? "text-gray-300" : "text-gray-700")}`}
              >
                {t("book.key_highlights") || "Key Highlights"}
              </span>
            </div>
            <ul className="space-y-1">
              {book.keyPoints.slice(0, 3).map((point, index) => (
                <li
                  key={index}
                  className={`text-xs ${theme.textColors?.secondary || "text-gray-600"} flex items-start gap-2`}
                >
                  <span
                    className={`text-${theme.textColors?.highlight || "sky-600"} mt-0.5`}
                  >
                    •
                  </span>
                  {truncateText(point, 100)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-3 mt-auto pt-4">
            <Link
              href={`/books/${book.slug || book.id}`}
              className={`
                inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white
                transition-all duration-200 hover:scale-105 hover:shadow-lg
                ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
                ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"}
              `}
            >
              {t("book.view_details") || "View Details"}
              <FaArrowRight size={14} />
            </Link>

            {book.buttons?.readSummary && (
              <a
                href={book.buttons.readSummary}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium
                  transition-all duration-200 hover:scale-105 hover:shadow-lg
                  ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500"}
                  ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"}
                  hover:${theme.buttonColors?.secondaryButton?.hoverBackground || "bg-sky-50 dark:bg-sky-900/20"}
                `}
              >
                {t("book.read_summary") || "Read Summary"}
              </a>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200 hover:scale-105
                ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-700" : "bg-gray-100")}
                ${theme.textColors?.secondary || "text-gray-600"}
                hover:${theme.textColors?.highlight || "text-sky-600"}
              `}
              aria-label="Share"
            >
              <FaShare size={14} />
              {t("book.share") || "Share"}
            </button>
          </div>
        )}
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-sky-500/50 transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default SearchBookCard_Desktop;