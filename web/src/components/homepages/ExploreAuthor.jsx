"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthorsDataByLanguage } from "@/data/authors";

const ExploreAuthor = () => {
  const { theme, themeName } = useTheme();
  const { language, t, isRTL } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Get authors data based on current language
  const [authors, setAuthors] = useState([]);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    setMounted(true);
    
    // Load authors data for current language
    const loadAuthors = () => {
      const authorsData = getAuthorsDataByLanguage(language);
      setAuthors(authorsData);
    };
    
    loadAuthors();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setSliderKey((prev) => prev + 1);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [language]);

  const featuredAuthors = authors.slice(0, 8);

  const getSlidesToShow = () => {
    if (windowWidth <= 768) return 1;
    if (windowWidth <= 1024) return 2;
    return Math.min(featuredAuthors.length, 4);
  };

  const sliderSettings = {
    dots: true,
    infinite: featuredAuthors.length > 1,
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: windowWidth > 768,
    rtl: isRTL, // Enable RTL for slider
  };

  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIC8+PHBhdGggZD0iTTUgMjB2LTJhNyA3IDAgMCAxIDE0IDB2MiIgLz48L3N2Zz4=";

  if (!mounted || authors.length === 0) {
    return null;
  }

  return (
    <section
      className={`${theme.background?.section || ''} ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            className={`text-2xl md:text-3xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}
          >
            {t('authors.pageTitle')}
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} max-w-2xl mx-auto px-4`}
          >
            {t('exploreAuthors.subtitle') || 'Discover our most influential writers and thinkers'}
          </p>
        </div>

        {/* Authors Slider */}
        <div className="mb-12 relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {featuredAuthors.map((author) => (
              <div key={author.id} className="px-2 outline-none h-full">
                <div
                  className={`${theme.background?.bookCoverSide || ''} ${theme.border?.default || ''} ${theme.shadow?.container || ''} p-4 sm:p-6 rounded-xl h-full flex flex-col transition-all hover:shadow-xl`}
                >
                  <div className="flex flex-col items-center h-full">
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                        <img
                          src={author.image || fallbackImage}
                          alt={author.name}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                          }}
                        />
                      </div>
                    </div>

                    <h3
                      className={`text-lg sm:text-xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} text-center mb-2 line-clamp-2`}
                    >
                      {author.name}
                    </h3>

                    <div className={`flex items-center justify-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                        {author.country || t('authors.unknown')}
                      </span>
                      {author.bookCount && (
                        <>
                          <span className={`w-1 h-1 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}`}></span>
                          <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                            {author.bookCount} {author.bookCount === 1 ? t('authors.book') : t('authors.books')}
                          </span>
                        </>
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} text-center line-clamp-3 mb-4 sm:mb-6 flex-grow`}
                    >
                      {author.bio && author.bio.length > 100
                        ? `${author.bio.substring(0, 100)}...`
                        : author.bio || t('authors.noBio') || "No bio available"}
                    </p>

                    <div className={`flex flex-col sm:flex-row gap-2 w-full mt-auto ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Link
                        href={`/authors/${author.slug || author.id}`}
                        className={`flex-1 text-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} transition-all hover:scale-105 min-h-[44px] flex items-center justify-center`}
                      >
                        {t('authors.knowMore')}
                      </Link>
                      <Link
                        href={`/books?author=${encodeURIComponent(author.name)}`}
                        className={`flex-1 text-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} transition-all hover:scale-105 min-h-[44px] flex items-center justify-center`}
                      >
                        {t('authors.viewBooks')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Explore All Authors Button */}
        <div className="text-center">
          <Link
            href="/authors"
            className={`${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} px-6 sm:px-8 py-3 text-base sm:text-lg font-medium inline-flex items-center hover:scale-105 transition-all min-h-[44px] rounded-lg ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {t('authors.exploreAll') || 'Explore All Authors'}
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Custom dot styling */}
      <style jsx="true">{`
        .slick-dots li button:before {
          font-size: 8px;
          color: ${isDarkMode ? "#9ca3af" : "#d1d5db"};
          opacity: 0.5;
        }
        .slick-dots li.slick-active button:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
          opacity: 1;
        }
        .slick-prev:before,
        .slick-next:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
          font-size: 24px;
        }
        .slick-prev {
          ${isRTL ? 'right: -25px; left: auto;' : 'left: -25px;'}
        }
        .slick-next {
          ${isRTL ? 'left: -25px; right: auto;' : 'right: -25px;'}
        }
        .slick-prev:before {
          content: '${isRTL ? '→' : '←'}';
        }
        .slick-next:before {
          content: '${isRTL ? '←' : '→'}';
        }
        @media (max-width: 768px) {
          .slick-dots {
            bottom: -30px;
          }
          .slick-dots li {
            margin: 0 2px;
          }
          .slick-dots li button:before {
            font-size: 6px;
          }
          .slick-prev:before,
          .slick-next:before {
            font-size: 16px;
          }
          .slick-prev {
            ${isRTL ? 'right: -15px;' : 'left: -15px;'}
          }
          .slick-next {
            ${isRTL ? 'left: -15px;' : 'right: -15px;'}
          }
        }
        @media (max-width: 640px) {
          .slick-prev,
          .slick-next {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ExploreAuthor;