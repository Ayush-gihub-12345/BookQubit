"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/themes/useTheme";
import { FaCheck, FaPalette, FaChevronDown, FaChevronUp } from "react-icons/fa";

const ThemeSwitchDropdown = ({ isInline = false, onThemeChange }) => {
  const { themeName, changeTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const themesList = [
    { key: "light", icon: "☀️", name: "Light" },
    { key: "dark", icon: "🌙", name: "Dark" },
    { key: "forest", icon: "🌲", name: "Forest" },
    { key: "cyberpunk", icon: "🎮", name: "Cyberpunk" },
    { key: "lavender", icon: "🌸", name: "Lavender" },
    { key: "midnight", icon: "🌃", name: "Midnight" },
    { key: "ocean", icon: "🌊", name: "Ocean" },
    { key: "rose", icon: "🌹", name: "Rose" },
    { key: "sand", icon: "🏖️", name: "Sand" },
    { key: "sepia", icon: "📜", name: "Sepia" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
    onThemeChange?.();
  };

  const getButtonClasses = (isActive = false) => {
    if (isActive) {
      return `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white shadow-md`;
    }
    return `
      ${theme.background?.card || (isDarkMode ? "bg-gray-800" : "bg-white")}
      ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
      border ${theme.border?.button || (isDarkMode ? "border-gray-700" : "border-gray-300")}
      hover:scale-105 transition-all duration-300
    `;
  };

  // Inline version (used inside Control)
  if (isInline) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {themesList.map((item) => {
          const isActive = themeName === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleThemeChange(item.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${getButtonClasses(isActive)}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className={`flex-1 text-left text-sm font-medium ${isActive ? "text-white" : (theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900"))}`}>
                {item.name}
              </span>
              {isActive && <FaCheck className="w-3 h-3 text-white" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Standalone dropdown – not used inside Control, but kept for completeness
  const dropdownBg = theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-white");
  const borderColor = theme.border?.default || (isDarkMode ? "border-gray-700" : "border-gray-200");
  const headerBg = theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-50");

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${getButtonClasses(false)}`}>
        <FaPalette size={16} />
        <span className="text-sm font-medium hidden sm:inline">{themesList.find(t => t.key === themeName)?.name || "Light"}</span>
        {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border z-50 overflow-hidden ${dropdownBg} ${borderColor}`}>
          <div className={`px-4 py-3 border-b ${headerBg} ${borderColor}`}>
            <h3 className={`text-sm font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>Choose Theme</h3>
            <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")} mt-1`}>Select your preferred appearance</p>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {themesList.map((item) => {
                const isActive = themeName === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleThemeChange(item.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${getButtonClasses(isActive)}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className={`flex-1 text-left text-sm font-medium ${isActive ? "text-white" : (theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900"))}`}>
                      {item.name}
                    </span>
                    {isActive && <FaCheck className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={`px-4 py-2 border-t text-center ${headerBg} ${borderColor}`}>
            <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-500")}`}>Theme changes apply instantly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitchDropdown;