"use client";

import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";

const GoUpButton = () => {
  const { theme, themeName } = useTheme();
  const [showGoUp, setShowGoUp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Show "Go Up" button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setShowGoUp(window.scrollY > 200);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showGoUp) return null;

  // Dynamic button styles based on theme
  const buttonStyles = isHovered
    ? theme.buttonColors?.primaryButton?.hoverBackground || 'bg-gradient-to-r from-sky-700 to-sky-600'
    : theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500';

  return (
    <button
      onClick={goToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-20 right-5 z-50 
        p-3 rounded-full 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        hover:scale-110 active:scale-95
        ${buttonStyles}
        text-white
        focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
        ${isDarkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}
      `}
      title="Go to top"
      aria-label="Scroll to top"
    >
      <FaArrowUp className={`text-lg transition-transform duration-300 ${isHovered ? 'animate-bounce' : ''}`} />
    </button>
  );
};

export default GoUpButton;