"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/themes/useTheme";
import { useFont } from "@/contexts/FontContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaCheck,
  FaFont,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
} from "react-icons/fa";

const FontChanger = ({ isInline = false, onFontChange }) => {
  const { theme, themeName } = useTheme();

  const {
    currentFont,
    availableFonts,
    changeFont,
    isFontLoaded,
  } = useFont();

  const { language, isRTL } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const handleFontChange = (fontId) => {
    changeFont(fontId);

    setIsOpen(false);

    onFontChange?.();
  };

  const getButtonClasses = (isActive = false) => {
    if (isActive) {
      return `${
        theme.buttonColors?.primaryButton?.background ||
        "bg-gradient-to-r from-sky-600 to-sky-500"
      } text-white shadow-md`;
    }

    return `
      ${
        theme.background?.card ||
        (isDarkMode ? "bg-gray-800" : "bg-white")
      }
      ${
        theme.textColors?.primary ||
        (isDarkMode ? "text-white" : "text-gray-900")
      }
      border
      ${
        theme.border?.button ||
        (isDarkMode
          ? "border-gray-700"
          : "border-gray-300")
      }
      hover:scale-105 transition-all duration-300
    `;
  };

  // Loading state
  if (!isFontLoaded && availableFonts.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <FaSpinner
          className="animate-spin text-sky-500"
          size={24}
        />
      </div>
    );
  }

  // INLINE VERSION
  if (isInline) {
    return (
      <div className="space-y-3">
        {/* 2 ITEMS PER ROW */}
        <div className="grid grid-cols-2 gap-2">
          {availableFonts.map((font) => {
            const isActive =
              currentFont?.id === font.id;

            return (
              <button
                key={font.id}
                onClick={() =>
                  handleFontChange(font.id)
                }
                style={{
                  fontFamily: font.family,
                }}
                className={`
                  flex items-center gap-2 p-3 rounded-xl
                  transition-all duration-200
                  hover:scale-[1.02]

                  ${
                    isActive
                      ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md"
                      : isDarkMode
                      ? "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700"
                      : "bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100"
                  }

                  ${
                    isRTL
                      ? "flex-row-reverse text-right"
                      : "flex-row text-left"
                  }
                `}
              >
                {/* ICON */}
                <div
                  className="
                    flex-shrink-0
                    w-10 h-10 rounded-lg
                    bg-gradient-to-r from-sky-400 to-blue-500
                    flex items-center justify-center
                  "
                >
                  <FaFont
                    className="text-white"
                    size={16}
                  />
                </div>

                {/* FONT NAME */}
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-sm truncate">
                    {font.name}
                  </div>
                </div>

                {/* ACTIVE CHECK */}
                {isActive && (
                  <FaCheck
                    size={14}
                    className="flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // DROPDOWN VERSION
  const dropdownBg =
    theme.background?.section ||
    (isDarkMode ? "bg-gray-900" : "bg-white");

  const borderColor =
    theme.border?.default ||
    (isDarkMode
      ? "border-gray-700"
      : "border-gray-200");

  const headerBg =
    theme.background?.navigationDots ||
    (isDarkMode ? "bg-gray-800" : "bg-gray-50");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2
          rounded-lg transition-all duration-200
          hover:scale-105
          ${getButtonClasses(false)}
        `}
      >
        <FaFont size={16} />

        <span className="text-sm font-medium hidden sm:inline">
          {currentFont?.name || "Font"}
        </span>

        {isOpen ? (
          <FaChevronUp size={12} />
        ) : (
          <FaChevronDown size={12} />
        )}
      </button>

      {isOpen && (
        <div
          className={`
            absolute
            ${isRTL ? "left-0" : "right-0"}
            mt-2 w-96 rounded-xl shadow-2xl
            border z-50 overflow-hidden
            ${dropdownBg}
            ${borderColor}
          `}
          style={{
            [isRTL ? "left" : "right"]: 0,
          }}
        >
          {/* HEADER */}
          <div
            className={`
              px-4 py-3 border-b
              ${headerBg}
              ${borderColor}
            `}
          >
            <h3
              className={`text-sm font-semibold ${
                theme.textColors?.primary ||
                (isDarkMode
                  ? "text-white"
                  : "text-gray-900")
              }`}
            >
              Choose Font
            </h3>
          </div>

          {/* FONT LIST */}
          <div className="p-3 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {availableFonts.map((font) => {
                const isActive =
                  currentFont?.id === font.id;

                return (
                  <button
                    key={font.id}
                    onClick={() =>
                      handleFontChange(font.id)
                    }
                    style={{
                      fontFamily: font.family,
                    }}
                    className={`
                      flex items-center gap-2 p-3 rounded-xl
                      transition-all duration-200
                      hover:scale-[1.02]

                      ${
                        isActive
                          ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md"
                          : isDarkMode
                          ? "bg-gray-800 text-white border border-gray-700 hover:bg-gray-700"
                          : "bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100"
                      }

                      ${
                        isRTL
                          ? "flex-row-reverse text-right"
                          : "flex-row text-left"
                      }
                    `}
                  >
                    {/* ICON */}
                    <div
                      className="
                        flex-shrink-0
                        w-10 h-10 rounded-lg
                        bg-gradient-to-r from-sky-400 to-blue-500
                        flex items-center justify-center
                      "
                    >
                      <FaFont
                        className="text-white"
                        size={16}
                      />
                    </div>

                    {/* FONT NAME */}
                    <div className="flex-1 overflow-hidden">
                      <div className="font-semibold text-sm truncate">
                        {font.name}
                      </div>
                    </div>

                    {/* CHECK */}
                    {isActive && (
                      <FaCheck
                        size={14}
                        className="flex-shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div
            className={`
              px-4 py-2 border-t text-center
              ${headerBg}
              ${borderColor}
            `}
          >
            <p
              className={`text-xs ${
                theme.textColors?.secondary ||
                (isDarkMode
                  ? "text-gray-400"
                  : "text-gray-500")
              }`}
            >
              Saved Automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontChanger;