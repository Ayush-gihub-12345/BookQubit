"use client";

import Link from "next/link";
import {
  FaHome,
  FaBook,
  FaBoxes,
  FaUser,
  FaInfoCircle,
  FaGraduationCap,
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRTL } from "@/contexts/RTLContext";
import "./NavItem_Mobile.css";

const getNavigationConfig = (t) => ({
  items: [
    { name: t("nav.home"), icon: FaHome, path: "/homepages" },
    { name: t("nav.books"), icon: FaBook, path: "/books" },
    {
      name: t("nav.academic_books"),
      icon: FaGraduationCap,
      path: "/academicbooks",
    },
    { name: t("nav.comics"), icon: FaBook, path: "/comics" },
    { name: t("nav.genre_category"), icon: FaBoxes, path: "/category" },
    { name: t("nav.collections"), icon: FaBoxes, path: "/collections" },
    { name: t("nav.authors"), icon: FaUser, path: "/authors" },
    { name: t("nav.publications"), icon: FaBook, path: "/publications" },
    { name: t("nav.about"), icon: FaInfoCircle, path: "/about" },
  ],
});

export const NavItemMobile = ({ 
  onItemClick,
  themeCSSVariables,  // Receive CSS variables from parent
  isDarkMode: parentIsDarkMode  // Receive dark mode flag from parent
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { direction, isRTL } = useRTL();

  // Use parent's dark mode detection or calculate locally
  const isDarkMode = parentIsDarkMode !== undefined 
    ? parentIsDarkMode 
    : (themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk");

  const navigationConfig = getNavigationConfig(t);

  // Use parent's CSS variables or create local ones
  const cssVars = themeCSSVariables || {
    '--sidebar-text-primary': theme.textColors?.primary || (isDarkMode ? '#ffffff' : '#1a1a2e'),
    '--sidebar-text-secondary': theme.textColors?.secondary || (isDarkMode ? '#a0aec0' : '#666666'),
    '--sidebar-text-highlight': theme.textColors?.highlight || '#0ea5e9',
    '--sidebar-hover-bg': theme.background?.hover || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
    '--sidebar-border': theme.border?.default || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
    '--sidebar-icon-active': theme.iconColors?.starFilled || '#0ea5e9',
  };

  const getIconComponent = (Icon) => {
    return <Icon />;
  };

  return (
    <div 
      className="navbar-mobile-nav-items-container" 
      dir={direction}
      style={{
        backgroundColor: `var(--sidebar-bg, ${isDarkMode ? '#1a1a2e' : '#ffffff'})`,
      }}
    >
      {navigationConfig.items.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className="navbar-mobile-item"
          onClick={(e) => {
            e.stopPropagation();
            onItemClick?.();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            textDecoration: "none",
            transition: "all 0.2s ease",
            flexDirection: isRTL ? "row-reverse" : "row",
            color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
            backgroundColor: "transparent",
            cursor: "pointer",
            width: "100%",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `var(--sidebar-hover-bg, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'})`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span
            className="navbar-mobile-item-icon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              marginLeft: isRTL ? 0 : "12px",
              marginRight: isRTL ? "12px" : 0,
              color: `var(--sidebar-icon-active, ${isDarkMode ? '#38bdf8' : '#0ea5e9'})`,
              transition: "transform 0.2s ease",
            }}
          >
            {getIconComponent(item.icon)}
          </span>
          <span
            className="navbar-mobile-item-text"
            style={{
              fontSize: "15px",
              fontWeight: "500",
              textAlign: isRTL ? "right" : "left",
              flex: 1,
              color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
            }}
          >
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default NavItemMobile;