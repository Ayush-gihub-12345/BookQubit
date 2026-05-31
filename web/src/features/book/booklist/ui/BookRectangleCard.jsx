"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { useRTL } from "@/contexts/RTLContext";
import "./BookRectangleCard.css";

const BookRectangleCard = ({ book, onTagClick }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const { direction, textAlign, flexDirection } = useRTL();

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Function to render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span
            key={`full-${i}`}
            className={`star-icon ${theme.iconColors?.starFilled || "text-amber-400"}`}
          >
            ★
          </span>
        ))}
        {hasHalfStar && (
          <span
            key="half"
            className={`star-icon ${theme.iconColors?.starFilled || "text-amber-400"}`}
          >
            ½
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span
            key={`empty-${i}`}
            className={`star-icon ${theme.iconColors?.starEmpty || "text-gray-300"}`}
          >
            ★
          </span>
        ))}
        <span className={`rating-value ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Format published year
  const formatPublishedYear = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.getFullYear().toString();
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
    <div
      dir={direction}
      style={fontStyle}
      className={`book-rectangle-card hidden md:flex h-[520px] mx-auto w-[85%] max-w-6xl 
      ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
      ${theme.shadow?.book || "shadow-2xl"} 
      ${theme.background?.section || "bg-white dark:bg-gray-800"}
      overflow-hidden rounded-xl relative ${direction === 'rtl' ? 'rtl' : ''}`}
    >
      {/* Image section - 35% width */}
      <div
        className={`w-[35%] h-full 
        ${theme.background?.bookCoverSide || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"} 
        flex items-center justify-center p-5 flex-shrink-0 relative group`}
      >
        <img
          src={book.imageUrl}
          alt={book.title}
          className="h-full w-full object-contain max-h-full max-w-full transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "/default-book-cover.jpg";
          }}
          loading="lazy"
        />
      </div>

      {/* Details section - 65% width */}
      <div className="w-[65%] p-5 flex flex-col h-full">
        <div className="book-card-content flex-1 overflow-y-auto pr-2">
          {/* Title */}
          <h2
            className={`text-2xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-2 line-clamp-2 ${textAlign}`}
          >
            {book.title}
          </h2>

          {/* Author and year */}
          <div className={`flex flex-wrap items-center gap-2 mb-3 text-sm ${flexDirection}`}>
            <span className={theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}>
              {t("book.by")}
            </span>
            {book.authorId ? (
              <Link
                href={`/authors/${book.authorId}`}
                className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} hover:underline text-sm`}
              >
                {book.author}
              </Link>
            ) : (
              <span className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} text-sm`}>
                {book.author}
              </span>
            )}
            {book.published && (
              <span className={`text-[11px] px-2 py-0.5 ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} rounded-full`}>
                {formatPublishedYear(book.published)}
              </span>
            )}
          </div>

          {/* Rating */}
          {book.rating && (
            <div className="mb-3">{renderStars(book.rating)}</div>
          )}

          {/* Description */}
          <p
            className={`text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} mb-4 line-clamp-3 leading-relaxed ${textAlign}`}
          >
            {book.description}
          </p>

          {/* Metadata tags - Horizontal layout */}
          <div className="space-y-2">
            {/* Category */}
            {book.category && (
              <div className={`flex items-start gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className={`metadata-label ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ${textAlign === 'text-right' ? 'text-right' : 'text-left'}`}>
                  {t("book.category")}:
                </span>
                <div className={`flex flex-wrap gap-1.5 ${flexDirection}`}>
                  {getCategoryArray().map((cat, index) => (
                    <button
                      key={index}
                      onClick={() => onTagClick && onTagClick(cat)}
                      className={`metadata-tag ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} hover:${theme.background?.bookCoverSide || "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            {book.keyPoints && book.keyPoints.length > 0 && (
              <div className={`flex items-start gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className={`metadata-label ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ${textAlign === 'text-right' ? 'text-right' : 'text-left'}`}>
                  {t("book.key_points")}:
                </span>
                <div className={`flex flex-wrap gap-1.5 ${flexDirection}`}>
                  {book.keyPoints.slice(0, 3).map((point, index) => (
                    <button
                      key={index}
                      onClick={() => onTagClick && onTagClick(point)}
                      className={`metadata-tag ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} hover:${theme.background?.bookCoverSide || "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      {point.length > 25 ? `${point.substring(0, 25)}...` : point}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subjects */}
            {book.subjects && book.subjects.length > 0 && (
              <div className={`flex items-start gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className={`metadata-label ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ${textAlign === 'text-right' ? 'text-right' : 'text-left'}`}>
                  {t("book.subjects")}:
                </span>
                <div className={`flex flex-wrap gap-1.5 ${flexDirection}`}>
                  {book.subjects.slice(0, 3).map((subject, index) => (
                    <button
                      key={index}
                      onClick={() => onTagClick && onTagClick(subject)}
                      className={`metadata-tag ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} hover:${theme.background?.bookCoverSide || "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className={`flex items-start gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className={`metadata-label ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ${textAlign === 'text-right' ? 'text-right' : 'text-left'}`}>
                  {t("book.tags")}:
                </span>
                <div className={`flex flex-wrap gap-1.5 ${flexDirection}`}>
                  {book.tags.slice(0, 3).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => onTagClick && onTagClick(tag)}
                      className={`metadata-tag ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-700"} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} hover:${theme.background?.bookCoverSide || "bg-gray-200 dark:bg-gray-600"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons - Fixed at bottom */}
        <div className={`flex flex-col gap-2 pt-3 mt-3 border-t ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
          <div className={`flex gap-2 ${flexDirection}`}>
            <Link href={`/books/${book.slug || book.id}`} className="flex-1">
              <button className="book-action-button book-action-button-primary w-full">
                {t("book.know_more") || "Know More"}
              </button>
            </Link>
            {book.buttons?.getBook && (
              <button
                onClick={() => window.open(book.buttons.getBook, '_blank')}
                className="book-action-button book-action-button-secondary flex-1"
              >
                {t("book.get_book") || "Get Book"}
              </button>
            )}
            {book.buttons?.readSummary && (
              <button
                onClick={() => window.open(book.buttons.readSummary, '_blank')}
                className="book-action-button book-action-button-secondary flex-1"
              >
                {t("book.summary") || "Summary"}
              </button>
            )}
          </div>
          {book.buttons?.listenAudiobook && (
            <button
              onClick={() => window.open(book.buttons.listenAudiobook, '_blank')}
              className="book-action-button book-action-button-secondary w-full"
            >
              {t("book.audiobook") || "Audiobook"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookRectangleCard;