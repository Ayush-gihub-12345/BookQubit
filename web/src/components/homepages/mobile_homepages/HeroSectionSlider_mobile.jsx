"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaDownload,
  FaBookOpen,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaShare,
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { getBooksByLanguage } from "@/data/books";
import { useFont } from "@/contexts/FontContext";

const HeroSectionSliderMobile = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const router = useRouter();
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [books, setBooks] = useState([]);
  const scrollInterval = useRef(null);

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Load books based on language
  useEffect(() => {
    const booksData = getBooksByLanguage(language);
    setBooks(booksData);
  }, [language]);

  // Filter books
  const filteredBooks = books.filter((book) => {
    const wordCount = book.title?.trim().split(/\s+/).length || 0;
    return wordCount <= 6;
  });

  // Reset current book index when filtered books change
  useEffect(() => {
    setCurrentBookIndex(0);
  }, [filteredBooks.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (filteredBooks.length === 0) return;

    scrollInterval.current = setInterval(() => {
      setCurrentBookIndex(
        (prevIndex) => (prevIndex + 1) % filteredBooks.length,
      );
      setIsInWishlist(false);
    }, 5000);

    return () => clearInterval(scrollInterval.current);
  }, [filteredBooks.length]);

  if (filteredBooks.length === 0) return null;

  const currentBook = filteredBooks[currentBookIndex];

  const handleManualSelect = (index) => {
    setCurrentBookIndex(index);
    setIsInWishlist(false);

    clearInterval(scrollInterval.current);
    scrollInterval.current = setInterval(() => {
      setCurrentBookIndex(
        (prevIndex) => (prevIndex + 1) % filteredBooks.length,
      );
      setIsInWishlist(false);
    }, 5000);
  };

  const navigateBook = (direction) => {
    const newIndex =
      direction === "prev"
        ? (currentBookIndex - 1 + filteredBooks.length) % filteredBooks.length
        : (currentBookIndex + 1) % filteredBooks.length;
    handleManualSelect(newIndex);
  };

  // Handler functions
  const handleGetBook = () => {
    if (currentBook?.buttons?.getBook) {
      window.open(currentBook.buttons.getBook, "_blank");
    }
  };

  const handleKnowMore = () => {
    router.push(
      currentBook?.buttons?.knowMore || `/books/${currentBook?.slug}`,
    );
  };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };

  const handleShare = () => {
    if (!currentBook) return;
    if (navigator.share) {
      navigator.share({
        title: currentBook.title,
        text: `${t("hero.check_out") || "Check out"} "${currentBook.title}" ${t("hero.by") || "by"} ${currentBook.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t("hero.link_copied") || "Link copied to clipboard!");
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${i < Math.floor(rating || 0) ? theme.iconColors?.starFilled || "text-amber-400" : theme.iconColors?.starEmpty || "text-gray-300"}`}
        size={10}
      />
    ));
  };

  return (
    <section
      className="w-full"
      style={{
        background:
          theme.background?.section || (isDarkMode ? "#0f172a" : "#ffffff"),
        fontFamily: currentFont?.family,
      }}
    >
      <div className="w-full px-3 py-3">
        {/* Main Book Card */}
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{
            background:
              theme.background?.bookCoverSide ||
              (isDarkMode ? "#1e293b" : "#f8fafc"),
            border: `1px solid ${theme.border?.default || (isDarkMode ? "#334155" : "#e2e8f0")}`,
          }}
        >
          {/* Navigation Arrows */}
          {filteredBooks.length > 1 && (
            <>
              <button
                onClick={() => navigateBook("prev")}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-md transition-all hover:scale-110"
                aria-label={t("hero.previous_book") || "Previous book"}
              >
                <FaChevronLeft
                  className={`w-4 h-4 ${theme.iconColors?.navigationArrow || "text-sky-600 dark:text-sky-400"}`}
                />
              </button>

              <button
                onClick={() => navigateBook("next")}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-md transition-all hover:scale-110"
                aria-label={t("hero.next_book") || "Next book"}
              >
                <FaChevronRight
                  className={`w-4 h-4 ${theme.iconColors?.navigationArrow || "text-sky-600 dark:text-sky-400"}`}
                />
              </button>
            </>
          )}

          {/* Card Content - Flex Row */}
          <div className="flex items-start p-3 gap-3">
            {/* Left Column - Book Cover (20%) */}
            <div className="flex-shrink-0 w-[20%]">
              <div className="relative">
                <div
                  className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden ${theme.shadow?.book || "shadow-md"}`}
                >
                  <img
                    src={currentBook.imageUrl}
                    alt={currentBook.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>

                {/* Wishlist Button Overlay */}
                <button
                  onClick={handleWishlist}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  style={{
                    background: isDarkMode ? "#334155" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "#475569" : "#e2e8f0"}`,
                  }}
                >
                  <FaHeart
                    size={10}
                    className={
                      isInWishlist
                        ? "text-rose-500 fill-current"
                        : "text-slate-400"
                    }
                  />
                </button>
              </div>
            </div>

            {/* Right Column - Book Details (80%) */}
            <div className="flex-1 min-w-0">
              {/* Category Badge */}
              <span
                className={`inline-block ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} px-2 py-0.5 rounded-full text-[9px] font-medium mb-1.5`}
              >
                {currentBook.category}
              </span>

              {/* Book Title */}
              <h3
                className="text-sm font-bold leading-tight mb-0.5 line-clamp-2"
                style={{
                  color:
                    theme.textColors?.primary ||
                    (isDarkMode ? "#f1f5f9" : "#0f172a"),
                }}
              >
                {currentBook.title}
              </h3>

              {/* Author Name */}
              <p
                className="text-xs mb-1.5"
                style={{
                  color:
                    theme.textColors?.highlight ||
                    (isDarkMode ? "#60a5fa" : "#0ea5e9"),
                }}
              >
                {t("book.by") || "by"} {currentBook.author}
              </p>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-0.5">
                  {renderStars(currentBook.rating)}
                </div>
                <span
                  className="text-[9px]"
                  style={{
                    color:
                      theme.textColors?.secondary ||
                      (isDarkMode ? "#94a3b8" : "#64748b"),
                  }}
                >
                  ({currentBook.rating?.toFixed(1) || "0"})
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2">
                {/* Know More Button */}
                <button
                  onClick={handleKnowMore}
                  className="flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium transition-all hover:scale-105 flex items-center justify-center gap-1"
                  style={{
                    background: isDarkMode ? "#334155" : "#f1f5f9",
                    color:
                      theme.textColors?.primary ||
                      (isDarkMode ? "#e2e8f0" : "#334155"),
                    border: `1px solid ${isDarkMode ? "#475569" : "#e2e8f0"}`,
                  }}
                >
                  <FaBookOpen size={9} />
                  <span>{t("book.know_more") || "Know More"}</span>
                </button>

                {/* Get Button */}
                <button
                  onClick={handleGetBook}
                  className="flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium transition-all hover:scale-105 flex items-center justify-center gap-1"
                  style={{
                    background:
                      theme.buttonColors?.primaryButton?.background ||
                      (isDarkMode ? "#3b82f6" : "#0ea5e9"),
                    color: "#ffffff",
                  }}
                >
                  <FaDownload size={9} />
                  <span>{t("book.get") || "Get Book"}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="py-1.5 px-2 rounded-md text-[10px] font-medium transition-all hover:scale-105 flex items-center justify-center"
                  style={{
                    background: isDarkMode ? "#334155" : "#f1f5f9",
                    color:
                      theme.textColors?.secondary ||
                      (isDarkMode ? "#94a3b8" : "#64748b"),
                    border: `1px solid ${isDarkMode ? "#475569" : "#e2e8f0"}`,
                  }}
                >
                  <FaShare size={9} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        {filteredBooks.length > 1 && (
          <div className="flex justify-center mt-3">
            <div
              className={`inline-flex space-x-1 p-1.5 ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} rounded-full`}
            >
              {filteredBooks.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleManualSelect(index)}
                  className={`transition-all rounded-full ${
                    index === currentBookIndex
                      ? `${theme.buttonColors?.primaryButton?.background || "bg-sky-500"} w-4`
                      : `${theme.background?.navigationDots || "bg-gray-300 dark:bg-gray-600"} w-1.5`
                  }`}
                  style={{
                    width: index === currentBookIndex ? "16px" : "6px",
                    height: "6px",
                  }}
                  aria-label={`${t("hero.go_to_book") || "Go to book"} ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSectionSliderMobile;
