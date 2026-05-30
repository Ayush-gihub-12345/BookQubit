"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const RelatedBookCard = ({ book }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const handleImageError = (e) => {
    e.target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMjBIMTIwVjE2MEg4MFYxMjBaIiBmaWxsPSIjOEREQ0RGIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWODBINjBWNjBaIiBmaWxsPSIjOEREQ0RGIi8+CjxwYXRoIGQ9Ik00MCAyMjBIMTYwVjI0MEg0MFYyMjBaIiBmaWxsPSIjOEREQ0RGIi8+Cjwvc3ZnPgo=";
    e.target.alt = t("book.cover_not_available") || "Book cover not available";
  };

  return (
    <div
      className={`
        ${theme.shadow?.container || 'shadow-lg'} 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
        overflow-hidden 
        hover:-translate-y-1 
        transition-all duration-300 
        rounded-xl
      `}
    >
      {/* Image Section */}
      <div
        className={`
          p-4 
          ${theme.background?.bookCoverSide || 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'} 
          flex justify-center items-center h-48
        `}
      >
        <img
          src={book.imageUrl}
          alt={`${t("book.cover_of") || "Cover of"} ${book.title}`}
          className="h-full w-full object-contain max-h-40 hover:scale-110 transition-transform duration-300"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3
          className={`font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} line-clamp-2 mb-1`}
        >
          {book.title}
        </h3>
        <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-2`}>
          {t("book.by")} {book.author}
        </p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
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
          <span className={`text-xs ml-1 ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
            ({book.rating?.toFixed(1) || "0"})
          </span>
        </div>

        {/* Button */}
        <div className="flex justify-between items-center">
          <Link
            href={`/books/${book.slug || book.id}`}
            className={`
              px-4 py-2 text-sm rounded-lg 
              ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'}
              ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
              hover:shadow-md 
              hover:scale-105
              active:scale-95
              transition-all duration-200
            `}
          >
            {t("book.details") || "Details"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelatedBookCard;