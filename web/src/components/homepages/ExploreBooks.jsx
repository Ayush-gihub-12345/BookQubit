"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBooksByLanguage } from "@/data/books";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import "./ExploreBooks.css"; // Import the CSS file

const ExploreBooks = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const [books, setBooks] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Load books based on language
  useEffect(() => {
    const booksData = getBooksByLanguage(language);
    setBooks(booksData);
  }, [language]);

  const featuredBooks = books.slice(0, 12);

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
    return Math.min(featuredBooks.length, 4);
  };

  const sliderSettings = {
    dots: true,
    infinite: featuredBooks.length > 1,
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: windowWidth > 768,
  };

  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150' fill='%23ccc'%3E%3Crect width='100' height='150' /%3E%3Ctext x='10' y='75' fill='%23333' font-size='14'%3ENo cover%3C/text%3E%3C/svg%3E";

  if (!mounted) {
    return null;
  }

  return (
    <section
      className={`explore-books-section ${theme.background?.section || 'bg-gray-50 dark:bg-gray-900'} ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'}`}
      style={{ fontFamily: currentFont?.family }}
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        <div className="text-center mb-8 md:mb-12">
          <h2
            className={`text-2xl md:text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}
          >
            {t("explore.explore_books") || "Explore Books"}
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} max-w-2xl mx-auto px-4`}
          >
            {t("explore.dive_into") || "Dive into our curated selection of must-read titles"}
          </p>
        </div>

        <div className="mb-8 relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {featuredBooks.map((book) => (
              <div key={book.id} className="px-2 outline-none h-full">
                <div
                  className={`book-card ${theme.background?.bookCoverSide || 'bg-white dark:bg-gray-800'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} p-3 sm:p-4 rounded-xl h-full flex flex-col transition-all duration-300`}
                >
                  <div className="flex justify-center mb-3">
                    <img
                      src={book.imageUrl || fallbackImage}
                      alt={book.title}
                      className="book-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                  </div>
                  <h3
                    className={`book-title ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}
                  >
                    {book.title}
                  </h3>
                  <p
                    className={`book-author ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}
                  >
                    {t("book.by") || "by"} {book.author}
                  </p>
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`star-icon ${
                          i < Math.floor(book.rating || 0)
                            ? theme.iconColors?.starFilled || 'text-amber-400'
                            : theme.iconColors?.starEmpty || 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {/* Know More Button - Points to book details page */}
                  <Link
                    href={`/books/${book.slug || book.id}`}
                    className={`know-more-btn ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'}`}
                  >
                    {t("book.know_more") || "Know More"}
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="text-center">
          {/* Browse All Books Button - Points to bookslist page */}
          <Link
            href="/books"
            className={`browse-all-btn ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'}`}
          >
            {t("explore.browse_all_books") || "Browse All Books"}
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

      {/* Dynamic dot styling based on theme */}
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

export default ExploreBooks;