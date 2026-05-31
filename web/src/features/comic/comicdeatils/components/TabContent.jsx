"use client";

import React from "react";

const TabContent = ({ activeTab, comic, isDarkMode, theme, t }) => {
  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-3`}>
          {t("comic.story_overview") || "Story Overview"}
        </h3>
        <p className={`text-lg leading-relaxed ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
          {comic.description}
        </p>
      </div>
      {comic.funFact && (
        <div className={`p-6 ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} rounded-xl`}>
          <h4 className={`text-lg font-bold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} mb-2`}>
            💡 {t("comic.did_you_know") || "Did You Know?"}
          </h4>
          <p className={`text-lg leading-relaxed ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
            {comic.funFact}
          </p>
        </div>
      )}
    </div>
  );

  const renderCharacters = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}>
        {t("comic.characters_introduced") || "Characters Introduced"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comic.charactersIntroduced?.map((character, index) => (
          <div key={index} className={`p-4 border ${theme.border?.default || "border-gray-200 dark:border-gray-700"} rounded-lg ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}`}>
            <h4 className={`font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-2`}>
              {character}
            </h4>
            <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("comic.first_appearance") || "First appearance in"} {comic.title}.
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreators = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}>
        {t("comic.creative_team") || "Creative Team"}
      </h3>
      {comic.creators?.editor && (
        <div>
          <h4 className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} mb-2`}>
            {t("comic.editor") || "Editor"}
          </h4>
          <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
            {comic.creators.editor}
          </p>
        </div>
      )}
      <div>
        <h4 className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} mb-3`}>
          {t("comic.writers_artists") || "Writers & Artists"}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comic.creators?.writersArtists?.map((creator, index) => (
            <div key={index} className={`p-3 border ${theme.border?.default || "border-gray-200 dark:border-gray-700"} rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <p className={`font-medium ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
                {creator}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCollectors = () => (
    <div className="space-y-6">
      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-4`}>
        {t("comic.collectors_information") || "Collector's Information"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comic.valueToday && (
          <div className={`p-6 border ${theme.border?.default || "border-gray-200 dark:border-gray-700"} rounded-xl ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}`}>
            <h4 className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} mb-3`}>
              💰 {t("comic.value_sales") || "Value & Sales"}
            </h4>
            <div>
              <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
                {t("comic.current_market_value") || "Current Market Value"}
              </p>
              <p className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
                {comic.valueToday}
              </p>
            </div>
          </div>
        )}
        <div className={`p-6 border ${theme.border?.default || "border-gray-200 dark:border-gray-700"} rounded-xl ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}`}>
          <h4 className={`font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} mb-3`}>
            📊 {t("comic.publication_details") || "Publication Details"}
          </h4>
          <div>
            <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("comic.cover_price") || "Cover Price"}
            </p>
            <p className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
              {comic.coverPrice}
            </p>
          </div>
          <div className="mt-2">
            <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")}`}>
              {t("comic.publisher") || "Publisher"}
            </p>
            <p className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
              {comic.publisher}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case "overview":
      return renderOverview();
    case "characters":
      return renderCharacters();
    case "creators":
      return renderCreators();
    case "collectors":
      return renderCollectors();
    default:
      return null;
  }
};

export default TabContent;