"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookCover = ({ book, theme: propTheme }) => {
  // Use prop theme if provided, otherwise use hook
  const { theme: hookTheme, themeName } = useTheme();
  const { t } = useLanguage();
  const theme = propTheme || hookTheme;

  if (!theme) return null;

  const handleImageError = (e) => {
    e.target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMjBIMTIwVjE2MEg4MFYxMjBaIiBmaWxsPSIjOEREQ0RGIi8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWODBINjBWNjBaIiBmaWxsPSIjOEREQ0RGIi8+CjxwYXRoIGQ9Ik00MCAyMjBIMTYwVjI0MEg0MFYyMjBaIiBmaWxsPSIjOEREQ0RGIi8+Cjwvc3ZnPgo=";
    e.target.alt = t("book.cover_not_available") || "Book cover not available";
  };

  return (
    <div
      className={`
        lg:w-1/3 flex justify-center 
        ${theme.background?.bookCoverSide || 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'} 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        p-6 rounded-xl
      `}
    >
      <div className="w-full max-w-xs flex items-center justify-center">
        <img
          src={book.imageUrl}
          alt={`${t("book.cover_of") || "Cover of"} ${book.title}`}
          className="w-full h-80 object-contain rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
          style={{ maxHeight: "600px", minHeight: "500px" }}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default BookCover;