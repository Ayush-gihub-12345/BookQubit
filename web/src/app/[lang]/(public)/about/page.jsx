"use client";

import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  return (
    <main className={`min-h-screen ${theme.background?.section || ''}`}>
      {/* Hero Section */}
      <section className={`${theme.layout?.sectionPadding || 'py-16 px-4 sm:px-6 lg:px-8'} text-center`}>
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${theme.textColors?.primary || ''}`}>
            {t("about.hero.title")}
          </h1>
          <p className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto ${theme.textColors?.secondary || ''}`}>
            {t("about.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${theme.background?.navigationDots || ''}`}>
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme.textColors?.primary || ''}`}>
                {t("about.mission.title")}
              </h2>
              <p className={`text-lg mb-4 ${theme.textColors?.secondary || ''}`}>
                {t("about.mission.text1")}
              </p>
              <p className={`text-lg ${theme.textColors?.secondary || ''}`}>
                {t("about.mission.text2")}
              </p>
            </div>
            <div className={`p-8 rounded-xl ${theme.background?.bookCoverSide || ''} ${theme.shadow?.container || ''}`}>
              <div className={`text-6xl mb-4 text-center ${theme.textColors?.highlight || ''}`}>
                📚
              </div>
              <p className={`text-center italic ${theme.textColors?.secondary || ''}`}>
                {t("about.mission.quote")}
              </p>
              <p className={`text-center mt-2 font-semibold ${theme.textColors?.primary || ''}`}>
                — {t("about.mission.author")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${theme.background?.section || ''}`}>
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${theme.textColors?.primary || ''}`}>
              {t("about.offer.title")}
            </h2>
            <p className={`text-lg ${theme.textColors?.secondary || ''} max-w-2xl mx-auto`}>
              {t("about.offer.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-xl text-center ${theme.background?.bookCoverSide || ''} ${theme.shadow?.container || ''} transition-all hover:scale-105`}>
              <div className={`text-4xl mb-4 ${theme.textColors?.highlight || ''}`}>
                📖
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme.textColors?.primary || ''}`}>
                {t("about.offer.collection.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.offer.collection.text")}
              </p>
            </div>

            <div className={`p-6 rounded-xl text-center ${theme.background?.bookCoverSide || ''} ${theme.shadow?.container || ''} transition-all hover:scale-105`}>
              <div className={`text-4xl mb-4 ${theme.textColors?.highlight || ''}`}>
                🤖
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme.textColors?.primary || ''}`}>
                {t("about.offer.ai.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.offer.ai.text")}
              </p>
            </div>

            <div className={`p-6 rounded-xl text-center ${theme.background?.bookCoverSide || ''} ${theme.shadow?.container || ''} transition-all hover:scale-105`}>
              <div className={`text-4xl mb-4 ${theme.textColors?.highlight || ''}`}>
                🔥
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme.textColors?.primary || ''}`}>
                {t("about.offer.trending.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.offer.trending.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${theme.background?.navigationDots || ''}`}>
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${theme.textColors?.primary || ''}`}>
              {t("about.values.title")}
            </h2>
            <p className={`text-lg ${theme.textColors?.secondary || ''} max-w-2xl mx-auto`}>
              {t("about.values.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-xl ${theme.background?.bookCoverSide || ''}`}>
              <h3 className={`text-xl font-bold mb-3 ${theme.textColors?.highlight || ''}`}>
                {t("about.values.quality.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.values.quality.text")}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme.background?.bookCoverSide || ''}`}>
              <h3 className={`text-xl font-bold mb-3 ${theme.textColors?.highlight || ''}`}>
                {t("about.values.ux.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.values.ux.text")}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme.background?.bookCoverSide || ''}`}>
              <h3 className={`text-xl font-bold mb-3 ${theme.textColors?.highlight || ''}`}>
                {t("about.values.community.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.values.community.text")}
              </p>
            </div>

            <div className={`p-6 rounded-xl ${theme.background?.bookCoverSide || ''}`}>
              <h3 className={`text-xl font-bold mb-3 ${theme.textColors?.highlight || ''}`}>
                {t("about.values.innovation.title")}
              </h3>
              <p className={`${theme.textColors?.secondary || ''}`}>
                {t("about.values.innovation.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${theme.background?.section || ''}`}>
        <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto text-center`}>
          <h2 className={`text-3xl font-bold mb-4 ${theme.textColors?.primary || ''}`}>
            {t("about.join.title")}
          </h2>
          <p className={`text-lg mb-8 ${theme.textColors?.secondary || ''} max-w-2xl mx-auto`}>
            {t("about.join.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 ${theme.buttonColors?.primaryButton?.background || 'bg-blue-600'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:bg-blue-700'} text-white`}
            >
              {t("about.join.contact")}
            </Link>
            <Link
              href="/faq"
              className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 border-2 ${theme.buttonColors?.secondaryButton?.background || 'border-blue-600'} ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-blue-50'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-blue-600'}`}
            >
              {t("about.join.faq")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}