// src/contexts/RTLContext.jsx

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useLanguage } from "./LanguageContext";

const RTLContext = createContext();

export const useRTL = () => {
  const context = useContext(RTLContext);

  if (!context) {
    throw new Error(
      "useRTL must be used within RTLProvider"
    );
  }

  return context;
};

export const RTLProvider = ({
  children,
}) => {
  const { language, isRTL } =
    useLanguage();

  // Direction
  const direction = useMemo(() => {
    return isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  // Apply HTML attributes
  useEffect(() => {
    document.documentElement.dir =
      direction;

    document.documentElement.lang =
      language;

    document.body.dir = direction;

  }, [direction, language]);

  const value = {
    language,
    isRTL,
    isLTR: !isRTL,
    direction,

    // Helpers
    flexDirection: isRTL
      ? "flex-row-reverse"
      : "flex-row",

    textAlign: isRTL
      ? "text-right"
      : "text-left",

    logicalTextAlign: isRTL
      ? "text-end"
      : "text-start",

    dropdownAlign: isRTL
      ? "right-0"
      : "left-0",

    positionStart: isRTL
      ? "right-0"
      : "left-0",

    positionEnd: isRTL
      ? "left-0"
      : "right-0",
  };

  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  );
};

export default RTLProvider;