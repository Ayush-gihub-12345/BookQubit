"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getAcademicBooksByLanguage } from "@/data/academic_books_data";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { FaGraduationCap, FaStar } from "react-icons/fa";
import "./ExploreAcademicBooks.css";

const ExploreAcademicBooks = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const [academicBooks, setAcademicBooks] = useState([]);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Load academic books based on language
  useEffect(() => {
    const booksData = getAcademicBooksByLanguage(language);
    setAcademicBooks(booksData || []);
  }, [language]);

  const featuredAcademicBooks = academicBooks.slice(0, 12);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setSliderKey((prev) => prev + 1);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSlidesToShow = () => {
    if (windowWidth <= 768) return 1;
    if (windowWidth <= 1024) return 2;
    if (windowWidth <= 1280) return 3;
    return Math.min(featuredAcademicBooks.length, 4);
  };

  const sliderSettings = {
    dots: true,
    infinite: featuredAcademicBooks.length > 1,
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: windowWidth > 768,
  };

  // Level badge colors
  const getLevelBadgeClass = (level) => {
    const levelClasses = {
      Beginner:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      Intermediate:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      levelClasses[level] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    );
  };

  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150' fill='%23ccc'%3E%3Crect width='100' height='150' /%3E%3Ctext x='10' y='75' fill='%23333' font-size='14'%3ENo cover%3C/text%3E%3C/svg%3E";

  if (!mounted) {
    return null;
  }

  if (featuredAcademicBooks.length === 0) {
    return (
      <section
        className={`academic-books-section ${theme.background?.section || "bg-gray-50 dark:bg-gray-900"} ${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}
        style={{ fontFamily: currentFont?.family }}
      >
        <div
          className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto text-center`}
        >
          <div className="academic-icon-container">
            <div
              className={`academic-icon-wrapper rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
            >
              <FaGraduationCap
                className={`academic-icon ${theme.textColors?.highlight || "text-sky-600"}`}
              />
            </div>
          </div>
          <h2
            className={`text-2xl md:text-3xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2`}
          >
            {t("academic.hero.title") || "Academic Textbooks"}
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} max-w-2xl mx-auto px-4`}
          >
            {t("academic.message.no_books") ||
              "No academic books available at this time."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`academic-books-section ${theme.background?.section || "bg-gray-50 dark:bg-gray-900"} ${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}
      style={{ fontFamily: currentFont?.family }}
    >
      <div className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}>
        <div className="text-center mb-8 md:mb-12">
          <div className="academic-icon-container">
            <div
              className={`academic-icon-wrapper rounded-full ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
            >
              <FaGraduationCap
                className={`academic-icon ${theme.textColors?.highlight || "text-sky-600"}`}
              />
            </div>
          </div>
          <h2
            className={`text-2xl md:text-3xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2`}
          >
            {t("academic.hero.title") || "Academic Textbooks"}
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} max-w-2xl mx-auto px-4`}
          >
            {t("academic.hero.subtitle") ||
              "Discover comprehensive textbooks and research materials from leading publishers"}
          </p>
        </div>

        <div className="mb-8 relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {featuredAcademicBooks.map((book) => (
              <div key={book.id} className="px-2 outline-none h-full">
                <div
                  className={`academic-book-card ${theme.background?.bookCoverSide || "bg-white dark:bg-gray-800"} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} ${theme.shadow?.container || "shadow-lg"} p-3 sm:p-4 rounded-xl h-full flex flex-col transition-all duration-300`}
                >
                  <div className="flex justify-center mb-3">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="academic-book-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                      />
                    ) : (
                      <div
                        className={`h-28 sm:h-40 w-full flex items-center justify-center ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} rounded-lg`}
                      >
                        <FaGraduationCap
                          className={`text-4xl ${theme.textColors?.highlight || "text-sky-600"}`}
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className={`academic-book-title ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}
                  >
                    {book.title}
                  </h3>
                  <p
                    className={`academic-book-author ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                  >
                    {t("book.by") || "by"} {book.author}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`level-badge ${getLevelBadgeClass(book.level)}`}
                    >
                      {t(`academic.level.${book.level?.toLowerCase()}`) ||
                        book.level}
                    </span>
                    <div className="academic-star-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`academic-star-icon ${
                            i < Math.floor(book.rating || 0)
                              ? "text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span
                        className={`rating-value ${theme.textColors?.secondary || "text-gray-500"}`}
                      >
                        {book.rating}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`academic-description ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                  >
                    {book.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span
                      className={`academic-price ${theme.textColors?.highlight || "text-sky-600"}`}
                    >
                      {book.price}
                    </span>
                    <Link
                      href={`/academicbooks/${book.slug}`}
                      className={`view-details-btn ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} text-white`}
                    >
                      {t("book.view_details") || "View Details"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="text-center">
          <Link
            href="/academicbooks"
            className={`explore-all-btn ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} ${theme.buttonColors?.primaryButton?.textColor || "text-white"} ${theme.border?.button || ""} ${theme.shadow?.button || "shadow-md"}`}
          >
            {t("academic.button.explore_all") || "Explore All Academic Books"}
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Dot styling */}
      <style jsx="true">{`
        .slick-dots li button:before {
          color: ${isDarkMode ? "#9ca3af" : "#d1d5db"};
        }
        .slick-dots li.slick-active button:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
        }
        .slick-prev:before,
        .slick-next:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
        }
      `}</style>
    </section>
  );
};

export default ExploreAcademicBooks;