// src/contexts/LanguageContext.js

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { allTranslations, rtlLanguages } from "./all_translations";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [translations, setTranslations] = useState(allTranslations.en);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("bookqubit_language");
    if (savedLanguage && allTranslations[savedLanguage]) {
      setLanguage(savedLanguage);
      setTranslations(allTranslations[savedLanguage]);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (allTranslations[browserLang]) {
        setLanguage(browserLang);
        setTranslations(allTranslations[browserLang]);
      }
    }
  }, []);

  // Apply RTL/LTR when language changes
  useEffect(() => {
    if (rtlLanguages.includes(language)) {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = language;
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = language;
    }
  }, [language]);

  const changeLanguage = (lang) => {
    if (allTranslations[lang]) {
      setLanguage(lang);
      setTranslations(allTranslations[lang]);
      localStorage.setItem("bookqubit_language", lang);
      setIsLanguageMenuOpen(false);
    }
  };

  const t = (key, params = {}) => {
    let text = translations[key] || allTranslations.en[key] || key;
    
    // Replace parameters if provided
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
    }
    
    return text;
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", flagEmoji: "🇺🇸", direction: "ltr" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳", flagEmoji: "🇮🇳", direction: "ltr" },
    { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", flagEmoji: "🇵🇰", direction: "rtl" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", flagEmoji: "🇸🇦", direction: "rtl" },
    { code: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩", flagEmoji: "🇧🇩", direction: "ltr" },
    { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", flagEmoji: "🇮🇳", direction: "ltr" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", flagEmoji: "🇮🇳", direction: "ltr" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", flagEmoji: "🇮🇳", direction: "ltr" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", flagEmoji: "🇮🇳", direction: "ltr" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", flagEmoji: "🇮🇳", direction: "ltr" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", flagEmoji: "🇪🇸", direction: "ltr" },
    { code: "ps", name: "Pashto", nativeName: "پښتو", flag: "🇦🇫", flagEmoji: "🇦🇫", direction: "rtl" },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", flagEmoji: "🇨🇳", direction: "ltr" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", flagEmoji: "🇫🇷", direction: "ltr" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", flagEmoji: "🇩🇪", direction: "ltr" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", flagEmoji: "🇮🇹", direction: "ltr" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", flagEmoji: "🇯🇵", direction: "ltr" },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", flagEmoji: "🇰🇷", direction: "ltr" },
    { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", flagEmoji: "🇮🇷", direction: "rtl" },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", flagEmoji: "🇷🇺", direction: "ltr" }
  ];

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    translations,
    isLanguageMenuOpen,
    setIsLanguageMenuOpen,
    toggleLanguageMenu,
    languages,
    isRTL: rtlLanguages.includes(language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;