"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";
import { FaFire, FaEye, FaChartLine, FaArrowRight, FaBook, FaUser, FaFilm } from "react-icons/fa";

const TrendDashboardSlider = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const { currentFont } = useFont();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [sliderKey, setSliderKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [trendingItems, setTrendingItems] = useState([]);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  const booksData = getBooksByLanguage(language);

  useEffect(() => {
    if (booksData && booksData.length > 0) {
      const items = [];
      
      booksData.slice(0, 4).forEach((book, index) => {
        items.push({
          id: `book-${book.id || index}`,
          type: "book",
          title: book.title,
          author: book.author,
          cover: book.imageUrl || book.coverImage || "https://via.placeholder.com/120x180?text=Book",
          trendScore: Math.floor(Math.random() * 30) + 70,
          growth: `+${Math.floor(Math.random() * 50) + 20}%`,
          link: `/books/${book.slug || book.id}`,
          icon: <FaBook className="text-blue-400" />,
        });
      });
      
      const mockAuthors = [
        { name: "Matt Haig", title: "Best-selling Author", trendScore: 96, growth: "+52%", slug: "matt-haig" },
        { name: "James Clear", title: "Productivity Expert", trendScore: 94, growth: "+48%", slug: "james-clear" },
        { name: "Andy Weir", title: "Science Fiction Writer", trendScore: 91, growth: "+42%", slug: "andy-weir" },
      ];
      
      mockAuthors.forEach((author, index) => {
        items.push({
          id: `author-${index}`,
          type: "author",
          title: author.name,
          author: author.title,
          cover: "https://via.placeholder.com/120x180?text=Author",
          trendScore: author.trendScore,
          growth: author.growth,
          link: `/authors/${author.slug}`,
          icon: <FaUser className="text-amber-400" />,
        });
      });
      
      const mockComics = [
        { title: "Spider-Man: Across the Spider-Verse", publisher: "Marvel", trendScore: 97, growth: "+67%", slug: "spider-man" },
        { title: "Batman: The Dark Knight Returns", publisher: "DC", trendScore: 94, growth: "+54%", slug: "batman-dark-knight" },
      ];
      
      mockComics.forEach((comic, index) => {
        items.push({
          id: `comic-${index}`,
          type: "comic",
          title: comic.title,
          author: comic.publisher,
          cover: "https://via.placeholder.com/120x180?text=Comic",
          trendScore: comic.trendScore,
          growth: comic.growth,
          link: `/comics/${comic.slug}`,
          icon: <FaFilm className="text-red-400" />,
        });
      });
      
      setTrendingItems(items.slice(0, 10));
    }
  }, [booksData, language]);

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
    if (windowWidth <= 1280) return 4;
    return 5;
  };

  const sliderSettings = {
    dots: true,
    infinite: trendingItems.length > 1,
    speed: 500,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: windowWidth > 768,
    pauseOnHover: true,
  };

  const getPrimaryGradient = () => {
    return theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-indigo-600';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "book": return "from-blue-500 to-cyan-500";
      case "author": return "from-amber-500 to-orange-500";
      case "comic": return "from-red-500 to-pink-500";
      default: return "from-emerald-500 to-teal-500";
    }
  };

  if (!mounted || trendingItems.length === 0) {
    return null;
  }

  return (
    <section
      className={`relative overflow-hidden ${theme.background?.section || 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'} ${theme.layout?.sectionPadding || 'py-16 px-4'}`}
      style={{ fontFamily: currentFont?.family }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200 dark:bg-sky-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`relative z-10 ${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className={`relative w-20 h-20 rounded-full ${getPrimaryGradient()} flex items-center justify-center shadow-2xl`}>
                <FaFire className="text-white text-3xl animate-bounce" />
              </div>
            </div>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            {t("trend.trending_now") || "Trending Now"}
          </h2>
          <p className={`text-base md:text-lg max-w-2xl mx-auto ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
            {t("trend.discover_whats_hot") || "Discover what's capturing readers' attention worldwide"}
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-20 h-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"></div>
          </div>
        </div>

        {/* Slider */}
        <div className="trend-slider-wrapper relative">
          <Slider key={sliderKey} {...sliderSettings}>
            {trendingItems.map((item, idx) => (
              <div key={item.id} className="px-3 outline-none">
                <Link href={item.link}>
                  <div className="group relative cursor-pointer transform transition-all duration-500 hover:-translate-y-2">
                    {/* Card */}
                    <div className={`relative rounded-2xl overflow-hidden ${theme.background?.bookCoverSide || 'bg-white dark:bg-gray-800'} border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} shadow-lg hover:shadow-2xl transition-all duration-300`}>
                      
                      {/* Trend Badge */}
                      <div className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getTypeColor(item.type)} text-white text-xs font-semibold shadow-lg`}>
                        {item.icon}
                        <span>{t(`trend.${item.type}`) || item.type}</span>
                      </div>

                      {/* Trend Score */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-amber-400 text-xs font-bold">
                        <FaFire size={12} />
                        <span>{item.trendScore}</span>
                      </div>

                      {/* Image */}
                      <div className="relative overflow-hidden h-56">
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className={`text-lg font-bold mb-1 ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} line-clamp-1`}>
                          {item.title}
                        </h3>
                        <p className={`text-sm mb-3 ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} line-clamp-1`}>
                          {item.author}
                        </p>
                        
                        {/* Growth Indicator */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <FaChartLine className="text-emerald-500 text-sm" />
                            <span className="text-xs text-gray-500 dark:text-gray-500">Trending</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-500">
                            {item.growth}
                          </span>
                        </div>

                        {/* View Button */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getPrimaryGradient()} text-white shadow-md hover:shadow-lg transition-all w-full justify-center`}>
                            <span>{t("trend.view_details") || "View Details"}</span>
                            <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/trend_dashboard"
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold ${getPrimaryGradient()} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            {t("trend.view_full_dashboard") || "View Full Dashboard"}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx="true">{`
        .slick-dots {
          bottom: -2.5rem;
        }
        .slick-dots li button:before {
          font-size: 0.5rem;
          color: ${isDarkMode ? "#9ca3af" : "#d1d5db"};
          opacity: 0.5;
          transition: all 0.3s;
        }
        .slick-dots li.slick-active button:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
          opacity: 1;
        }
        .slick-prev:before, .slick-next:before {
          color: ${isDarkMode ? "#60a5fa" : "#3b82f6"};
          font-size: 1.5rem;
        }
        .slick-prev { left: -1.5rem; z-index: 10; }
        .slick-next { right: -1.5rem; z-index: 10; }
        @media (max-width: 768px) {
          .slick-prev:before, .slick-next:before { font-size: 1rem; }
          .slick-prev { left: -1rem; }
          .slick-next { right: -1rem; }
        }
        @media (max-width: 640px) {
          .slick-prev, .slick-next { display: none !important; }
        }
        [dir="rtl"] .slick-prev { left: auto; right: -1.5rem; }
        [dir="rtl"] .slick-next { right: auto; left: -1.5rem; }
        [dir="rtl"] .slick-prev:before { content: '→'; }
        [dir="rtl"] .slick-next:before { content: '←'; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default TrendDashboardSlider;