// src/contexts/LanguageContext.js

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { allTranslations, rtlLanguages } from "./all_translations";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

// Supported languages list (must match middleware)
const supportedLanguages = [
  "en",
  "es",
  "fr",
  "de",
  "ja",
  "zh",
  "hi",
  "ar",
  "ur",
  "bn",
  "pt",
  "ru",
  "it",
  "ko",
  "nl",
  "tr",
  "vi",
  "th",
  "pl",
  "sv",
  "ta",
  "te",
  "ml",
  "kn",
  "mr",
  "ps",
  "fa",
];

export const LanguageProvider = ({ children, initialLanguage = null }) => {
  const [language, setLanguage] = useState("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [translations, setTranslations] = useState(allTranslations.en);
  const router = useRouter();
  const pathname = usePathname();

  // Extract language from URL
  const getLanguageFromURL = () => {
    const segments = pathname?.split("/").filter(Boolean);
    const firstSegment = segments?.[0];
    if (firstSegment && supportedLanguages.includes(firstSegment)) {
      return firstSegment;
    }
    return null;
  };

  // Initialize language from URL, then localStorage, then browser
  useEffect(() => {
    const urlLang = getLanguageFromURL();

    if (urlLang && allTranslations[urlLang]) {
      // URL has valid language - use it
      setLanguage(urlLang);
      setTranslations(allTranslations[urlLang]);
      localStorage.setItem("bookqubit_language", urlLang);
    } else if (initialLanguage && allTranslations[initialLanguage]) {
      // Use initialLanguage from props (from server component)
      setLanguage(initialLanguage);
      setTranslations(allTranslations[initialLanguage]);
      localStorage.setItem("bookqubit_language", initialLanguage);
    } else {
      // Fallback to localStorage or browser language
      const savedLanguage = localStorage.getItem("bookqubit_language");
      if (savedLanguage && allTranslations[savedLanguage]) {
        setLanguage(savedLanguage);
        setTranslations(allTranslations[savedLanguage]);
      } else {
        const browserLang = navigator.language.split("-")[0];
        if (allTranslations[browserLang]) {
          setLanguage(browserLang);
          setTranslations(allTranslations[browserLang]);
          localStorage.setItem("bookqubit_language", browserLang);
        }
      }
    }
  }, [initialLanguage]);

  // Sync URL when language changes (without causing redirect loops)
  useEffect(() => {
    const urlLang = getLanguageFromURL();

    // If URL doesn't have language or has different language, update URL
    if (urlLang !== language && !getLanguageFromURL()) {
      // Get current path without language
      const segments = pathname?.split("/").filter(Boolean) || [];
      const newPath = `/${language}${segments.length ? "/" + segments.join("/") : ""}`;

      // Only redirect if not already on correct path
      if (pathname !== newPath) {
        router.replace(newPath);
      }
    }
  }, [language, pathname, router]);

  // Apply RTL/LTR when language changes
  useEffect(() => {
    if (rtlLanguages.includes(language)) {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = language;
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = language;
    }

    // Add language class to body for CSS targeting
    document.body.classList.remove(
      ...supportedLanguages.map((l) => `lang-${l}`),
    );
    document.body.classList.add(`lang-${language}`);
  }, [language]);

  const changeLanguage = (lang) => {
    if (!allTranslations[lang]) return;

    // Update state
    setLanguage(lang);
    setTranslations(allTranslations[lang]);
    localStorage.setItem("bookqubit_language", lang);
    setIsLanguageMenuOpen(false);

    // Update URL
    const segments = pathname?.split("/").filter(Boolean) || [];

    // Replace first segment if it's a language code
    if (segments.length > 0 && supportedLanguages.includes(segments[0])) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }

    const newPath = "/" + segments.join("/");
    router.push(newPath);
  };

  const t = (key, params = {}) => {
    let text = translations[key] || allTranslations.en[key] || key;

    // Replace parameters if provided
    if (params && typeof params === "object") {
      Object.keys(params).forEach((param) => {
        text = text.replace(`{${param}}`, params[param]);
        text = text.replace(`{{${param}}}`, params[param]);
      });
    }

    return text;
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const languages = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
      flagEmoji: "🇺🇸",
      direction: "ltr",
    },
    {
      code: "hi",
      name: "Hindi",
      nativeName: "हिंदी",
      flag: "🇮🇳",
      flagEmoji: "🇮🇳",
      direction: "ltr",
    },
    {
      code: "ur",
      name: "Urdu",
      nativeName: "اردو",
      flag: "🇵🇰",
      flagEmoji: "🇵🇰",
      direction: "rtl",
    },
    {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      flag: "🇸🇦",
      flagEmoji: "🇸🇦",
      direction: "rtl",
    },
    {
      code: "bn",
      name: "Bangla",
      nativeName: "বাংলা",
      flag: "🇧🇩",
      flagEmoji: "🇧🇩",
      direction: "ltr",
    },
    {
      code: "mr",
      name: "Marathi",
      nativeName: "मराठी",
      flag: "🇮🇳",
      flagEmoji: "🇮🇳",
      direction: "ltr",
    },
    {
      code: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
      flag: "🇮🇳",
      flagEmoji: "🇮🇳",
      direction: "ltr",
    },
    {
      code: "kn",
      name: "Kannada",
      nativeName: "ಕನ್ನಡ",
      flag: "🇮🇳",
      flagEmoji: "🇮🇳",
      direction: "ltr",
    },
    {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      flag: "🇮🇳",
      flagEmoji: "🇮🇳",
      direction: "ltr",
    },
    {
      code: "ml",
      name: "Malayalam",
      nativeName: "മലയാളം",
      flag: "🇮🇳",
      flagEmoji: "🇮🇳",
      direction: "ltr",
    },
    {
      code: "es",
      name: "Spanish",
      nativeName: "Español",
      flag: "🇪🇸",
      flagEmoji: "🇪🇸",
      direction: "ltr",
    },
    {
      code: "ps",
      name: "Pashto",
      nativeName: "پښتو",
      flag: "🇦🇫",
      flagEmoji: "🇦🇫",
      direction: "rtl",
    },
    {
      code: "zh",
      name: "Chinese",
      nativeName: "中文",
      flag: "🇨🇳",
      flagEmoji: "🇨🇳",
      direction: "ltr",
    },
    {
      code: "fr",
      name: "French",
      nativeName: "Français",
      flag: "🇫🇷",
      flagEmoji: "🇫🇷",
      direction: "ltr",
    },
    {
      code: "de",
      name: "German",
      nativeName: "Deutsch",
      flag: "🇩🇪",
      flagEmoji: "🇩🇪",
      direction: "ltr",
    },
    {
      code: "it",
      name: "Italian",
      nativeName: "Italiano",
      flag: "🇮🇹",
      flagEmoji: "🇮🇹",
      direction: "ltr",
    },
    {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
      flag: "🇯🇵",
      flagEmoji: "🇯🇵",
      direction: "ltr",
    },
    {
      code: "ko",
      name: "Korean",
      nativeName: "한국어",
      flag: "🇰🇷",
      flagEmoji: "🇰🇷",
      direction: "ltr",
    },
    {
      code: "fa",
      name: "Persian",
      nativeName: "فارسی",
      flag: "🇮🇷",
      flagEmoji: "🇮🇷",
      direction: "rtl",
    },
    {
      code: "ru",
      name: "Russian",
      nativeName: "Русский",
      flag: "🇷🇺",
      flagEmoji: "🇷🇺",
      direction: "ltr",
    },
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
    getLanguageFromURL, // Expose helper
    supportedLanguages, // Expose list
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
