"use client";

import React from "react";

const CategoryHeader = ({ 
  title, 
  description, 
  bookCount, 
  showBackButton = false,
  onBackClick,
  theme, 
  themeName, 
  t 
}) => {
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  
  return (
    <div className="mb-8">
      {/* Back Button (Optional) */}
      {showBackButton && (
        <button
          onClick={onBackClick}
          className={`mb-4 inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${theme?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} ${theme?.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} hover:${theme?.buttonColors?.secondaryButton?.hoverBackground || 'bg-sky-50 dark:bg-sky-900/20'}`}
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          {t("category.back_to_categories") || "Back to Categories"}
        </button>
      )}

      {/* Title Section */}
      <div className="text-center">
        <h1 
          className={`text-4xl md:text-5xl font-bold ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}
        >
          {title || t("category.browse_by_category") || "Browse by Category"}
        </h1>
        
        {description && (
          <p className={`text-lg ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-300' : 'text-gray-600')} max-w-3xl mx-auto mb-6`}>
            {description}
          </p>
        )}

        {/* Book Count Badge */}
        {bookCount !== undefined && (
          <div className="inline-flex items-center gap-2">
            <div className={`px-4 py-2 rounded-full ${theme?.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme?.border?.default || 'border border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                {t("category.total_books") || "Total Books"}:{" "}
                <span className={`font-bold ${theme?.textColors?.highlight || 'text-sky-600 dark:text-sky-400'}`}>
                  {bookCount}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Line (Optional) */}
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${theme?.border?.default || 'border-gray-200 dark:border-gray-700'}`}></div>
        </div>
        <div className="relative flex justify-center">
          <div className={`px-4 ${theme?.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')}`}>
            <div className={`w-16 h-1 rounded-full ${theme?.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;