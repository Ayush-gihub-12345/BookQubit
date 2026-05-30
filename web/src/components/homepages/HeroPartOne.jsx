"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

import { FaBookOpen, FaSearch, FaChartLine, FaLightbulb } from "react-icons/fa";

import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext"; // Import font context

const HeroPartOne = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont(); // Use font context
  const [isMounted, setIsMounted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const words = [
    { text: t("hero.hero_part_one.words.adventure") || "Adventure", color: theme.textColors?.highlight || "text-sky-600" },
    { text: t("hero.hero_part_one.words.knowledge") || "Knowledge", color: "text-blue-600" },
    { text: t("hero.hero_part_one.words.inspiration") || "Inspiration", color: "text-purple-600" },
    { text: t("hero.hero_part_one.words.wisdom") || "Wisdom", color: "text-teal-600" },
    { text: t("hero.hero_part_one.words.imagination") || "Imagination", color: "text-pink-600" },
  ];

  const categories = [
    {
      name: t("hero.hero_part_one.category.science") || "Science",
      icon: <FaSearch className="text-lg" />,
      path: "/category/science",
    },
    {
      name: t("hero.hero_part_one.category.history") || "History",
      icon: <FaBookOpen className="text-lg" />,
      path: "/category/history",
    },
    {
      name: t("hero.hero_part_one.category.finance") || "Finance",
      icon: <FaChartLine className="text-lg" />,
      path: "/category/finance",
    },
    {
      name: t("hero.hero_part_one.category.fiction") || "Fiction",
      icon: <FaLightbulb className="text-lg" />,
      path: "/category/fiction",
    },
  ];

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => {
      clearInterval(interval);
      setIsMounted(false);
    };
  }, [words.length]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const wordVariants = {
    enter: { y: 20, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <section
      className={`relative ${theme.background?.section || ''} py-16 md:py-24 overflow-hidden`}
      style={{ fontFamily: currentFont?.family }} // Apply font to entire section
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto px-4`}>
        <motion.div
          initial="hidden"
          animate={isMounted ? "show" : "hidden"}
          variants={container}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Heading */}
          <motion.h1
            variants={item}
            className={`text-4xl md:text-6xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-6 leading-tight`}
          >
            <span className="relative inline-block">
              <span className="relative z-10">{t("hero.hero_part_one.heading1") || "Discover Your Next"}</span>

              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`absolute bottom-1 left-0 h-3 bg-opacity-30 ${
                  theme.buttonColors?.primaryButton?.background?.split(" ")[0] || 'bg-sky-500'
                } z-0`}
              />
            </span>

            {/* Rotating Words */}
            <br />
            <div className="h-20 md:h-24 relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={wordVariants}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 ${words[currentWordIndex].color}`}
                >
                  {words[currentWordIndex].text}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={item}
            className={`text-lg md:text-xl ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-8 max-w-2xl mx-auto`}
          >
            {t("hero.hero_part_one.subtext") || "Join our community of readers exploring thousands of titles across all genres"}
          </motion.p>

          {/* CountUp */}
          <motion.div
            variants={item}
            className="flex items-center justify-center mb-10"
          >
            <div
              className={`${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.button || 'shadow-md'} bg-white dark:bg-gray-800 px-6 py-3 rounded-lg flex items-center`}
            >
              <div
                className={`${theme.textColors?.highlight || 'text-sky-600'} font-bold text-xl mr-2`}
              >
                {isMounted && (
                  <CountUp 
                    end={5000} 
                    duration={2.5} 
                    prefix={`${t("hero.hero_part_one.over") || "Over "}`} 
                    suffix={t("hero.hero_part_one.plus") || "+"} 
                  />
                )}
              </div>
              <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
                {t("hero.hero_part_one.books_available") || "books available"}
              </span>
            </div>
          </motion.div>

          {/* Explore Books Button */}
          <motion.div variants={item} className="mb-12">
            <Link
              href="/bookslist"
              className={`inline-block ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} ${theme.buttonColors?.primaryButton?.textColor || 'text-white'} font-semibold px-8 py-3 rounded-lg ${theme.border?.button || ''} ${theme.shadow?.button || 'shadow-md'} transition-all duration-300 transform hover:scale-105`}
            >
              {t("hero.hero_part_one.explore_books") || "Explore Books"}
            </Link>
          </motion.div>

          {/* Category Cards */}
          <motion.div
            variants={container}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.map((category) => (
              <motion.div
                key={category.name}
                variants={item}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link
                  href={category.path}
                  className={`flex items-center bg-white dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg ${theme.border?.button || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.button || 'shadow-md'} transition-all duration-300`}
                >
                  <span
                    className={`text-lg mr-2 ${theme.textColors?.highlight || 'text-sky-600'}`}
                  >
                    {category.icon}
                  </span>
                  <span className={`font-medium ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroPartOne;