"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFoundState = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center`}
    >
      <div className="text-center">
        <h1
          className={`text-4xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}
        >
          {t("comic.not_found") || "Comic Not Found"}
        </h1>
        <p
          className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-8`}
        >
          {t("comic.not_found_message") ||
            "The comic you're looking for doesn't exist."}
        </p>
        <Link
          href="/comics"
          className={`px-6 py-3 ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white font-semibold rounded-lg inline-block transition-all duration-200 hover:shadow-lg`}
        >
          {t("comic.back_to_comics") || "Back to Comics"}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundState;
