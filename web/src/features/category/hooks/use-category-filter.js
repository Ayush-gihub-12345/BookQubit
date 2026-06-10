"use client";

import { useState, useMemo, useCallback } from "react";

export const useCategoryFilter = (books) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPages, setCurrentPages] = useState({});
  const booksPerPage = 6;

  // Ensure books is an array
  const safeBooks = useMemo(
    () => (Array.isArray(books) ? books : []),
    [books]
  );

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set();
    safeBooks.forEach((book) => {
      if (book?.category) {
        categories.add(book.category);
      }
    });
    return Array.from(categories).sort();
  }, [safeBooks]);

  // Filter books by category and search term
  const booksByCategory = useMemo(() => {
    if (safeBooks.length === 0) {
      return {};
    }

    // Group books by category
    const categoriesObj = safeBooks.reduce((acc, book) => {
      if (book?.category) {
        if (!acc[book.category]) {
          acc[book.category] = [];
        }
        acc[book.category].push(book);
      }
      return acc;
    }, {});

    const filteredCategories = {};

    Object.entries(categoriesObj).forEach(([category, categoryBooks]) => {
      // Check if category matches filters
      const categoryMatchesFilter =
        selectedCategories.length === 0 || selectedCategories.includes(category);
      
      const categoryMatchesSearch = 
        searchTerm === "" || 
        category.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter books within the category by search term
      const filteredBooks = categoryBooks.filter((book) => {
        const bookMatchesSearch =
          searchTerm === "" ||
          (book.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (book.author?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (book.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          category.toLowerCase().includes(searchTerm.toLowerCase());

        return bookMatchesSearch;
      });

      // Only include category if it matches filter and has books (or matches search when no books)
      if (
        categoryMatchesFilter &&
        (filteredBooks.length > 0 || (categoryMatchesSearch && searchTerm !== ""))
      ) {
        filteredCategories[category] = filteredBooks;
      }
    });

    return filteredCategories;
  }, [safeBooks, searchTerm, selectedCategories]);

  // Toggle category selection
  const handleCategoryToggle = useCallback((category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    // Reset all pages when filter changes
    setCurrentPages({});
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategories([]);
    setCurrentPages({});
  }, []);

  // Get paginated books for a specific category
  const getPaginatedBooks = useCallback((category, categoryBooks) => {
    const currentPage = currentPages[category] || 1;
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return categoryBooks.slice(startIndex, endIndex);
  }, [currentPages, booksPerPage]);

  // Get total pages for a specific category
  const getTotalPages = useCallback((bookCount) => {
    if (bookCount === 0) return 1;
    const total = Math.ceil(bookCount / booksPerPage);
    return total > 0 ? total : 1;
  }, [booksPerPage]);

  // Get current page for a specific category
  const getCurrentPage = useCallback((category) => {
    return currentPages[category] || 1;
  }, [currentPages]);

  // Handle page change for a specific category
  const handlePageChange = useCallback((category, page) => {
    setCurrentPages(prev => ({
      ...prev,
      [category]: page
    }));
  }, []);

  // Get total count of books across all filtered categories
  const totalFilteredBooksCount = useMemo(() => {
    return Object.values(booksByCategory).reduce(
      (total, books) => total + books.length,
      0
    );
  }, [booksByCategory]);

  // Get total count of categories after filtering
  const totalFilteredCategoriesCount = useMemo(() => {
    return Object.keys(booksByCategory).length;
  }, [booksByCategory]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" || selectedCategories.length > 0;
  }, [searchTerm, selectedCategories]);

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedCategories,
    allCategories,
    booksByCategory,
    
    // Actions
    handleCategoryToggle,
    clearFilters,
    handlePageChange,
    
    // Helper functions
    getPaginatedBooks,
    getTotalPages,
    getCurrentPage,
    
    // Derived state
    totalFilteredBooksCount,
    totalFilteredCategoriesCount,
    hasActiveFilters,
    
    // Configuration
    booksPerPage
  };
};