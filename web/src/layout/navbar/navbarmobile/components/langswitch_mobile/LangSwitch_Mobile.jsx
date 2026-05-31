"use client";

import React, { useState, useMemo } from "react";
import { FaCheck, FaSearch, FaTimes } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";

const LangSwitch_Mobile = ({ onClose }) => {
  const {
    language,
    languages: originalLanguages,
    setLanguage,
    t,
  } = useLanguage();

  const { theme, themeName } = useTheme();
  const { direction, isRTL, textAlign, positionStart, positionEnd } = useRTL();

  const [searchTerm, setSearchTerm] = useState("");

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // THEME STYLES
  const cardBg = isDarkMode ? "bg-gray-800" : "bg-white";
  const borderClass = isDarkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary =
    theme?.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900");
  const textSecondary =
    theme?.textColors?.secondary ||
    (isDarkMode ? "text-gray-400" : "text-gray-500");
  const activeCard =
    theme?.buttonColors?.primaryButton?.background ||
    "bg-gradient-to-r from-sky-600 to-sky-500";

  // SORT LANGUAGES (priority: en, hi, ur)
  const sortedLanguages = useMemo(() => {
    const priorityCodes = ["en", "hi", "ur"];
    const priorityLangs = [];
    const otherLangs = [];

    originalLanguages.forEach((lang) => {
      if (priorityCodes.includes(lang.code)) {
        priorityLangs.push(lang);
      } else {
        otherLangs.push(lang);
      }
    });

    priorityLangs.sort((a, b) => {
      const aIndex = priorityCodes.indexOf(a.code);
      const bIndex = priorityCodes.indexOf(b.code);
      return aIndex - bIndex;
    });
    otherLangs.sort((a, b) => a.name.localeCompare(b.name));

    return [...priorityLangs, ...otherLangs];
  }, [originalLanguages]);

  // FILTER
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return sortedLanguages;
    const term = searchTerm.toLowerCase();
    return sortedLanguages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(term) ||
        lang.nativeName.toLowerCase().includes(term) ||
        lang.code.toLowerCase().includes(term),
    );
  }, [sortedLanguages, searchTerm]);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setSearchTerm("");
    if (onClose) setTimeout(() => onClose(), 300);
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="w-full" dir={direction}>
      {/* SEARCH BAR */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch
            size={13}
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 ${textSecondary}`}
          />
          <input
            type="text"
            placeholder={t("nav.searchLanguages") || "Search languages..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} py-2.5 text-sm rounded-xl border outline-none transition-all ${cardBg} ${borderClass} ${textPrimary} focus:ring-2 focus:ring-sky-500 ${isRTL ? "text-right" : "text-left"}`}
            style={{ textAlign: isRTL ? "right" : "left" }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 ${textSecondary} hover:opacity-70 transition`}
            >
              <FaTimes size={13} />
            </button>
          )}
        </div>
      </div>

      {/* LANGUAGE LIST */}
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        {filteredLanguages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className={`text-sm ${textSecondary}`}>
              {t("nav.noLanguagesFound") || "No languages found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3" dir={direction}>
            {filteredLanguages.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  // Force flex-direction row (no reverse) for consistent icon placement
                  style={{ display: "flex", flexDirection: "row" }}
                  className={`items-center gap-2 p-3 rounded-xl border transition-all duration-200 active:scale-95 w-full shadow-sm ${
                    isActive
                      ? `${activeCard} border-transparent shadow-lg`
                      : `${cardBg} ${borderClass}`
                  }`}
                >
                  {/* FLAG EMOJI - always first (visual left) */}
                  <div className="flex-shrink-0">
                    <span className="text-xl">
                      {lang.flagEmoji || lang.flag}
                    </span>
                  </div>

                  {/* TEXT INFO - always second, with RTL text alignment */}
                  <div
                    className={`flex-1 overflow-hidden ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <div
                      style={{
                        fontFamily:
                          lang.code === "ur"
                            ? "'Noto Nastaliq Urdu', serif"
                            : "inherit",
                        textAlign: isRTL ? "right" : "left",
                      }}
                      className={`text-sm font-semibold truncate ${isActive ? "text-white" : textPrimary}`}
                    >
                      {lang.nativeName}
                    </div>
                    <div
                      className={`text-[10px] truncate ${isActive ? "text-white/80" : textSecondary} ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {lang.name}
                    </div>
                  </div>

                  {/* CHECKMARK - always last (visual right) */}
                  {isActive && (
                    <FaCheck size={12} className="text-white flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RESULTS COUNT */}
      {filteredLanguages.length > 0 &&
        filteredLanguages.length !== sortedLanguages.length && (
          <div
            className={`mt-3 pt-3 text-center text-xs border-t ${borderClass} ${textSecondary}`}
          >
            {t("nav.showingResults") || "Showing"} {filteredLanguages.length}{" "}
            {t("nav.of") || "of"} {sortedLanguages.length}
          </div>
        )}
    </div>
  );
};

export default LangSwitch_Mobile;
