"use client";

import { useRTL } from "@/contexts/RTLContext";
import { useTheme } from "@/themes/useTheme";
import NavItemMobile from "../../navItem_mobile/NavItem_Mobile";
import "./Silder_Menu_Mobile.css";

const Silder_Menu_Mobile = ({ 
  onItemClick,
  themeCSSVariables,  // Receive CSS variables from parent
  isDarkMode: parentIsDarkMode  // Receive dark mode flag from parent
}) => {
  const { direction } = useRTL();
  const { theme, themeName } = useTheme();

  // Use parent's dark mode detection or calculate locally
  const isDarkMode = parentIsDarkMode !== undefined 
    ? parentIsDarkMode 
    : (themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk");

  // Use parent's CSS variables or create local ones
  const cssVars = themeCSSVariables || {
    '--sidebar-text-primary': theme.textColors?.primary || (isDarkMode ? '#ffffff' : '#1a1a2e'),
    '--sidebar-text-secondary': theme.textColors?.secondary || (isDarkMode ? '#a0aec0' : '#666666'),
    '--sidebar-border': theme.border?.default || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
    '--sidebar-hover-bg': theme.background?.hover || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
    '--sidebar-btn-primary-bg': theme.buttonColors?.primaryButton?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--sidebar-icon-active': theme.iconColors?.starFilled || '#0ea5e9',
  };

  return (
    <div
      className={`silder-menu-mobile transition-colors duration-300`}
      dir={direction}
      style={{
        backgroundColor: `var(--sidebar-bg, ${isDarkMode ? '#1a1a2e' : '#ffffff'})`,
        color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
      }}
    >
      <div
        className="menu-scroller"
        style={{
          // Passes custom scrollbar and active tint variable tokens safely downstream
          "--scrollbar-thumb": theme.border?.default || (isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"),
          "--scrollbar-track": theme.background?.navigationDots || (isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"),
          "--active-border": theme.buttonColors?.primaryButton?.background || "#0ea5e9",
          "--hover-bg": `var(--sidebar-hover-bg, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'})`,
          "--text-primary": `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
          "--text-secondary": `var(--sidebar-text-secondary, ${isDarkMode ? '#a0aec0' : '#666666'})`,
        }}
      >
        <div className="menu-content">
          <NavItemMobile 
            onItemClick={onItemClick}
            themeCSSVariables={cssVars}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Silder_Menu_Mobile;