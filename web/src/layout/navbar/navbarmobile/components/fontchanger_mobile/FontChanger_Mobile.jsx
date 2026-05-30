"use client";

import React from "react";
import { FaFont, FaCheck, FaSpinner } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";

const FontChanger_Mobile = ({ onClose }) => {
  const { isRTL: isLanguageRTL } = useLanguage();
  const { direction, isRTL, textAlign } = useRTL();

  const { currentFont, availableFonts, changeFont, isFontLoaded } = useFont();

  const { theme, themeName } = useTheme();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const getSolidColor = (themeClass, fallback) => {
    if (!themeClass || typeof themeClass !== "string") {
      return fallback;
    }
    if (themeClass.includes("gray-900")) return "#111827";
    if (themeClass.includes("gray-800")) return "#1f2937";
    if (themeClass.includes("gray-700")) return "#374151";
    if (themeClass.includes("gray-600")) return "#4b5563";
    if (themeClass.includes("white")) return "#ffffff";
    if (themeClass.includes("gray-100")) return "#f3f4f6";
    if (themeClass.includes("gray-200")) return "#e5e7eb";
    if (themeClass.includes("sky-500")) return "#0ea5e9";
    if (themeClass.includes("sky-400")) return "#38bdf8";
    if (themeClass.includes("sky-600")) return "#0284c7";
    if (themeClass.includes("rose")) return "#f43f5e";
    return fallback;
  };

  const cardBg = getSolidColor(
    theme?.background?.navigationDots,
    isDarkMode ? "#1f2937" : "#ffffff",
  );
  const activeBg = getSolidColor(
    theme?.buttonColors?.primaryButton?.background,
    "#0ea5e9",
  );
  const borderColor = getSolidColor(
    theme?.background?.bookCoverSide,
    isDarkMode ? "#374151" : "#e5e7eb",
  );
  const textPrimary = getSolidColor(
    theme?.textColors?.primary,
    isDarkMode ? "#ffffff" : "#111827",
  );
  const textSecondary = getSolidColor(
    theme?.textColors?.secondary,
    isDarkMode ? "#9ca3af" : "#6b7280",
  );

  const handleFontChange = (fontId) => {
    changeFont(fontId);
    if (onClose) {
      setTimeout(() => onClose(), 300);
    }
  };

  if (!isFontLoaded && availableFonts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner
          className="animate-spin"
          size={30}
          style={{ color: activeBg }}
        />
      </div>
    );
  }

  return (
    <div className="w-full" dir={direction}>
      <div
        className="max-h-[60vh] overflow-y-auto"
        style={{
          paddingRight: isRTL ? "0.25rem" : "0.25rem", // symmetrical small padding
          paddingLeft: isRTL ? "0.25rem" : "0.25rem",
        }}
      >
        <div className="grid grid-cols-2 gap-3" dir={direction}>
          {availableFonts.map((font) => {
            const isActive = currentFont?.id === font.id;

            return (
              <button
                key={font.id}
                onClick={() => handleFontChange(font.id)}
                style={{
                  fontFamily: font.family,
                  backgroundColor: isActive ? activeBg : cardBg,
                  border: `1px solid ${isActive ? activeBg : borderColor}`,
                  boxShadow: isActive
                    ? "0 4px 12px rgba(14,165,233,0.25)"
                    : isDarkMode
                      ? "0 2px 8px rgba(0,0,0,0.35)"
                      : "0 2px 6px rgba(0,0,0,0.08)",
                  transition: "all 0.25s ease",
                }}
                className="flex items-center gap-2 p-3 rounded-xl active:scale-95 w-full"
                dir={direction}
              >
                {/* Icon - always on the left (visual left) */}
                <div className="flex-shrink-0">
                  <div
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : isDarkMode
                          ? "#374151"
                          : "#f3f4f6",
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                  >
                    <FaFont
                      size={13}
                      style={{ color: isActive ? "#ffffff" : textPrimary }}
                    />
                  </div>
                </div>

                {/* Text content - uses RTL-aware text alignment */}
                <div className="flex-1 overflow-hidden">
                  <div
                    style={{
                      color: isActive ? "#ffffff" : textPrimary,
                      fontFamily: font.family,
                      textAlign: isRTL ? "right" : "left",
                    }}
                    className="text-sm font-semibold truncate"
                  >
                    {font.name}
                  </div>
                  <div
                    style={{
                      color: isActive ? "rgba(255,255,255,0.8)" : textSecondary,
                      textAlign: isRTL ? "right" : "left",
                    }}
                    className="text-[10px] truncate"
                  >
                    {isActive
                      ? isLanguageRTL
                        ? "نشط"
                        : "Active"
                      : isLanguageRTL
                        ? "انقر للتطبيق"
                        : "Tap to apply"}
                  </div>
                </div>

                {/* Checkmark - always on the right (visual right) */}
                {isActive && (
                  <FaCheck
                    className="flex-shrink-0"
                    size={12}
                    style={{ color: "#ffffff" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FontChanger_Mobile;
