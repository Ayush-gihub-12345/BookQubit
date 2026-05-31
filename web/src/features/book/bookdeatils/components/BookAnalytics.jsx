"use client";

import React from "react";
import { useTheme } from "@/themes/useTheme";

const BookAnalytics = ({ book }) => {
  const { theme, themeName } = useTheme();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Rating distribution data
  const ratingDistribution = [
    { stars: 5, count: 1843, color: "green", width: 75 },
    { stars: 4, count: 369, color: "green", width: 15 },
    { stars: 3, count: 147, color: "yellow", width: 6 },
    { stars: 2, count: 74, color: "orange", width: 3 },
    { stars: 1, count: 25, color: "red", width: 1 },
  ];

  return (
    <div
      className={`
        ${theme.shadow?.container || 'shadow-lg'} 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        p-6 
        ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
        mb-16 
        rounded-2xl
      `}
    >
      <h2 className={`text-xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-6`}>
        Book Analytics & Performance
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Reader Engagement */}
        <div
          className={`
            ${isDarkMode ? "bg-purple-900/20" : "bg-purple-50"} 
            p-4 rounded-xl border 
            ${isDarkMode ? "border-purple-800" : "border-purple-200"}
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-purple-300" : "text-purple-600"} font-medium`}>
                Reader Engagement
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-purple-200" : "text-purple-900"}`}>
                78%
              </p>
              <p className={`text-xs ${isDarkMode ? "text-purple-400" : "text-purple-600"} mt-1`}>
                +5% from last month
              </p>
            </div>
            <div className={`${isDarkMode ? "bg-purple-800/50" : "bg-purple-100"} p-3 rounded-full`}>
              <svg className={`w-6 h-6 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* BookQubit Ranking */}
        <div
          className={`
            ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"} 
            p-4 rounded-xl border 
            ${isDarkMode ? "border-blue-800" : "border-blue-200"}
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-600"} font-medium`}>
                BookQubit Ranking
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-blue-200" : "text-blue-900"}`}>
                #24
              </p>
              <p className={`text-xs ${isDarkMode ? "text-blue-400" : "text-blue-600"} mt-1`}>
                Top 1% in Category
              </p>
            </div>
            <div className={`${isDarkMode ? "bg-blue-800/50" : "bg-blue-100"} p-3 rounded-full`}>
              <svg className={`w-6 h-6 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Book Relevance */}
        <div
          className={`
            ${isDarkMode ? "bg-green-900/20" : "bg-green-50"} 
            p-4 rounded-xl border 
            ${isDarkMode ? "border-green-800" : "border-green-200"}
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-green-300" : "text-green-600"} font-medium`}>
                Book Relevance
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-green-200" : "text-green-900"}`}>
                92%
              </p>
              <p className={`text-xs ${isDarkMode ? "text-green-400" : "text-green-600"} mt-1`}>
                Current Trends
              </p>
            </div>
            <div className={`${isDarkMode ? "bg-green-800/50" : "bg-green-100"} p-3 rounded-full`}>
              <svg className={`w-6 h-6 ${isDarkMode ? "text-green-300" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sales Performance */}
        <div
          className={`
            ${isDarkMode ? "bg-orange-900/20" : "bg-orange-50"} 
            p-4 rounded-xl border 
            ${isDarkMode ? "border-orange-800" : "border-orange-200"}
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-orange-300" : "text-orange-600"} font-medium`}>
                Sales Performance
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-orange-200" : "text-orange-900"}`}>
                Peak: 2022
              </p>
              <p className={`text-sm ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>
                Low: 2018
              </p>
            </div>
            <div className={`${isDarkMode ? "bg-orange-800/50" : "bg-orange-100"} p-3 rounded-full`}>
              <svg className={`w-6 h-6 ${isDarkMode ? "text-orange-300" : "text-orange-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Rating Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reviews Summary */}
        <div>
          <h3 className={`text-lg font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
            Reviews Summary
          </h3>
          <div
            className={`
              ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"} 
              p-6 rounded-xl border 
              ${isDarkMode ? "border-gray-700" : "border-gray-200"}
            `}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>
                  4.7
                </div>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? (theme.iconColors?.starFilled || 'text-amber-400') : (theme.iconColors?.starEmpty || 'text-gray-300')}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mt-1`}>
                  Based on 2,458 reviews
                </p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                  84%
                </div>
                <div className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                  Positive Reviews
                </div>
                <div className={`text-lg font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mt-2`}>
                  12%
                </div>
                <div className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                  Critical Reviews
                </div>
              </div>
            </div>

            {/* Review Highlights */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 ${theme.background?.section || 'bg-white dark:bg-gray-800'} rounded-lg border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <span className={`text-sm font-medium ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                  Engaging Content
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">94%</span>
              </div>
              <div className={`flex items-center justify-between p-3 ${theme.background?.section || 'bg-white dark:bg-gray-800'} rounded-lg border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <span className={`text-sm font-medium ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                  Writing Quality
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">89%</span>
              </div>
              <div className={`flex items-center justify-between p-3 ${theme.background?.section || 'bg-white dark:bg-gray-800'} rounded-lg border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <span className={`text-sm font-medium ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                  Story Depth
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">82%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div>
          <h3 className={`text-lg font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-4`}>
            Rating Distribution
          </h3>
          <div
            className={`
              ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"} 
              p-6 rounded-xl border 
              ${isDarkMode ? "border-gray-700" : "border-gray-200"}
            `}
          >
            <div className="space-y-4">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center">
                  <div className="flex items-center w-20">
                    <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mr-2`}>
                      {item.stars} Stars
                    </span>
                    <svg className={`w-4 h-4 ${theme.iconColors?.starFilled || 'text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className={`flex-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-3 mx-3`}>
                    <div
                      className={`bg-${item.color}-500 h-3 rounded-full`}
                      style={{ width: `${item.width}%` }}
                    ></div>
                  </div>
                  <span className={`w-12 text-sm font-medium ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAnalytics;