"use client";

import { FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import "./darkmode_mobile.css";

const DarkMode_Mobile = () => {
  const { theme, themeName, changeTheme } = useTheme();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const toggleDarkMode = () => {
    if (isDarkMode) {
      changeTheme("light");
    } else {
      changeTheme("dark");
    }
  };

  // Safe fallback to background configurations
  const themeVars = {
    "--btn-bg-hover":
      themeName === "light"
        ? "rgba(0, 0, 0, 0.06)"
        : "rgba(255, 255, 255, 0.08)",
    "--icon-color": theme.textColors?.primary || "currentColor",
    "--focus-ring": theme.buttonColors?.primaryButton?.background || "#0ea5e9",
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`darkmode-mobile-btn ${isDarkMode ? "dark" : "light"}`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={themeVars}
    >
      {isDarkMode ? (
        <FaSun className="darkmode-icon sun-icon" size={18} />
      ) : (
        <FaMoon className="darkmode-icon moon-icon" size={17} />
      )}
    </button>
  );
};

export default DarkMode_Mobile;
