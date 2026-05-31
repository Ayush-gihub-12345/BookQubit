"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { useFont } from "@/contexts/FontContext";
import Silder_Menu_Mobile from "./components/Silder_Menu_Mobile";
import Slider_Auth_Mobile from "./components/Slider_Auth_Mobile";
import "./silder_mobile.css";

const Silder_Mobile = ({ user = null, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, themeName } = useTheme();
  const { direction } = useRTL();
  const { currentFont } = useFont();

  // Detect dark mode themes
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [isOpen]);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);

  // SOLID BACKGROUND COLORS - No transparency
  const sidebarBgColor = isDarkMode ? "#1a1a2e" : "#ffffff";
  const textPrimaryColor = isDarkMode ? "#ffffff" : "#1a1a2e";
  const textSecondaryColor = isDarkMode ? "#a0aec0" : "#666666";
  const borderColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const hoverBgColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const iconActiveColor = theme.iconColors?.starFilled || "#0ea5e9";

  return (
    <>
      {/* Menu Trigger Button */}
      <button
        className="silder-mobile-trigger-simple"
        onClick={openMenu}
        aria-label="Open menu"
        style={{ color: textPrimaryColor }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`silder-mobile-sidebar ${isOpen ? "open" : ""}`}
        dir={direction}
        style={{
          backgroundColor: sidebarBgColor,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Close Button */}
        <div className="silder-mobile-top-controls">
          <button
            className="header-close-btn-top"
            onClick={closeMenu}
            aria-label="Close menu"
            style={{ color: textSecondaryColor }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Auth Section */}
        <div className="silder-mobile-user-section" style={{ borderBottomColor: borderColor }}>
          <Slider_Auth_Mobile
            user={user}
            onItemClick={closeMenu}
            onLogout={onLogout}
            isDarkMode={isDarkMode}
            textPrimaryColor={textPrimaryColor}
            textSecondaryColor={textSecondaryColor}
            borderColor={borderColor}
            hoverBgColor={hoverBgColor}
            iconActiveColor={iconActiveColor}
          />
        </div>

        {/* Menu Section */}
        <div className="silder-mobile-content-wrapper">
          <div className="silder-mobile-menu-section">
            <Silder_Menu_Mobile
              onItemClick={closeMenu}
              isDarkMode={isDarkMode}
              textPrimaryColor={textPrimaryColor}
              textSecondaryColor={textSecondaryColor}
              borderColor={borderColor}
              hoverBgColor={hoverBgColor}
              iconActiveColor={iconActiveColor}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="silder-mobile-footer" style={{ borderTopColor: borderColor, color: textSecondaryColor }}>
          <p>© 2026. All rights reserved.</p>
          <p className="footer-version">Version 2.0.0</p>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="silder-mobile-overlay"
          onClick={closeMenu}
          style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)" }}
        />
      )}
    </>
  );
};

export default Silder_Mobile;