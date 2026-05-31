"use client";

import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, theme, isDarkMode }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 mb-4">
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg transition-all ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} hover:${theme.buttonColors?.secondaryButton?.hoverBackground || "bg-sky-50 dark:bg-sky-900/20"}`
          } ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
          aria-label="Previous page"
        >
          ←
        </button>
        
        {getPageNumbers().map((pageNumber, index) => (
          <button
            key={index}
            onClick={() => typeof pageNumber === "number" && onPageChange(pageNumber)}
            disabled={pageNumber === "..."}
            className={`px-4 py-2 rounded-lg transition-all ${
              pageNumber === currentPage
                ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white shadow-md`
                : pageNumber === "..."
                ? "cursor-default"
                : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} hover:${theme.buttonColors?.secondaryButton?.hoverBackground || "bg-sky-50 dark:bg-sky-900/20"} ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
            }`}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === currentPage ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg transition-all ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"} hover:${theme.buttonColors?.secondaryButton?.hoverBackground || "bg-sky-50 dark:bg-sky-900/20"}`
          } ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
          aria-label="Next page"
        >
          →
        </button>
      </nav>
    </div>
  );
};

export default Pagination;