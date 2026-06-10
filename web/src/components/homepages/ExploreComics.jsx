"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getComicsByLanguage } from "@/data/comics/index";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ExploreComics = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Get comics data based on current language
  const ComicsData = useMemo(() => {
    return getComicsByLanguage(language);
  }, [language]);

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Get featured comics (first 12 or all if less)
  const featuredComics = useMemo(() => {
    if (!ComicsData || ComicsData.length === 0) return [];
    return ComicsData.slice(0, 12);
  }, [ComicsData]);

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
    if (!featuredComics.length) return 1;
    if (windowWidth <= 768) return 1;
    if (windowWidth <= 1024) return 2;
    if (windowWidth <= 1280) return 3;
    return Math.min(featuredComics.length, 4);
  };

  const sliderSettings = {
    dots: true,
    infinite: featuredComics.length > 1,
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

  if (!featuredComics.length) {
    return (
      <section
        className={`${theme.background?.section || ""} ${theme.layout?.sectionPadding || "py-12 px-4"}`}
      >
        <div
          className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto text-center`}
        >
          <div className="animate-pulse">{t("comics.loading") || "Loading comics..."}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${theme.background?.section || ""} ${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}`}
    >
      <div className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto`}>
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            className={`text-2xl md:text-3xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2`}
          >
            {t("comics.explore_comics") || "Explore Comics"}
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} max-w-2xl mx-auto px-4`}
          >
            {t("comics.explore_subtitle") || "Discover legendary issues and timeless adventures"}
          </p>
        </div>

        {/* Comics Slider */}
        <div className="mb-8 relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {featuredComics.map((comic) => (
              <div key={comic.id} className="px-2 outline-none h-full">
                <div
                  className={`${theme.background?.bookCoverSide || ""} ${theme.border?.default || ""} ${theme.shadow?.container || ""} p-3 sm:p-4 rounded-xl hover:shadow-xl h-full flex flex-col transition-all duration-300`}
                >
                  <div className="flex justify-center mb-3">
                    <img
                      src={comic.image || fallbackImage}
                      alt={comic.title}
                      className="h-28 sm:h-40 w-auto object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                  </div>
                  <h3
                    className={`text-base sm:text-lg font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} truncate`}
                  >
                    {comic.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} truncate mb-1`}
                  >
                    {comic.publisher}
                  </p>
                  <p
                    className={`text-xs ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} truncate mb-2`}
                  >
                    {comic.publicationDate}
                  </p>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < Math.floor(comic.rating / 2)
                            ? theme.iconColors?.starFilled || "text-amber-400"
                            : theme.iconColors?.starEmpty || "text-gray-300 dark:text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <Link
                    href={`/comics/${comic.slug}`}
                    className={`block w-full text-center py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} ${theme.buttonColors?.primaryButton?.textColor || "text-white"} transition-all hover:scale-105 mt-auto min-h-[44px] flex items-center justify-center`}
                  >
                    {t("comic.know_more") || "Know More"}
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/comics"
            className={`${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600"} ${theme.buttonColors?.primaryButton?.textColor || "text-white"} ${theme.border?.button || ""} ${theme.shadow?.button || "shadow-md"} px-6 sm:px-8 py-3 text-base sm:text-lg font-medium inline-flex items-center hover:scale-105 transition-all min-h-[44px] rounded-lg`}
          >
            {t("comics.browse_all_comics") || "Browse All Comics"}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
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
          left: -25px;
        }
        .slick-next {
          right: -25px;
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
            left: -15px;
          }
          .slick-next {
            right: -15px;
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

export default ExploreComics;