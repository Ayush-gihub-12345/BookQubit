"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const CopyrightFooter = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Dynamic styles
  const rootClasses = `${theme.background?.section || 'bg-white dark:bg-gray-900'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`;
  const containerClasses = `${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto px-4 text-center py-4`;
  const textClasses = `${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} text-sm`;
  const strongClasses = theme.textColors?.primary || 'text-gray-900 dark:text-white';

  return (
    <section className={rootClasses}>
      <div className={containerClasses}>
        <p className={textClasses}>
          &copy; {currentYear} <strong className={strongClasses}>{t("footer.site_name") || "BookQubit"}</strong>. {t("footer.copyright") || "All rights reserved."}
        </p>
      </div>
    </section>
  );
};

export default CopyrightFooter;