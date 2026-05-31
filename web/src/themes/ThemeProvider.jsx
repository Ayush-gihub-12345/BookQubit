"use client";

// src/themes/ThemeProvider.jsx
import React, { useState, useEffect } from 'react';
import ThemeContext from './ThemeContext';
import lightTheme from './light';
import darkTheme from './dark';
import forestTheme from './forest';
import cyberpunkTheme from './cyberpunk';
import lavenderTheme from './lavender';
import midnightTheme from './midnight';
import oceanTheme from './ocean';
import roseTheme from './rose';
import sandTheme from './sand';
import sepiaTheme from './sepia';

// Theme registry
const themes = {
  light: lightTheme,
  dark: darkTheme,
  forest: forestTheme,
  cyberpunk: cyberpunkTheme,
  lavender: lavenderTheme,
  midnight: midnightTheme,
  ocean: oceanTheme,
  rose: roseTheme,
  sand: sandTheme,
  sepia: sepiaTheme,
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', currentTheme);
    }
  }, [currentTheme, mounted]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    theme: themes[currentTheme],
    themeName: currentTheme,
    changeTheme,
    availableThemes: Object.keys(themes),
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;