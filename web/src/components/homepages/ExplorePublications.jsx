"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPublicationsDataByLanguage } from "@/data/publications";

const ExplorePublications = () => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { language, t, isRTL } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Get publications data based on current language
  const publicationsData = useMemo(() => {
    return getPublicationsDataByLanguage(language);
  }, [language]);

  // Take first 12 publishers for the slider (or all if less)
  const featuredPublishers = publicationsData.slice(0, 12);

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
    if (windowWidth <= 640) return 1;
    if (windowWidth <= 768) return 2;
    if (windowWidth <= 1024) return 3;
    return Math.min(featuredPublishers.length, 4);
  };

  const sliderSettings = {
    dots: true,
    infinite: featuredPublishers.length > 1,
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: windowWidth > 640,
    rtl: isRTL, // Enable RTL for slider
  };

  // Fallback image for logos (a simple placeholder)
  const fallbackLogo =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80' fill='%23ccc'%3E%3Crect width='120' height='80' /%3E%3Ctext x='10' y='45' fill='%23333' font-size='14'%3ENo logo%3C/text%3E%3C/svg%3E";

  const handleKnowMore = (slug) => {
    if (slug) {
      router.push(`/publications/${slug}`);
    } else {
      console.error("Slug is undefined for publisher");
    }
  };

  if (!mounted) {
    return null;
  }

  if (!featuredPublishers.length) {
    return (
      <section
        className={`${theme.background?.section || ''} ${theme.layout?.sectionPadding || 'py-12 px-4'}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto text-center`}>
          <div className={`animate-pulse ${theme.textColors?.secondary || 'text-gray-600'}`}>
            {t('publications.loading') || "Loading publishers..."}
          </div>
        </div>
      </section>
    );
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
            {t('publications.exploreTitle') || "Explore Publishers"}
          </h2>
          <p
            className={`text-sm md:text-lg ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} max-w-2xl mx-auto px-4`}
          >
            {t('publications.pageDescription') || "Discover renowned publishing houses from around the world"}
          </p>
        </div>

        {/* Publishers Slider */}
        <div className="mb-8 relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {featuredPublishers.map((pub) => (
              <div key={pub.id} className="px-2 outline-none h-full">
                <div
                  className={`${theme.background?.bookCoverSide || ''} ${theme.border?.default || ''} ${theme.shadow?.container || ''} p-3 sm:p-4 rounded-xl hover:shadow-xl h-full flex flex-col transition-all duration-300`}
                >
                  {/* Logo */}
                  <div className="flex justify-center items-center mb-3 h-16 sm:h-20">
                    <img
                      src={pub.logo || fallbackLogo}
                      alt={pub.name}
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackLogo;
                      }}
                    />
                  </div>

                  {/* Name */}
                  <h3
                    className={`text-base sm:text-lg font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} truncate mb-1`}
                  >
                    {pub.name}
                  </h3>

                  {/* Description (truncated) */}
                  <p
                    className={`text-xs sm:text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} line-clamp-2 mb-2`}
                  >
                    {pub.description}
                  </p>

                  {/* Metadata */}
                  <div
                    className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} space-y-1 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <p className="truncate">
                      <span
                        className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}
                      >
                        {t('publications.details.founded')}:
                      </span>{" "}
                      {pub.founded}
                    </p>
                    <p className="truncate">
                      <span
                        className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}
                      >
                        {t('publications.details.headquarters')}:
                      </span>{" "}
                      {pub.headquarters}
                    </p>
                    <p className="truncate">
                      <span
                        className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}
                      >
                        {t('publications.details.type')}:
                      </span>{" "}
                      {pub.type}
                    </p>
                  </div>

                  {/* "Know More" Button */}
                  <button
                    onClick={() => handleKnowMore(pub.slug)}
                    className={`block w-full text-center py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} transition-all hover:scale-105 mt-auto min-h-[44px] flex items-center justify-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {t('authors.knowMore')}
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/publications"
            className={`${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} px-6 sm:px-8 py-3 text-base sm:text-lg font-medium inline-flex items-center hover:scale-105 transition-all min-h-[44px] rounded-lg ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {t('publications.browseAll') || "Browse All Publishers"}
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

export default ExplorePublications;