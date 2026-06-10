"use client";

import { useState, useRef, useEffect } from "react";
import { AiFillControl } from "react-icons/ai";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import ThemeSwitchDropdown from "./control/ThemeSwitchDropdown";
import FontChanger from "./control/FontChanger";
import { useLanguage } from "@/contexts/LanguageContext";

const Control = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("theme");
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { theme, themeName } = useTheme();
  const { language } = useLanguage();

  if (!theme) return null;

  // Check if current language is RTL
  const isRTL = ['ur', 'ar', 'he', 'fa', 'ps', 'sd'].includes(language);

  const closeDropdown = () => setIsOpen(false);

  // Calculate dropdown position to prevent going off-screen
  const calculatePosition = () => {
    if (!buttonRef.current || typeof window === "undefined") return {};
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 384; // w-96 = 384px
    const margin = 10;
    
    let position = {};
    
    if (isRTL) {
      // For RTL languages - align to the LEFT edge of button
      const dropdownLeft = buttonRect.left;
      
      // Check if dropdown would go off the LEFT edge
      if (dropdownLeft - dropdownWidth < 0) {
        // If goes off left edge, align to left edge of viewport
        position.left = `${margin}px`;
        position.right = 'auto';
      } 
      // Check if it would go off the RIGHT edge
      else if (buttonRect.left + dropdownWidth > viewportWidth) {
        position.right = `${margin}px`;
        position.left = 'auto';
      }
      else {
        // Normal RTL positioning - align to left of button
        position.left = '0';
        position.right = 'auto';
      }
    } else {
      // For LTR languages - align to the RIGHT edge of button
      const dropdownRight = buttonRect.right;
      
      // Check if dropdown would go off the RIGHT edge
      if (dropdownRight + dropdownWidth > viewportWidth) {
        // If goes off right edge, align to right edge of viewport
        position.right = `${margin}px`;
        position.left = 'auto';
      }
      // Check if it would go off the LEFT edge
      else if (buttonRect.left - dropdownWidth < 0) {
        position.left = `${margin}px`;
        position.right = 'auto';
      }
      else {
        // Normal LTR positioning - align to right of button
        position.right = '0';
        position.left = 'auto';
      }
    }
    
    return position;
  };

  // Update position when dropdown opens or window resizes
  useEffect(() => {
    if (isOpen) {
      const updatePosition = () => {
        setDropdownPosition(calculatePosition());
      };
      
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen, isRTL, language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine dark mode for conditional classes (same as HeroSection)
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const getButtonClasses = () => `
    flex items-center gap-2 px-4 py-2.5 rounded-xl
    transition-all duration-300 hover:scale-105
    ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-500 bg-transparent"}
    ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
  `;

  const getTabClasses = (tabName) => {
    const base = "flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300";
    const isActive = activeTab === tabName;
    if (isActive) {
      return `${base} border-b-2 border-sky-500 ${theme.textColors?.highlight || (isDarkMode ? "text-sky-400" : "text-sky-600")} ${theme.background?.secondary || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`;
    }
    return `${base} ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} hover:${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`;
  };

  const dropdownBg = theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white");
  const borderColor = theme.border?.default || (isDarkMode ? "border-gray-700" : "border-gray-200");
  const footerBg = theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-50");

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)} 
        className={getButtonClasses()}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <AiFillControl size={18} />
        <span>{isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}</span>
      </button>

      {isOpen && (
        <div 
          className={`absolute mt-3 w-96 rounded-2xl overflow-hidden border shadow-2xl z-50 ${dropdownBg} ${borderColor}`}
          style={{ 
            top: "100%",
            ...dropdownPosition
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Tabs Header */}
          <div className={`flex border-b ${borderColor}`}>
            <button 
              onClick={() => setActiveTab("theme")} 
              className={getTabClasses("theme")}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🎨</span> 
                <span>Theme</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab("font")} 
              className={getTabClasses("font")}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🔤</span> 
                <span>Font</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === "theme" && (
              <ThemeSwitchDropdown 
                isInline={true} 
                onThemeChange={closeDropdown} 
              />
            )}
            {activeTab === "font" && (
              <FontChanger 
                isInline={true} 
                onFontChange={closeDropdown} 
              />
            )}
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 border-t text-center ${footerBg} ${borderColor}`}>
            <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")}`}>
              ⚡ Settings are saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Control;