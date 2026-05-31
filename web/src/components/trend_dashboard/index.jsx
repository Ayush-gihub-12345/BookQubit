"use client";

import React, { useState } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { FaBook, FaUser, FaFilm, FaUsers, FaChartLine, FaFire, FaArrowRight } from "react-icons/fa";
import BookTrendDashboard from "./book_trend_dashboard/book_trend_dashboard";
import AuthorTrendDashboard from "./author_trend_dashboard/author_trend_dashboard";
import ComicTrendDashboard from "./comic_trend_dashboard/comic_trend_dashboard";
import BookwormTrendDashboard from "./bookworn_trend_dashboard/bookworn_trend_dashboard";

const TrendDashboard = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const [activeTab, setActiveTab] = useState("books");

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const tabs = [
    { id: "books", label: t("trend.tab_books") || "Books", icon: <FaBook />, component: BookTrendDashboard },
    { id: "authors", label: t("trend.tab_authors") || "Authors", icon: <FaUser />, component: AuthorTrendDashboard },
    { id: "comics", label: t("trend.tab_comics") || "Comics", icon: <FaFilm />, component: ComicTrendDashboard },
    { id: "bookworms", label: t("trend.tab_bookworms") || "Bookworms", icon: <FaUsers />, component: BookwormTrendDashboard },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  const getPrimaryGradient = () => {
    return theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-indigo-600';
  };

  const getContainerBackground = () => {
    return theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100');
  };

  const getCardBackground = () => {
    return theme.background?.card || (isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm');
  };

  return (
    <div
      className={`min-h-screen ${getContainerBackground()} ${theme.layout?.sectionPadding || 'py-8 px-4 sm:px-6 lg:px-8'}`}
      style={{ fontFamily: currentFont?.family }}
    >
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto`}>
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className={`relative w-20 h-20 rounded-full ${getPrimaryGradient()} flex items-center justify-center shadow-2xl`}>
                <FaChartLine className="text-white text-3xl" />
              </div>
            </div>
          </div>
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
            Trend Dashboard
          </h1>
          <p className={`text-base md:text-lg max-w-2xl mx-auto ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
            Track what's trending in the literary world - from bestselling books to rising authors
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-24 h-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Trending Books", value: "2,847", change: "+23%", icon: <FaBook />, color: "from-blue-500 to-cyan-500" },
            { label: "Active Readers", value: "15.2K", change: "+18%", icon: <FaUsers />, color: "from-emerald-500 to-teal-500" },
            { label: "New Authors", value: "342", change: "+12%", icon: <FaUser />, color: "from-amber-500 to-orange-500" },
            { label: "Trend Score", value: "94.7", change: "+5%", icon: <FaFire />, color: "from-red-500 to-pink-500" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${getCardBackground()} rounded-2xl p-5 border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                {stat.value}
              </h3>
              <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? `${getPrimaryGradient()} text-white shadow-lg transform scale-105`
                    : `${getCardBackground()} ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} hover:shadow-md`
                }`}
              >
                <span className={`text-lg ${activeTab === tab.id ? 'text-white' : 'text-current'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fadeIn">
          <div className={`${getCardBackground()} rounded-2xl border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} shadow-xl overflow-hidden`}>
            <div className="p-6">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
            Data updates every hour • Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @media (max-width: 640px) {
          .stats-card {
            padding: 1rem;
          }
        }
        [dir="rtl"] .flex {
          flex-direction: row-reverse;
        }
      `}</style>
    </div>
  );
};

export default TrendDashboard;