"use client";

import React, { useState, useEffect } from "react";
import BookCard from "./book-card";
import Pagination from "./pagination";

const CategorySection = ({
  category,
  books,
  theme,
  themeName,
  t
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;
  
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  
  // Ensure books is an array
  const safeBooks = Array.isArray(books) ? books : [];
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(safeBooks.length / booksPerPage));
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = safeBooks.slice(startIndex, endIndex);
  
  // Reset to first page when books change (due to filters)
  useEffect(() => {
    setCurrentPage(1);
  }, [safeBooks.length]);
  
  if (safeBooks.length === 0) {
    return (
      <div className={`
        text-center py-8 
        ${theme?.background?.bookCoverSide || 'bg-gray-100 dark:bg-gray-800'} 
        ${theme?.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        rounded-xl mb-8
      `}>
        <p className={`text-lg ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          {t("category.no_books_match") || "No books in this category match your current search."}
        </p>
      </div>
    );
  }
  
  return (
    <section className="mb-16" aria-labelledby={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center">
          <h2 
            id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
            className={`
              text-2xl font-semibold 
              ${theme?.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} 
              mr-4
            `}
          >
            {category}
          </h2>
          <span className={`
            text-sm 
            ${theme?.textColors?.badge || 'text-sky-800 dark:text-sky-400'} 
            ${isDarkMode ? "bg-sky-900/30" : "bg-sky-100"} 
            px-3 py-1 rounded-full
          `}>
            {safeBooks.length} {safeBooks.length === 1 
              ? (t("book.singular") || "book") 
              : (t("book.plural") || "books")
            }
          </span>
        </div>
        
        {/* Show page info ONLY if more than 6 books */}
        {safeBooks.length > booksPerPage && (
          <div className={`text-sm ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            {t("pagination.page") || "Page"} {currentPage} {t("pagination.of") || "of"} {totalPages}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {paginatedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              theme={theme} 
              themeName={themeName} 
              t={t} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className={`text-lg ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            {t("category.no_books_on_page") || "No books to display on this page."}
          </p>
        </div>
      )}
      
      {/* ONLY show pagination if there are MORE than 6 books (more than 1 page) */}
      {safeBooks.length > booksPerPage && (
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            theme={{ theme, themeName }}
            t={t}
          />
        </div>
      )}
    </section>
  );
};

export default CategorySection;