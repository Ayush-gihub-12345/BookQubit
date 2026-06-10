"use client";

import React, { useMemo } from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, theme, themeName, t }) => {
  // Handle different prop patterns (support both old and new)
  const themeObj = theme?.theme || theme;
  const themeNameValue = themeName || theme?.themeName || 'light';
  
  // Don't render if totalPages is invalid or only 1 page
  if (!totalPages || totalPages <= 1 || isNaN(totalPages) || !isFinite(totalPages)) {
    return null;
  }
  
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, totalPages));
  
  const isDarkMode = themeNameValue === 'dark' || 
                     themeNameValue === 'midnight' || 
                     themeNameValue === 'cyberpunk';
  
  // Generate page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
        range.push(i);
      }
    }
    
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });
    
    return rangeWithDots;
  }, [totalPages, safeCurrentPage]);
  
  // Handle page change with validation
  const handlePageChange = (page) => {
    if (typeof page === 'number' && page !== safeCurrentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  return (
    <nav 
      className="flex justify-center items-center gap-2 flex-wrap"
      aria-label={t("pagination.label") || "Pagination navigation"}
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className={`
          px-3 py-2 rounded-lg transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed 
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
          ${themeObj?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'}
          ${themeObj?.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
          hover:${themeObj?.buttonColors?.secondaryButton?.hoverBackground || 'bg-sky-50 dark:bg-sky-900/20'}
        `}
        aria-label={t("pagination.previous") || "Previous page"}
      >
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("pagination.prev") || "Previous"}
        </span>
      </button>
      
      {/* Page Numbers */}
      {pageNumbers.map((pageNum, index) => {
        const isEllipsis = pageNum === '...';
        const isActive = safeCurrentPage === pageNum;
        
        return (
          <button
            key={`${pageNum}-${index}`}
            onClick={() => !isEllipsis && handlePageChange(pageNum)}
            disabled={isEllipsis}
            className={`
              min-w-[40px] px-3 py-2 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
              ${isActive
                ? `${themeObj?.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} text-white shadow-md`
                : isEllipsis
                ? `${themeObj?.textColors?.secondary || 'text-gray-500 dark:text-gray-400'} cursor-default`
                : `${themeObj?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'} 
                   ${themeObj?.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'} 
                   hover:${themeObj?.buttonColors?.secondaryButton?.hoverBackground || 'bg-sky-50 dark:bg-sky-900/20'}`
              }
            `}
            aria-label={isEllipsis 
              ? t("pagination.more") || "More pages" 
              : t("pagination.go_to_page")?.replace("{page}", pageNum) || `Go to page ${pageNum}`
            }
            aria-current={isActive ? "page" : undefined}
          >
            {pageNum}
          </button>
        );
      })}
      
      {/* Next Button */}
      <button
        onClick={() => handlePageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className={`
          px-3 py-2 rounded-lg transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
          ${themeObj?.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'}
          ${themeObj?.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
          hover:${themeObj?.buttonColors?.secondaryButton?.hoverBackground || 'bg-sky-50 dark:bg-sky-900/20'}
        `}
        aria-label={t("pagination.next") || "Next page"}
      >
        <span className="flex items-center gap-1">
          {t("pagination.next") || "Next"}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </nav>
  );
};

export default Pagination;