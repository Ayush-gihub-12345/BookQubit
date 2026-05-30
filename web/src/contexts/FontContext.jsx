"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  languageFonts,
  getFontsForLanguage,
  loadGoogleFont,
  applyFont,
  getDefaultFontForLanguage,
} from "@/config/fontConfig";

import { useLanguage } from "./LanguageContext";

const FontContext = createContext();

export const useFont = () => {
  const context = useContext(FontContext);

  if (!context) {
    throw new Error("useFont must be used within FontProvider");
  }

  return context;
};

export const FontProvider = ({ children }) => {
  const { language } = useLanguage();

  const [currentFont, setCurrentFont] = useState(null);

  const [availableFonts, setAvailableFonts] = useState([]);

  const [isFontLoaded, setIsFontLoaded] = useState(true);

  // Load fonts for current language
  useEffect(() => {
    const fonts = getFontsForLanguage(language);

    // ADD SYSTEM FONT
    const systemFont = {
      id: "system",
      name: "System Default",
      family:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      category: "system",
    };

    // ADD SYSTEM FONT FIRST
    const updatedFonts = [systemFont, ...fonts];

    setAvailableFonts(updatedFonts);

    // Get saved font
    const savedFontId = localStorage.getItem(
      `bookqubit_font_${language}`
    );

    let selectedFont = updatedFonts.find(
      (f) => f.id === savedFontId
    );

    // Default = system font
    if (!selectedFont) {
      selectedFont = systemFont;
    }

    setCurrentFont(selectedFont);

    // Only load Google fonts if NOT system font
    if (selectedFont.id !== "system") {
      loadGoogleFont(selectedFont);
    }

    applyFont(selectedFont.family);
  }, [language]);

  const changeFont = useCallback(
    (fontId) => {
      const font = availableFonts.find(
        (f) => f.id === fontId
      );

      if (font) {
        setCurrentFont(font);

        // Only load Google font if NOT system
        if (font.id !== "system") {
          loadGoogleFont(font);
        }

        applyFont(font.family);

        localStorage.setItem(
          `bookqubit_font_${language}`,
          fontId
        );

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent("fontChanged", {
            detail: font,
          })
        );
      }
    },
    [availableFonts, language]
  );

  const value = {
    currentFont,
    availableFonts,
    changeFont,
    isFontLoaded,
  };

  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  );
};

export default FontProvider;