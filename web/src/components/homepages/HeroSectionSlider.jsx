"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaShoppingCart,
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
import { useFont } from "@/contexts/FontContext"; // Import font context

const HeroSection = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont(); // Use font context
  const router = useRouter();
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCollection, setIsInCollection] = useState(false);
  const [bookStatus, setBookStatus] = useState("unread");
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

  // Filter books - moved before conditional return
  const filteredBooks = books.filter((book) => {
    const wordCount = book.title?.trim().split(/\s+/).length || 0;
    return wordCount <= 5;
  });

  // Reset current book index when filtered books change
  useEffect(() => {
    setCurrentBookIndex(0);
  }, [filteredBooks.length]);

  // Auto-scroll functionality - MOVED BEFORE conditional return
  useEffect(() => {
    if (filteredBooks.length === 0) return;

    scrollInterval.current = setInterval(() => {
      setCurrentBookIndex(
        (prevIndex) => (prevIndex + 1) % filteredBooks.length,
      );
      setIsInWishlist(false);
      setIsInCollection(false);
      setBookStatus("unread");
    }, 5000);

    return () => clearInterval(scrollInterval.current);
  }, [filteredBooks.length]);

  // Conditional return AFTER all hooks
  if (filteredBooks.length === 0) {
    return (
      <section
        className={`${theme.background?.section || ""} ${theme.layout?.sectionPadding || "py-12 px-4"}`}
        style={{ fontFamily: currentFont?.family }} // Apply font
      >
        <div
          className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto text-center py-20`}
        >
          <h2
            className={`text-2xl font-bold ${theme.textColors?.primary || ""}`}
          >
            {t("hero.no_books_available") || "No books available"}
          </h2>
        </div>
      </section>
    );
  }

  const currentBook = filteredBooks[currentBookIndex];

  const handleManualSelect = (index) => {
    setCurrentBookIndex(index);
    setIsInWishlist(false);
    setIsInCollection(false);
    setBookStatus("unread");

    clearInterval(scrollInterval.current);
    scrollInterval.current = setInterval(() => {
      setCurrentBookIndex(
        (prevIndex) => (prevIndex + 1) % filteredBooks.length,
      );
      setIsInWishlist(false);
      setIsInCollection(false);
      setBookStatus("unread");
    }, 5000);
  };

  const navigateBook = (direction) => {
    const newIndex =
      direction === "prev"
        ? (currentBookIndex - 1 + filteredBooks.length) % filteredBooks.length
        : (currentBookIndex + 1) % filteredBooks.length;
    handleManualSelect(newIndex);
  };

  // Handler functions for buttons
  const handleGetBook = () => {
    if (currentBook?.buttons?.getBook) {
      window.open(currentBook.buttons.getBook, "_blank");
    }
  };

  const handleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    console.log(
      `${isInWishlist ? "Removed from" : "Added to"} wishlist:`,
      currentBook?.title,
    );
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

  const handleSummaryClick = () => {
    if (currentBook?.slug) {
      router.push(`/books/${currentBook.slug}#summary`);
    } else if (currentBook?.id) {
      router.push(`/books/${currentBook.id}#summary`);
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`${i < Math.floor(rating || 0) ? theme.iconColors?.starFilled || "text-amber-400" : theme.iconColors?.starEmpty || "text-gray-300"} ${i > 0 ? "ml-1" : ""}`}
        size={16}
      />
    ));
  };

  return (
    <section
      className={`${theme.background?.section || ""} ${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}
      style={{ fontFamily: currentFont?.family }} // Apply font to entire section
    >
      <div className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}>
        {/* Main Book Display */}
        <div
          className={`relative ${theme.background?.bookCoverSide || ""} ${theme.border?.default || ""} ${theme.shadow?.container || ""} overflow-hidden ${theme.ringEffect || ""} rounded-xl`}
        >
          {/* Navigation Arrows - Hidden on mobile */}
          {filteredBooks.length > 1 && (
            <>
              <button
                onClick={() => navigateBook("prev")}
                className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 p-2 md:p-3 rounded-full shadow-md transition-all hover:scale-110"
                aria-label={t("hero.previous_book") || "Previous book"}
              >
                <FaChevronLeft
                  className={`w-5 h-5 md:w-6 md:h-6 ${theme.iconColors?.navigationArrow || "text-sky-600 dark:text-sky-400"}`}
                />
              </button>

              <button
                onClick={() => navigateBook("next")}
                className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 p-2 md:p-3 rounded-full shadow-md transition-all hover:scale-110"
                aria-label={t("hero.next_book") || "Next book"}
              >
                <FaChevronRight
                  className={`w-5 h-5 md:w-6 md:h-6 ${theme.iconColors?.navigationArrow || "text-sky-600 dark:text-sky-400"}`}
                />
              </button>
            </>
          )}

          <div className="flex flex-col lg:flex-row">
            {/* Book Cover - Left Side */}
            <div
              className={`lg:w-2/5 p-6 sm:p-8 md:p-10 flex items-center justify-center ${theme.background?.bookCoverSide || ""} relative`}
            >
              <div
                className={`absolute inset-0 ${theme.opacityOverlay || "opacity-10"} bg-[url('https://www.transparenttextures.com/patterns/soft-circle-scales.png')]`}
              ></div>
              <div
                className={`relative max-w-xs w-full aspect-[2/3] ${theme.shadow?.book || "shadow-2xl"} rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105`}
              >
                <img
                  src={currentBook.imageUrl}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {/* Book Details - Right Side */}
            <div className="lg:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
              <div className="max-w-2xl">
                {/* Category Badge */}
                <span
                  className={`inline-block ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.badge || "text-sky-800 dark:text-sky-400"} px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 ${theme.shadow?.button || ""}`}
                >
                  {currentBook.category}
                </span>

                {/* Title and Author */}
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2 sm:mb-3 leading-tight`}
                >
                  {currentBook.title}
                </h1>
                <p
                  className={`text-base sm:text-lg ${theme.textColors?.highlight || "text-sky-700 dark:text-sky-400"} mb-4 sm:mb-6 font-medium`}
                >
                  {t("book.by") || "by"} {currentBook.author}
                </p>

                {/* Rating and Meta */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(currentBook.rating)}
                    </div>
                    <span
                      className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                    >
                      ({currentBook.rating?.toFixed(1) || "0"}/5)
                    </span>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm">
                      <span
                        className={`block ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                      >
                        {t("book.pages") || "Pages"}
                      </span>
                      <span
                        className={`font-medium ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}
                      >
                        {currentBook.pageCount}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span
                        className={`block ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                      >
                        {t("book.language") || "Language"}
                      </span>
                      <span
                        className={`font-medium ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}
                      >
                        {currentBook.language}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span
                        className={`block ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                      >
                        {t("book.published") || "Year"}
                      </span>
                      <span
                        className={`font-medium ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}
                      >
                        {currentBook.published}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-6 sm:mb-8">
                  <h3
                    className={`text-lg sm:text-xl font-semibold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-3 sm:mb-4`}
                  >
                    {t("book.key_features") || "Key Features"}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {currentBook.keyPoints?.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span
                          className={`${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} mr-2 sm:mr-3 mt-0.5`}
                        >
                          •
                        </span>
                        <span
                          className={`${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} text-sm sm:text-base`}
                        >
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <button
                    onClick={handleGetBook}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} ${theme.buttonColors?.primaryButton?.textColor || "text-white"}`}
                  >
                    <FaShoppingCart size={18} />
                    {t("book.get_book") || "Get Book"}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 border ${isInWishlist ? "bg-rose-50 border-rose-400 text-rose-600 dark:bg-rose-900/20 dark:border-rose-600 dark:text-rose-400" : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    <FaHeart
                      className={
                        isInWishlist ? "text-rose-600 dark:text-rose-400" : ""
                      }
                      size={18}
                    />
                    {isInWishlist
                      ? t("book.wishlisted") || "Saved to Wishlist"
                      : t("book.wishlist") || "Add to Wishlist"}
                  </button>

                  <button
                    onClick={handleSummaryClick}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 border-2 ${theme.buttonColors?.secondaryButton?.background || "border-sky-500"} ${theme.buttonColors?.secondaryButton?.hoverBackground || "hover:bg-sky-50 dark:hover:bg-sky-900/20"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600 dark:text-sky-400"}`}
                  >
                    <FaBookOpen size={18} />
                    {t("book.summary") || "Read Summary"}
                  </button>

                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all hover:scale-105 ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} hover:bg-gray-200 dark:hover:bg-gray-700`}
                  >
                    <FaShare size={18} />
                    {t("book.share") || "Share"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        {filteredBooks.length > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <div
              className={`inline-flex space-x-1 sm:space-x-2 p-2 ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.border?.navigationDot || ""} ${theme.shadow?.navigationDotContainer || ""} hidden md:inline-flex rounded-full`}
            >
              {filteredBooks.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleManualSelect(index)}
                  className={`${theme.border?.navigationDot || ""} transition-all rounded-full ${
                    index === currentBookIndex
                      ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} w-6`
                      : `${theme.background?.navigationDots || "bg-gray-200 dark:bg-gray-700"} hover:bg-sky-300 dark:hover:bg-sky-600 w-3`
                  }`}
                  style={{
                    width: index === currentBookIndex ? "1.5rem" : "0.75rem",
                    height: "0.75rem",
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

export default HeroSection;
