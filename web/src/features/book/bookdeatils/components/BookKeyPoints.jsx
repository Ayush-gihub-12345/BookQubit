"use client";

import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const BookKeyPoints = ({ book }) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  if (!theme) return null;

  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const keyPoints = safeArray(book.keyPoints);

  if (keyPoints.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        ${theme.shadow?.container || 'shadow-lg'} 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        p-6 
        ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
        rounded-2xl
      `}
    >
      <h2 className={`text-xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
        {t("book.key_highlights") || "Key Highlights"}
      </h2>
      <ul className="space-y-3">
        {keyPoints.map((point, index) => (
          <li key={index} className="flex items-start gap-3">
            <FaCheckCircle 
              className={`${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} mt-0.5 flex-shrink-0`} 
              size={16} 
            />
            <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookKeyPoints;