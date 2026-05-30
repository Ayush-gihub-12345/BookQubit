"use client";

import React from "react";
import TabContent from "./TabContent";
import StarRating from "./StarRating";

const ComicTabs = ({ 
  activeTab, 
  onTabChange, 
  comic, 
  isDarkMode, 
  theme, 
  t 
}) => {
  const tabs = ["overview", "characters", "creators", "collectors"];
  
  const getTabName = (tab) => {
    const tabNames = {
      overview: t("comic.tab.overview") || "Overview",
      characters: t("comic.tab.characters") || "Characters",
      creators: t("comic.tab.creators") || "Creators",
      collectors: t("comic.tab.collectors") || "Collector's Info"
    };
    return tabNames[tab] || tab;
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className={`text-4xl lg:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-2`}>
              {comic.title}
            </h1>
            <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-3`}>
              {t("comic.published_by") || "Published by"} <span className="font-semibold">{comic.publisher}</span>
            </p>
          </div>
          <div className="text-right">
            <StarRating rating={comic.rating} theme={theme} isDarkMode={isDarkMode} />
            <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mt-1`}>
              {comic.publicationDate} • {comic.coverPrice}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`px-4 py-2 border ${theme.border?.default || "border-gray-200 dark:border-gray-700"} font-semibold rounded-full ${isDarkMode ? "bg-sky-900/30 text-sky-400" : "bg-sky-100 text-sky-800"}`}>
            {comic.category} {t("comic.era") || "Era"}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <div className={`flex flex-wrap gap-2 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"} pb-2`}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-6 py-3 font-semibold capitalize rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? `${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white shadow-md`
                  : `${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} hover:${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
              }`}
            >
              {getTabName(tab)}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <TabContent activeTab={activeTab} comic={comic} isDarkMode={isDarkMode} theme={theme} t={t} />
        </div>
      </div>
    </>
  );
};

export default ComicTabs;