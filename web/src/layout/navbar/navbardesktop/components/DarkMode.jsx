"use client";

import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";

const DarkMode = () => {
  const { themeName, changeTheme } = useTheme();
  
  // Check if currently in dark mode
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const toggleDarkMode = () => {
    // Toggle between light and dark
    if (isDarkMode) {
      changeTheme('light');
    } else {
      changeTheme('dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        p-2 rounded-full transition-all duration-200 
        hover:scale-110 flex items-center justify-center 
        border ${
          isDarkMode 
            ? "border-gray-600 bg-gray-800 hover:bg-gray-700" 
            : "border-gray-300 bg-gray-100 hover:bg-gray-200"
        }
      `}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <FaSun className="text-yellow-400" size={18} />
      ) : (
        <FaMoon className="text-gray-600" size={18} />
      )}
    </button>
  );
};

export default DarkMode;