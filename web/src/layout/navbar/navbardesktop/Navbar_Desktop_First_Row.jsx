"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaRobot } from "react-icons/fa";

import SearchBar_Desktop from "@/components/searchbar/searchbar_desktop/SearchBar_Desktop";
import UserDropDown from "@/components/auth/Dasktop_Profile_Dropdown";
import Notification_Dropdown from "@/components/notification/Desktop_Notification_Dropdown";
import Control from "./components/Control";
import LangSwitchDropdown from "./components/LangSwitchDropdown";
import DiscoveryDriftBar from "./components/DiscoveryDriftBar";

import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";
import { useLanguage } from "@/contexts/LanguageContext";

import bookqubitLogo from "@/assets/logo/bookqubitlogo.png";
import "./Navbar_Desktop_First_Row.css";

const Navbar_Desktop_First_Row = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const { theme, themeName } = useTheme();
  const { isRTL } = useRTL();
  const { currentFont } = useFont();
  const { language } = useLanguage();

  const authListenerInitialized = useRef(false);
  const searchInitialized = useRef(false);

  // Following the same pattern as ExploreCollections
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Load recent searches from localStorage
  useEffect(() => {
    const loadRecentSearches = () => {
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      setRecentSearches(recent);
    };
    loadRecentSearches();
    
    window.addEventListener("storage", loadRecentSearches);
    return () => window.removeEventListener("storage", loadRecentSearches);
  }, []);

  // Load book suggestions based on language
  useEffect(() => {
    if (!searchInitialized.current) {
      const books = getBooksByLanguage(language);
      const suggestions = books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        slug: book.slug,
        imageUrl: book.imageUrl,
        category: book.category,
        tags: book.tags,
      }));
      setBookSuggestions(suggestions);
      searchInitialized.current = true;
    }
  }, [language]);

  // Apply font to navbar
  useEffect(() => {
    if (currentFont?.family) {
      const navbarElement = document.querySelector(".navbar-desktop-first-row");
      if (navbarElement) {
        navbarElement.style.fontFamily = currentFont.family;
      }
    }
  }, [currentFont]);

  // Listen for Firebase Auth state
  useEffect(() => {
    if (authListenerInitialized.current) return;
    authListenerInitialized.current = true;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      authListenerInitialized.current = false;
    };
  }, []);

  const handleSearch = useCallback((query, selectedBook = null) => {
    if (selectedBook) {
      router.push(`/book/${selectedBook.slug || selectedBook.id}`);
    } 
    else if (query && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [router]);

  const handleClearRecent = useCallback((updatedRecent = []) => {
    setRecentSearches(updatedRecent);
  }, []);

  // Get navbar background - using theme object like ExploreCollections
  const getNavbarBackground = () => {
    if (theme.background?.section) return theme.background.section;
    return isDarkMode ? 'bg-gray-900' : 'bg-white';
  };

  const getBorderColor = () => {
    if (theme.border?.default) return theme.border.default;
    return isDarkMode ? 'border-gray-700' : 'border-gray-200';
  };

  const getTextHighlight = () => {
    if (theme.textColors?.highlight) return theme.textColors.highlight;
    return isDarkMode ? 'text-sky-400' : 'text-sky-600';
  };

  const getTextSecondary = () => {
    if (theme.textColors?.secondary) return theme.textColors.secondary;
    return isDarkMode ? 'text-gray-400' : 'text-gray-500';
  };

  const getButtonBackground = () => {
    if (theme.background?.navigationDots) return theme.background.navigationDots;
    return isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  };

  const getPrimaryButtonBg = () => {
    return theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500";
  };

  const getPrimaryButtonHoverBg = () => {
    return theme.buttonColors?.primaryButton?.hoverBackground || "hover:from-sky-700 hover:to-sky-600";
  };

  const getPrimaryButtonTextColor = () => {
    return theme.buttonColors?.primaryButton?.textColor || "text-white";
  };

  // Skeleton / Loading State
  if (loading) {
    return (
      <div
        className={`navbar-desktop-first-row ${getNavbarBackground()}`}
        dir={isRTL ? "rtl" : "ltr"}
        style={{ 
          fontFamily: currentFont?.family || "inherit",
          borderRadius: 0
        }}
      >
        <div className="navbar-desktop-top-row">
          <Link href="/" className="navbar-desktop-logo">
            <img src={bookqubitLogo.src} alt="BookQubit" className="navbar-desktop-logo-img" />
            <span className={`navbar-desktop-logo-text ${getTextHighlight()}`}>
              BookQubit
            </span>
          </Link>
          <div className="navbar-desktop-search">
            <div className="w-full h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
          <div className="navbar-desktop-user-actions">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`navbar-desktop-first-row ${getNavbarBackground()} ${theme.ringEffect || ""} ${getBorderColor()} border-b`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ 
        fontFamily: currentFont?.family || "inherit",
        borderRadius: 0
      }}
    >
      <div className="navbar-desktop-top-row">
        {/* LOGO */}
        <Link href="/" className="navbar-desktop-logo">
          <img src={bookqubitLogo.src} alt="BookQubit" className="navbar-desktop-logo-img" />
          <span className={`navbar-desktop-logo-text ${getTextHighlight()}`}>
            BookQubit
          </span>
        </Link>

        {/* SEARCH BAR */}
        <div className="navbar-desktop-search">
          <SearchBar_Desktop
            onSearch={handleSearch}
            suggestions={bookSuggestions}
            recentSearches={recentSearches}
            onClearRecent={handleClearRecent}
            placeholder="Search for books, authors, or genres..."
            maxSuggestions={8}
            autoFocus={false}
          />
        </div>

        {/* DISCOVERY / DRIFT SWITCHER */}
        <DiscoveryDriftBar />

        {/* USER ACTIONS */}
        <div className="navbar-desktop-user-actions">
          {/* LANGUAGE SWITCHER */}
          <LangSwitchDropdown />

          {/* CONTROL DROPDOWN */}
          <Control />

          {/* AI TOOL BUTTON */}
          <Link
            href="/bookqubitai"
            className={`navbar-desktop-ai-button ${getBorderColor()} ${getButtonBackground()}`}
            aria-label="AI Assistant"
            title="AI Book Assistant"
            style={{
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FaRobot className={getTextHighlight()} size={18} />
            <span className={`navbar-desktop-ai-text ${getTextHighlight()}`}>
              AI
            </span>
          </Link>

          {/* NOTIFICATION */}
          {user && (
            <div className="navbar-desktop-notification">
              <Notification_Dropdown user={user} />
            </div>
          )}

          {/* LOGIN OR USER MENU */}
          {!user ? (
            <Link
              key="login-button"
              href="/auth/login"
              className={`navbar-desktop-signup-button ${getPrimaryButtonBg()} ${getPrimaryButtonHoverBg()} ${getPrimaryButtonTextColor()}`}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              {isRTL ? "داخل ہوں" : "Login"}
            </Link>
          ) : (
            <UserDropDown key={`user-dropdown-${user.uid}`} user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar_Desktop_First_Row;