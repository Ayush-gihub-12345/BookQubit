"use client";

import React, { useState } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const PaginationBooks = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const [localItemsPerPage, setLocalItemsPerPage] = useState(
    itemsPerPage || 12,
  );

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const handleItemsPerPageChange = (value) => {
    setLocalItemsPerPage(value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(value);
    }
  };

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      goToTop();
    }
  };

  // Calculate start and end items
  const startItem =
    totalItems > 0 ? (currentPage - 1) * localItemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * localItemsPerPage, totalItems);

  // Generate page numbers (simplified for mobile)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3; // Show fewer on mobile

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages;
  };

  // Get button styles based on theme
  const getButtonClasses = (isActive = false, isDisabled = false) => {
    if (isDisabled) {
      return `${theme.textColors?.tertiary || 'text-gray-400 dark:text-gray-600'} cursor-not-allowed opacity-40`;
    }
    if (isActive) {
      return `${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white shadow-md`;
    }
    return `${theme.background?.secondary || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} hover:opacity-80 transition-opacity`;
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 py-6 px-2 border-t ${
        theme.border?.default || 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Top section: items per page and item count */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div
          className={`flex items-center gap-2 text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}
        >
          <span>{t("pagination.show") || "Show"}</span>
          <select
            value={localItemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className={`
              text-sm border rounded px-2 py-1 
              focus:outline-none focus:ring-2 focus:ring-sky-500
              transition-all duration-200
              ${theme.background?.input === '#ffffff' ? 'bg-white dark:bg-gray-800' : theme.background?.input || 'bg-white dark:bg-gray-800'}
              ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
              border ${theme.border?.input || 'border-gray-300 dark:border-gray-600'}
            `}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
          <span>{t("pagination.per_page") || "per page"}</span>
        </div>

        <div
          className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}
        >
          {t("pagination.showing") || "Showing"} {startItem}-{endItem} {t("pagination.of") || "of"} {totalItems} {t("pagination.items") || "items"}
        </div>
      </div>

      {/* Pagination buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1">
        {/* First & Previous (hidden on very small screens) */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`
            hidden xs:inline-block px-2 py-1 text-xs rounded 
            transition-all duration-200
            ${getButtonClasses(false, currentPage === 1)}
          `}
        >
          {t("pagination.first") || "First"}
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            px-2 py-1 text-xs rounded 
            transition-all duration-200
            ${getButtonClasses(false, currentPage === 1)}
          `}
        >
          ‹ {t("pagination.prev") || "Prev"}
        </button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => {
            const isActive = page === currentPage;
            const isEllipsis = page === "...";
            
            return (
              <button
                key={index}
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={isEllipsis}
                className={`
                  min-w-[32px] h-8 flex items-center justify-center 
                  text-sm rounded transition-all duration-200
                  ${isEllipsis ? 'cursor-default' : 'cursor-pointer'}
                  ${isActive ? getButtonClasses(true, false) : getButtonClasses(false, false)}
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next & Last */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            px-2 py-1 text-xs rounded 
            transition-all duration-200
            ${getButtonClasses(false, currentPage === totalPages)}
          `}
        >
          {t("pagination.next") || "Next"} ›
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`
            hidden xs:inline-block px-2 py-1 text-xs rounded 
            transition-all duration-200
            ${getButtonClasses(false, currentPage === totalPages)}
          `}
        >
          {t("pagination.last") || "Last"}
        </button>
      </div>

      {/* Go to top button */}
      <button
        onClick={goToTop}
        className={`
          px-6 py-2 text-base font-medium rounded-md 
          transition-all duration-200 hover:opacity-80
          ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'}
          ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
          ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
          ${theme.border?.button || ''}
          ${theme.shadow?.button || 'shadow-md'}
        `}
      >
        ↑ {t("pagination.go_to_top") || "Go to Top"}
      </button>
    </div>
  );
};

export default PaginationBooks;