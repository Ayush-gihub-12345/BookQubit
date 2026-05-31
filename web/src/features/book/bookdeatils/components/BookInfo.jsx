"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookInfo = ({ book }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const safeArray = (array) => (Array.isArray(array) ? array : []);
  const safeString = (str) => str || (t("book.not_specified") || "Not specified");

  return (
    <div className="space-y-6">
      {/* Title and Author */}
      <div>
        <h1
          className={`text-3xl md:text-4xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}
        >
          {book.title}
        </h1>
        <p className={`text-xl ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
          {t("book.by")}{" "}
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(book.author)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} hover:underline`}
          >
            {book.author}
          </a>
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
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
        <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
          ({book.rating?.toFixed(1) || "0"}/5)
        </span>
      </div>

      {/* Tags */}
      {safeArray(book.tags).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safeArray(book.tags).map((tag, index) => (
            <span
              key={index}
              className={`
                px-3 py-1 rounded-full text-sm 
                ${theme.textColors?.badge || 'text-sky-800 dark:text-sky-400'} 
                ${isDarkMode ? "bg-sky-900/30" : "bg-sky-100"}
              `}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <div
        className={`py-4 border-t border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <p className={`${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} leading-relaxed`}>
          {book.description}
        </p>
      </div>

      {/* Book Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            {t("book.category") || "Category"}
          </h3>
          <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {safeString(book.category)}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            {t("book.format") || "Format"}
          </h3>
          <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {safeString(book.format)}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            {t("book.pages") || "Pages"}
          </h3>
          <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {safeString(book.pageCount)}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            {t("book.published") || "Published"}
          </h3>
          <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {safeString(book.published)}
          </p>
        </div>
        <div>
          <h3 className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            {t("book.isbn") || "ISBN"}
          </h3>
          <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {safeString(book.isbn)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookInfo;