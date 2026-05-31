// src/layout/navbar/navbardesktop/Navbar_Desktop_Second_Row.jsx

"use client";

import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { useFont } from "@/contexts/FontContext";
import { NavItem } from "./components/NavItem";
import "./Navbar_Desktop_Second_Row.css";
import "./Navbar_Desktop_Second_Row_Dropdown.css";

const Navbar_Desktop_Second_Row = () => {
  const { theme, themeName } = useTheme();
  const { isRTL } = useRTL();
  const { currentFont } = useFont();

  // Determine if current theme is a dark variant
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Get theme-specific styles
  const getNavbarStyles = () => {
    // If theme has specific navbar styling
    if (theme.navbar?.secondRow) {
      return theme.navbar.secondRow;
    }

    // Default styles based on theme type
    const baseStyles = {
      background: isDarkMode ? '#1a1a1a' : '#f9fafb',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    };

    // Theme-specific overrides
    switch (themeName) {
      case 'cyberpunk':
        return {
          background: '#0a0a0f',
          borderColor: '#00ff9d',
          boxShadow: '0 0 10px rgba(0, 255, 157, 0.1)',
        };
      case 'midnight':
        return {
          background: '#0f172a',
          borderColor: '#1e293b',
        };
      case 'dark':
        return {
          background: '#111827',
          borderColor: '#374151',
        };
      default:
        return baseStyles;
    }
  };

  const navbarStyles = getNavbarStyles();

  return (
    <div
      className="navbar-desktop-second-row transition-all duration-300 ease-in-out"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ 
        fontFamily: currentFont?.family || 'inherit',
        backgroundColor: navbarStyles.background,
        borderTopColor: navbarStyles.borderColor,
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        ...(navbarStyles.boxShadow && { boxShadow: navbarStyles.boxShadow })
      }}
    >
      <div className="navbar-desktop-links-container">
        <NavItem />
      </div>
    </div>
  );
};

export default Navbar_Desktop_Second_Row;