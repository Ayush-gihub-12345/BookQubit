"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/themes/useTheme";

const ComicHeader = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme, themeName } = useTheme();
  
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  return (
    <button
      onClick={() => router.push("/comics")}
      className={`flex items-center gap-2 mb-6 ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} hover:${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} transition-colors`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {t("comic.back_to_comics") || "Back to Comics"}
    </button>
  );
};

export default ComicHeader;