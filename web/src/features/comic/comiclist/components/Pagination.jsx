"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems, 
  onPageChange, 
  onItemsPerPageChange,
  isDarkMode,
  theme
}) => {
  const { t } = useLanguage(); // Get t from hook

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const itemsPerPageOptions = [12, 24, 48, 96];

  if (totalPages === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Items Per Page Selector */}
      <div className="flex justify-end items-center gap-3">
        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {t("pagination.show") || "Show"}:
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            isDarkMode 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {t("pagination.per_page") || "per page"}
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? "hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent"
              : "hover:bg-gray-100 text-gray-700 disabled:hover:bg-transparent"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? "hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent"
              : "hover:bg-gray-100 text-gray-700 disabled:hover:bg-transparent"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-200 ${
                currentPage === page
                  ? (theme?.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500") + " text-white shadow-md"
                  : isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
              } ${page === "..." ? "cursor-default" : ""}`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? "hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent"
              : "hover:bg-gray-100 text-gray-700 disabled:hover:bg-transparent"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? "hover:bg-gray-700 text-gray-300 disabled:hover:bg-transparent"
              : "hover:bg-gray-100 text-gray-700 disabled:hover:bg-transparent"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-8-14l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page Info */}
      <div className="text-center">
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {t("pagination.showing_page") || "Showing page"} {currentPage} {t("pagination.of") || "of"} {totalPages} •{" "}
          {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} {t("pagination.of") || "of"} {totalItems} {t("comics.comics") || "comics"}
        </p>
      </div>
    </div>
  );
};

export default Pagination;