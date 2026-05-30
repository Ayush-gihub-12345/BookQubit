"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import ComicsMenu from "./ComicsMenu";

const ComicsHeader = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  return (
    <div className="text-center mb-8">
      <h1
        className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}
      >
        {t("comics.collection_title") || "Comics Collection"}
      </h1>
      <p
        className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} max-w-3xl mx-auto mb-8`}
      >
        {t("comics.collection_subtitle") ||
          "Explore the legendary comics that started it all"}
      </p>
      <ComicsMenu />
    </div>
  );
};

export default ComicsHeader;