"use client";

import React from "react";
import {
  FaShare,
  FaHeart,
  FaRegHeart,
  FaBook,
  FaBookOpen,
  FaCheck,
  FaBookmark,
  FaPlus,
  FaThumbsUp,
  FaRegThumbsUp,
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookActions = ({
  book,
  bookStatus = "unread",
  isInWishlist = false,
  isInCollection = false,
  isLiked = false,
  onGetBook,
  onScrollToSummary,
  onWishlist,
  onShare,
  onAddToLibrary,
  onReadStatus,
  onLike,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Helper to get button styles based on state
  const getButtonStyles = (isActive = false, activeBgClass = "") => {
    if (isActive) {
      return activeBgClass || "bg-gradient-to-r from-sky-600 to-sky-500 text-white";
    }
    const secondaryBg = theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent";
    const secondaryText = theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400";
    return `${secondaryBg} ${secondaryText}`;
  };

  const buttonClass = `
    flex-1 min-w-[140px] px-4 py-3 
    flex items-center justify-center gap-2 
    rounded-lg text-sm font-medium 
    transition-all duration-200 hover:shadow-lg 
    hover:scale-105 active:scale-95
  `;

  const handleSummaryClick = () => {
    if (onScrollToSummary) {
      onScrollToSummary();
    } else if (book?.buttons?.readSummary) {
      window.open(book.buttons.readSummary, "_blank");
    }
  };

  const handleLike = () => {
    if (onLike) onLike();
  };

  const handleWishlist = () => {
    if (onWishlist) onWishlist();
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  const handleAddToLibrary = () => {
    if (onAddToLibrary) onAddToLibrary();
  };

  const handleReadStatus = () => {
    const newStatus = bookStatus === "read" ? "unread" : "read";
    if (onReadStatus) onReadStatus(newStatus);
  };

  const handleGetBook = () => {
    if (onGetBook) onGetBook();
  };

  // Primary button styles
  const primaryButtonBg = theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500";
  const primaryButtonHover = theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600";

  return (
    <div className="flex flex-wrap gap-3 pt-4">
      {/* Get Book Button */}
      {book?.buttons?.getBook && (
        <button
          onClick={handleGetBook}
          className={`${buttonClass} ${primaryButtonBg} ${primaryButtonHover} text-white`}
        >
          <FaBook className="w-4 h-4" />
          {t("book.get_book") || "Get Book"}
        </button>
      )}

      {/* Summary Button */}
      {(book?.summary || book?.buttons?.readSummary) && (
        <button
          onClick={handleSummaryClick}
          className={`${buttonClass} ${getButtonStyles(false)}`}
        >
          <FaBookOpen className="w-4 h-4" />
          {t("book.summary") || "Summary"}
        </button>
      )}

      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`${buttonClass} ${getButtonStyles(isLiked, "bg-gradient-to-r from-blue-600 to-blue-500 text-white")}`}
      >
        {isLiked ? <FaThumbsUp className="w-4 h-4" /> : <FaRegThumbsUp className="w-4 h-4" />}
        {isLiked ? (t("book.liked") || "Liked") : (t("book.like") || "Like")}
      </button>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`${buttonClass} ${getButtonStyles(isInWishlist, "bg-gradient-to-r from-pink-600 to-pink-500 text-white")}`}
      >
        {isInWishlist ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
        {isInWishlist ? (t("book.wishlisted") || "Wishlisted") : (t("book.wishlist") || "Wishlist")}
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className={`${buttonClass} ${getButtonStyles(false)}`}
      >
        <FaShare className="w-4 h-4" />
        {t("book.share") || "Share"}
      </button>

      {/* Library Button */}
      <button
        onClick={handleAddToLibrary}
        className={`${buttonClass} ${getButtonStyles(isInCollection, "bg-gradient-to-r from-green-600 to-green-500 text-white")}`}
      >
        {isInCollection ? <FaBookmark className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
        {isInCollection ? (t("book.in_library") || "In Library") : (t("book.my_library") || "My Library")}
      </button>

      {/* Read Status Button */}
      <button
        onClick={handleReadStatus}
        className={`${buttonClass} ${getButtonStyles(bookStatus === "read", "bg-gradient-to-r from-green-600 to-green-500 text-white")}`}
      >
        {bookStatus === "read" ? <FaCheck className="w-4 h-4" /> : <FaBookOpen className="w-4 h-4" />}
        {bookStatus === "read" ? (t("book.read") || "Read") : (t("book.mark_read") || "Mark Read")}
      </button>
    </div>
  );
};

export default BookActions;