"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { useRTL } from "@/contexts/RTLContext";

const BookSquareCard = ({ book, onTagClick }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const { direction, textAlign, flexDirection } = useRTL();

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Format published year
  const formatPublishedYear = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.getFullYear().toString();
  };

  // Handle image error
  const handleImageError = (e) => {
    const target = e.target;
    target.onerror = null;
    target.src = "/placeholder-book.jpg";
  };

  // Helper to ensure category is always an array
  const getCategoryArray = () => {
    if (!book.category) return [];
    return Array.isArray(book.category) ? book.category : [book.category];
  };

  // Apply font family inline style
  const fontStyle = currentFont?.family ? {
    fontFamily: currentFont.family
  } : {};

  return (
    <article
      dir={direction}
      style={fontStyle}
      className={`
      w-full 
      ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
      ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
      ${theme.shadow?.container || 'shadow-lg'}
      rounded-xl 
      overflow-hidden 
      flex flex-col h-full 
      hover:shadow-2xl hover:-translate-y-1
      transition-all duration-300
      ${theme.ringEffect || ''}
      relative
    `}
    >
      {/* Image with badge */}
      <div
        className={`relative aspect-[3/4] ${isDarkMode ? "bg-gray-800" : "bg-gray-50"} flex items-center justify-center group overflow-hidden`}
      >
        <img
          src={book.imageUrl || "/placeholder-book.jpg"}
          alt={`${t("book.cover_of") || "Cover of"} ${book.title}`}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
        />

        {/* Image overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {book.badge && (
          <span
            className={`
            absolute top-2 right-2 
            bg-gradient-to-r from-sky-600 to-sky-500 
            text-white text-[10px] font-bold px-2 py-1 rounded-full
            shadow-lg
          `}
          >
            {book.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          {/* Title */}
          <h3
            className={`text-base font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} line-clamp-2 mb-1 ${textAlign}`}
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author and Published Year */}
          <div className={`flex items-center gap-2 text-xs mb-2 flex-wrap ${flexDirection}`}>
            <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
              {t("book.by")}
            </span>
            {book.authorId ? (
              <Link
                href={`/authors/${book.authorId}`}
                className={`font-medium ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} hover:underline`}
              >
                {book.author}
              </Link>
            ) : (
              <span className={`font-medium ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'}`}>
                {book.author}
              </span>
            )}
            {book.published && (
              <span className={`text-[10px] ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                ({formatPublishedYear(book.published)})
              </span>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <p
              className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-3 line-clamp-2 ${textAlign}`}
              title={book.description}
            >
              {book.description}
            </p>
          )}

          {/* Category */}
          {book.category && getCategoryArray().length > 0 && (
            <div className="mb-2">
              <span
                className={`text-[10px] font-semibold ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} uppercase tracking-wider`}
              >
                {t("book.category") || "Category"}
              </span>
              <div className={`flex flex-wrap gap-1 mt-1 ${flexDirection}`}>
                {getCategoryArray().map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => onTagClick && onTagClick(cat)}
                    className={`
                      text-[10px] px-2 py-0.5 
                      ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} 
                      ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}
                      hover:${theme.background?.bookCoverSide || 'bg-gray-200 dark:bg-gray-600'}
                      hover:${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
                      rounded-full transition-all duration-200
                      ${theme.border?.button || 'border border-gray-200 dark:border-gray-600'}
                      font-normal
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {book.subjects && book.subjects.length > 0 && (
            <div className="mb-2">
              <span
                className={`text-[10px] font-semibold ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} uppercase tracking-wider`}
              >
                {t("book.subjects") || "Subjects"}
              </span>
              <div className={`flex flex-wrap gap-1 mt-1 ${flexDirection}`}>
                {book.subjects.slice(0, 3).map((subject, i) => (
                  <button
                    key={i}
                    onClick={() => onTagClick && onTagClick(subject)}
                    className={`
                      text-[10px] px-2 py-0.5 
                      ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} 
                      ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}
                      hover:${theme.background?.bookCoverSide || 'bg-gray-200 dark:bg-gray-600'}
                      hover:${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
                      rounded-full transition-all duration-200
                      ${theme.border?.button || 'border border-gray-200 dark:border-gray-600'}
                      font-normal
                    `}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="mb-2">
              <span
                className={`text-[10px] font-semibold ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} uppercase tracking-wider`}
              >
                {t("book.tags") || "Tags"}
              </span>
              <div className={`flex flex-wrap gap-1 mt-1 ${flexDirection}`}>
                {book.tags.slice(0, 3).map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => onTagClick && onTagClick(tag)}
                    className={`
                      text-[10px] px-2 py-0.5 
                      ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} 
                      ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}
                      hover:${theme.background?.bookCoverSide || 'bg-gray-200 dark:bg-gray-600'}
                      hover:${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
                      rounded-full transition-all duration-200
                      ${theme.border?.button || 'border border-gray-200 dark:border-gray-600'}
                      font-normal
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 space-y-2">
          {/* First row - 50/50 buttons */}
          <div className={`grid grid-cols-2 gap-2 ${flexDirection}`}>
            {/* Know More Button - FIXED */}
            <Link href={`/books/${book.slug || book.id}`} className="block">
              <button
                className={`
                w-full py-2 px-1 sm:px-2 
                ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
                ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
                ${theme.buttonColors?.primaryButton?.textColor || 'text-white'}
                rounded-lg 
                shadow-md
                hover:shadow-lg 
                transition-all duration-200 
                font-medium text-xs sm:text-sm
              `}
              >
                {t("book.know_more") || "Know More"}
              </button>
            </Link>

            {book.buttons?.readSummary && (
              <a
                href={book.buttons.readSummary}
                className="block"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className={`
                  w-full py-2 px-1 sm:px-2 
                  ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'}
                  ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
                  ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
                  rounded-lg 
                  shadow-md
                  hover:shadow-lg 
                  transition-all duration-200 
                  font-medium text-xs sm:text-sm
                `}
                >
                  {t("book.summary") || "Summary"}
                </button>
              </a>
            )}
          </div>

          {/* Second row - full width buttons */}
          {book.buttons?.getBook && (
            <a
              href={book.buttons.getBook}
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className={`
                w-full py-2 px-2 sm:px-4 
                ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'}
                ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
                ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
                rounded-lg 
                shadow-md
                hover:shadow-lg 
                transition-all duration-200 
                font-medium text-xs sm:text-sm
              `}
              >
                {t("book.get_book") || "Get Book"}
              </button>
            </a>
          )}

          {book.buttons?.listenAudiobook && (
            <a
              href={book.buttons.listenAudiobook}
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className={`
                w-full py-2 px-2 sm:px-4 
                ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'}
                ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
                ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
                rounded-lg 
                shadow-md
                hover:shadow-lg 
                transition-all duration-200 
                font-medium text-xs sm:text-sm
              `}
              >
                {t("book.audiobook") || "Audiobook"}
              </button>
            </a>
          )}
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent hover:ring-sky-500/50 transition-all duration-300 pointer-events-none" />
    </article>
  );
};

export default BookSquareCard;