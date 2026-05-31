"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";

const OtherEditions = ({ book }) => {
  const { theme, themeName } = useTheme();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  if (!book.otherEditions?.length) return null;

  return (
    <div className="mb-16">
      <h3 className={`text-2xl font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
        Other Editions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {book.otherEditions.map((edition, index) => (
          <div
            key={index}
            className={`
              ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
              ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
              ${theme.shadow?.container || 'shadow-lg'} 
              rounded-xl p-4 
              hover:shadow-xl 
              hover:-translate-y-1
              transition-all duration-300
            `}
          >
            <h4 className={`font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
              {edition.edition} Edition
            </h4>
            <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mt-1`}>
              Publisher: {edition.publisher}
            </p>
            <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
              Year: {edition.year}
            </p>
            <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mb-3`}>
              ISBN: {edition.isbn}
            </p>
            <a
              href={edition.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-block px-4 py-2 
                ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
                ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
                text-white 
                rounded-lg text-sm font-medium 
                hover:shadow-md 
                hover:scale-105
                active:scale-95
                transition-all duration-200
              `}
            >
              View Edition
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherEditions;