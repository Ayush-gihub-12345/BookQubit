"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaSearch, FaTimes, FaArrowRight } from "react-icons/fa";
import SearchDropdown from "./components/SearchDropdown";
import SearchResultPage_Desktop from "./components/SearchResultPage_Desktop";

const SearchBar_Desktop = ({
  onSearch,
  placeholder,
  suggestions = [],
  recentSearches: externalRecentSearches,
  onClearRecent,
  maxSuggestions = 8,
  autoFocus = false,
}) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // Following the same pattern as ExploreCollections
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Load recent searches from localStorage on mount
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

  const displayRecentSearches = externalRecentSearches || recentSearches;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = suggestions
        .filter(
          (suggestion) =>
            suggestion.title?.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.author?.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.category?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(filtered);
      setIsOpen(true);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(displayRecentSearches.length > 0);
    }
    setSelectedIndex(-1);
  }, [query, suggestions, displayRecentSearches, maxSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const totalItems = filteredSuggestions.length + displayRecentSearches.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (selectedIndex < filteredSuggestions.length) {
              handleSuggestionClick(filteredSuggestions[selectedIndex]);
            } else {
              const recentIndex = selectedIndex - filteredSuggestions.length;
              if (recentIndex >= 0 && recentIndex < displayRecentSearches.length) {
                handleRecentClick(displayRecentSearches[recentIndex]);
              }
            }
          } else if (query.trim()) {
            handleOpenSearchPage();
          }
          break;
        case "Escape":
          setIsOpen(false);
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredSuggestions, displayRecentSearches, query]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    setIsLoading(true);
    setIsOpen(false);
    setIsFocused(false);

    if (onSearch) {
      onSearch(suggestion.title, suggestion);
    } else {
      const slug = suggestion.slug || suggestion.id;
      router.push(`/books/${slug}`);
    }

    saveToRecentSearches(suggestion.title);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleRecentClick = (recent) => {
    setQuery(recent);
    setIsLoading(true);
    setIsOpen(false);
    setIsFocused(false);
    setShowSearchPage(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleOpenSearchPage = () => {
    if (query.trim()) {
      setIsOpen(false);
      setIsFocused(false);
      setShowSearchPage(true);
      saveToRecentSearches(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const saveToRecentSearches = (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;

    setRecentSearches(prev => {
      const updated = [
        searchTerm,
        ...prev.filter((s) => s !== searchTerm),
      ].slice(0, 10);
      
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      
      if (onClearRecent) {
        onClearRecent(updated);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    if (onClearRecent) onClearRecent([]);
    setIsOpen(false);
  };

  const handleCloseSearchPage = () => {
    setShowSearchPage(false);
  };

  const defaultPlaceholder =
    t("search.placeholder") || "Search for books, authors, or genres...";

  // Following the same theme pattern as ExploreCollections
  const searchBarStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '40px',
    padding: '0 12px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    gap: '8px',
  };

  const searchBarFocusedStyle = {
    borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
    boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.2)'}`,
    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
  };

  // Using theme object properties like in ExploreCollections
  const textColor = theme.textColors?.primary || (isDarkMode ? 'white' : 'gray-900');
  const secondaryTextColor = theme.textColors?.secondary || (isDarkMode ? 'gray-400' : 'gray-600');
  
  // Convert Tailwind classes to inline styles for consistency
  const getTextColorStyle = (colorClass) => {
    if (colorClass.includes('white')) return '#ffffff';
    if (colorClass.includes('gray-900')) return '#111827';
    if (colorClass.includes('gray-400')) return '#9ca3af';
    if (colorClass.includes('gray-600')) return '#4b5563';
    return isDarkMode ? '#f9fafb' : '#111827';
  };

  const inputTextColor = getTextColorStyle(textColor);
  const iconColor = getTextColorStyle(secondaryTextColor);

  return (
    <>
      <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
        <div style={{
          ...searchBarStyle,
          ...(isFocused && searchBarFocusedStyle),
        }}>
          {/* Search Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '16px',
          }}>
            {isLoading ? (
              <div style={{
                width: '14px',
                height: '14px',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                borderTopColor: isDarkMode ? '#60a5fa' : '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}></div>
            ) : (
              <FaSearch
                size={14}
                color={iconColor}
                style={{ opacity: !query && !isFocused ? 0.5 : 1 }}
              />
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || defaultPlaceholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              padding: 0,
              height: '100%',
              background: 'transparent',
              color: inputTextColor,
            }}
            aria-label="Search"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'background 0.2s',
              }}
              aria-label="Clear search"
              type="button"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FaTimes size={12} color={iconColor} />
            </button>
          )}

          {/* Search Submit Button */}
          {query && !isLoading && (
            <button
              onClick={handleOpenSearchPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#3b82f6',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s',
                marginLeft: 'auto',
              }}
              aria-label="Submit search"
              type="button"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FaArrowRight size={10} color="#ffffff" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 50,
            }}
          >
            <SearchDropdown
              query={query}
              filteredSuggestions={filteredSuggestions}
              recentSearches={displayRecentSearches}
              selectedIndex={selectedIndex}
              onSuggestionClick={handleSuggestionClick}
              onRecentClick={handleRecentClick}
              onClearRecent={clearRecentSearches}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>

      {/* Search Results Page */}
      {showSearchPage && (
        <SearchResultPage_Desktop
          initialQuery={query}
          onClose={handleCloseSearchPage}
        />
      )}

      {/* Add spin animation - following the same pattern as ExploreCollections */}
      <style jsx="true">{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default SearchBar_Desktop;