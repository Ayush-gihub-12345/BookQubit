"use client";

import React from "react";
import Link from "next/link";
import {
  FaBookOpen,
  FaBrain,
  FaUsers,
  FaLightbulb,
  FaArrowRight,
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const FooterMain = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const features = [
    {
      icon: <FaBrain className="text-2xl text-white" />,
      title: t("footer.main.feature1.title") || "Intelligent Discovery",
      description: t("footer.main.feature1.description") || "AI-powered recommendations based on your reading patterns and interests.",
      gradient: "from-sky-500 to-cyan-400",
      link: "/features/ai-discovery",
    },
    {
      icon: <FaUsers className="text-2xl text-white" />,
      title: t("footer.main.feature2.title") || "Reading Community",
      description: t("footer.main.feature2.description") || "Connect with fellow readers, join book clubs, and share your literary journey.",
      gradient: "from-emerald-500 to-teal-400",
      link: "/features/community",
    },
    {
      icon: <FaLightbulb className="text-2xl text-white" />,
      title: t("footer.main.feature3.title") || "Deep Insights",
      description: t("footer.main.feature3.description") || "Critical analysis and philosophical perspectives on every book.",
      gradient: "from-purple-500 to-pink-400",
      link: "/features/insights",
    },
  ];

  return (
    <section className={`${theme.background?.section || 'bg-white dark:bg-gray-900'} relative overflow-hidden`}>
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? "from-gray-900/30 via-gray-800 to-gray-900/20" : "from-sky-50/30 via-white to-blue-50/20"} -z-10`}
      />

      {/* Animated Background Elements */}
      <div
        className={`absolute top-10 left-10 w-72 h-72 ${isDarkMode ? "bg-blue-900/20" : "bg-sky-100"} rounded-full mix-blend-multiply filter blur-3xl ${isDarkMode ? "opacity-10" : "opacity-20"} animate-blob`}
      ></div>
      <div
        className={`absolute top-10 right-10 w-72 h-72 ${isDarkMode ? "bg-indigo-900/20" : "bg-blue-100"} rounded-full mix-blend-multiply filter blur-3xl ${isDarkMode ? "opacity-10" : "opacity-20"} animate-blob animation-delay-2000`}
      ></div>
      <div
        className={`absolute -bottom-8 left-20 w-72 h-72 ${isDarkMode ? "bg-sky-900/20" : "bg-sky-200"} rounded-full mix-blend-multiply filter blur-3xl ${isDarkMode ? "opacity-5" : "opacity-10"} animate-blob animation-delay-4000`}
      ></div>

      <div
        className={`max-w-7xl mx-auto ${theme.layout?.sectionPadding || 'py-12 px-4 sm:px-6 lg:px-8'} relative z-10`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Brand & Tagline */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              {t("footer.main.badge") || "The Future of Reading"}
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur-xl opacity-30"></div>
                <FaBookOpen className="relative text-5xl text-white p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-2xl" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent mb-2">
                {t("footer.site_name") || "BookQubit"}
              </h1>
              <p className={`text-lg ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} max-w-md`}>
                {t("footer.main.tagline") || "Where literature meets intelligence"}
              </p>
            </div>

            {/* Main Vision Statement */}
            <div className="max-w-3xl mx-auto">
              <p
                className={`${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} text-xl sm:text-2xl leading-relaxed sm:leading-loose font-medium`}
              >
                {t("footer.main.vision_prefix") || "Your"}{" "}
                <span className="font-bold text-sky-600">
                  {t("footer.main.vision_highlight") || "quantum leap"}
                </span>{" "}
                {t("footer.main.vision_suffix") || "into the world of literature. We bridge timeless wisdom with modern intelligence, creating a reading ecosystem that grows with your mind."}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative ${theme.background?.section || 'bg-white dark:bg-gray-800'} rounded-2xl border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} p-6 sm:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-bold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-3 group-hover:text-sky-600 transition-colors`}
                >
                  {feature.title}
                </h3>
                <p className={`${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} leading-relaxed`}>
                  {feature.description}
                </p>
                <div className="mt-6">
                  <Link
                    href={feature.link}
                    className={`inline-flex items-center text-sm font-medium ${theme.textColors?.highlight || 'text-sky-600'} hover:text-sky-700 group/learn`}
                  >
                    {t("footer.main.learn_more") || "Learn more"}
                    <FaArrowRight className="ml-2 text-xs transition-transform group-hover/learn:translate-x-1" />
                  </Link>
                </div>

                {/* Hover gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-sky-900/10 to-blue-900/10" : "from-sky-50/0 to-blue-50/0"} group-hover:${isDarkMode ? "from-sky-900/30 to-blue-900/30" : "from-sky-50/30 to-blue-50/30"} rounded-2xl -z-10 transition-all duration-500`}
                />
              </div>
            ))}
          </div>

          {/* Final Inspiration */}
          <div className="mt-12 sm:mt-16 text-center">
            <div
              className={`inline-flex items-center gap-3 bg-gradient-to-r ${isDarkMode ? "from-purple-900/30 to-pink-900/30" : "from-purple-50 to-pink-50"} px-6 py-4 rounded-2xl border ${isDarkMode ? "border-purple-800" : "border-purple-100"}`}
            >
              <FaLightbulb
                className={`text-2xl ${theme.textColors?.highlight || 'text-sky-600'}`}
              />
              <div className="text-left">
                <p className={`${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} font-medium`}>
                  "{t("footer.main.quote") || "The more that you read, the more things you will know. The more that you learn, the more places you'll go."}"
                  <span
                    className={`block text-sm ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'} mt-1`}
                  >
                    — {t("footer.main.quote_author") || "Dr. Seuss"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default FooterMain;