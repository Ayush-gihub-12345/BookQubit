"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";
import { 
  FaSearch, 
  FaTimes, 
  FaFilter,
  FaSpinner,
  FaStar,
  FaUser,
  FaBookOpen,
  FaTh,
  FaList
} from "react-icons/fa";
import "./SearchPage_Mobile.css";

const SearchPage_Mobile = ({ onClose, initialQuery = "" }) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { language, t } = useLanguage();
  const { currentFont } = useFont();
  
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    authors: [],
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    authors: [],
  });
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("list");

  const inputRef = useRef(null);
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Lock body scroll cleanly without position fixes that bleed layouts or display footers
  useEffect(() => {
    // Lock background scrolling completely 
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Re-enable original scroll context naturally on close
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, []);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Auto focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const books = getBooksByLanguage(language);
    let results = books.filter((book) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        book.title?.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower) ||
        book.category?.toLowerCase().includes(searchLower)
      );
    });

    // Apply filters
    if (selectedFilters.categories.length > 0) {
      results = results.filter(book => 
        selectedFilters.categories.includes(book.category)
      );
    }
    
    if (selectedFilters.authors.length > 0) {
      results = results.filter(book => 
        selectedFilters.authors.includes(book.author)
      );
    }

    // Sort results
    if (sortBy === "title") {
      results.sort((a, b) => a.title?.localeCompare(b.title));
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      results.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    
    setSearchResults(results);
    
    // Extract filter options
    const categories = [...new Set(books.map(book => book.category).filter(Boolean))];
    const authors = [...new Set(books.map(book => book.author).filter(Boolean))];
    setFilterOptions({ categories, authors });
    
    setIsLoading(false);
  }, [language, sortBy, selectedFilters]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) {
        performSearch(query);
        saveToRecentSearches(query);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  const saveToRecentSearches = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 10);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const handleRecentClick = (recent) => {
    setQuery(recent);
    performSearch(recent);
  };

  const handleRemoveRecent = (searchToRemove) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== searchToRemove);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({ categories: [], authors: [] });
    setShowFilters(false);
  };

  const handleBookClick = (book) => {
    const slug = book.slug || book.id;
    router.push(`/books/${slug}`);
    if (onClose) onClose();
  };

  const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};

  const renderStars = (rating = 0) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-xs ${i < Math.floor(rating) 
              ? "text-amber-400" 
              : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`search-page-mobile ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")}`}
      style={{
        ...fontStyle,
        position: 'fixed',
        top: '64px', // Keeps BookQubit Header Navbar visible
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999, // Floating safely over background content and footers
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}
    >
      {/* Search Header Bar */}
      <div className={`search-header ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white")} border-b ${theme.border?.default || "border-gray-200 dark:border-gray-700"}`}>
        <div className="search-header-content" style={{ padding: '12px 16px' }}>
          {/* Search Input Row */}
          <div className="search-input-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Close Button with X Icon */}
            <button
              onClick={onClose}
              className="search-close-btn"
              aria-label="Close search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <FaTimes size={20} />
            </button>
            
            {/* Search Input Custom Styling wrapper Layout context */}
            <div className="search-input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaSearch className="search-input-icon" style={{ position: 'absolute', left: 12, color: '#9ca3af' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books by title, author..."
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                className={`search-input
                  ${theme.background?.input || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                  ${theme.border?.default || "border-gray-200 dark:border-gray-700"}
                  ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
                `}
              />
              {query && (
                <button
                  onClick={handleClearSearch}
                  className="search-clear-btn"
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none' }}
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`search-filter-btn ${showFilters ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FaFilter size={16} />
            </button>
          </div>

          {/* Stats and Sort Row */}
          {!isLoading && query && (
            <div className="search-stats-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
              <div className="search-stats">
                {searchResults.length === 0 ? "No results" : `Showing ${searchResults.length} books`}
              </div>
              {searchResults.length > 0 && (
                <div className="search-controls" style={{ display: 'flex', gap: 12 }}>
                  <div className="search-sort">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ border: 'none', background: 'transparent' }}
                    >
                      <option value="title">Title (A-Z)</option>
                      <option value="rating">Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`filters-panel ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} border-b ${theme.border?.default || "border-gray-200 dark:border-gray-700"}`} style={{ padding: 16 }}>
          <div className="filters-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="filters-title" style={{ fontWeight: 600 }}>Filter Results</span>
            <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer' }}>
              Clear All
            </button>
          </div>
          
          <div className="filters-body">
            {filterOptions.categories.length > 0 && (
              <div className="filter-group" style={{ marginBottom: 12 }}>
                <div className="filter-group-title" style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Category</div>
                <div className="filter-options" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {filterOptions.categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange("categories", cat)}
                      style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, border: 'none' }}
                      className={`filter-option ${selectedFilters.categories.includes(cat) ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Internal Scroll Container for items — isolates scrolling away from structural footprint elements */}
      <div className="search-content" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', WebkitOverflowScrolling: 'touch' }}>
        {/* Loading State */}
        {isLoading && (
          <div className="loading-state" style={{ textAlign: 'center', padding: 40 }}>
            <FaSpinner className="loading-spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <p className="loading-text" style={{ marginTop: 8 }}>Searching...</p>
          </div>
        )}

        {/* Search Results - List View */}
        {!isLoading && query && searchResults.length > 0 && viewMode === "list" && (
          <div className="search-results-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {searchResults.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="search-result-item"
                style={{ display: 'flex', gap: 12, cursor: 'pointer' }}
              >
                <div className="result-cover" style={{ width: 60, height: 80, flexShrink: 0 }}>
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
                      <FaBookOpen className="text-gray-400 text-2xl" />
                    </div>
                  )}
                </div>
                
                <div className="result-info">
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{book.title}</h3>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <FaUser size={10} />
                    <span>{book.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Fallback */}
        {!isLoading && query && searchResults.length === 0 && (
          <div className="no-results" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FaSearch size={32} style={{ color: '#d1d5db', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, margin: 0 }}>No results found</h3>
          </div>
        )}

        {/* Recent Searches Panel */}
        {!isLoading && !query && recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Recent Searches</h3>
              <button onClick={clearAllRecents} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12 }}>
                Clear All
              </button>
            </div>
            <div className="recent-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentSearches.map((recent, index) => (
                <div
                  key={index}
                  className="recent-item"
                  onClick={() => handleRecentClick(recent)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: isDarkMode ? '#222' : '#f9fafb', borderRadius: 6, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 13 }}>{recent}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecent(recent);
                    }}
                    style={{ background: 'none', border: 'none', color: '#9ca3af' }}
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage_Mobile;