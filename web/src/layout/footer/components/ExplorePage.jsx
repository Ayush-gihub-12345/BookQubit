"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ExplorePage = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const footerLinks = [
    {
      title: t("explorepage.explore_library.title") || "Explore Library",
      subtitle:
        t("explorepage.explore_library.subtitle") || "Discover new reads",
      icon: (
        <span className={theme.textColors?.highlight || "text-sky-600"}>
          📚
        </span>
      ),
      links: [
        {
          name:
            t("explorepage.explore_library.featured_books") || "Featured Books",
          href: "/books/featured",
          icon: <span className="text-amber-400 text-sm">⭐</span>,
        },
        {
          name: t("explorepage.explore_library.new_releases") || "New Releases",
          href: "/books/newreleases",
          icon: <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>,
        },
        {
          name: t("explorepage.explore_library.genres") || "Genres",
          href: "/category",
          icon: <span className="text-purple-400 text-sm">🏷️</span>,
        },
        {
          name: t("explorepage.explore_library.collections") || "Collections",
          href: "/collections",
          icon: <span className="text-indigo-400 text-sm">📚</span>,
        },
      ],
      gradient: "from-sky-50 to-blue-50",
      darkGradient: "from-sky-900/30 to-blue-900/30",
    },
    {
      title: t("explorepage.news_blog.title") || "News & Blog",
      subtitle:
        t("explorepage.news_blog.subtitle") || "Latest updates & articles",
      icon: <span className="text-rose-500">📰</span>,
      links: [
        {
          name: t("explorepage.news_blog.news") || "News",
          href: "/footerpages/news",
          icon: <span className="text-red-400 text-sm">📰</span>,
        },
        {
          name: t("explorepage.news_blog.blog_articles") || "Blog Articles",
          href: "/footerpages/blog",
          icon: <span className="text-blue-400 text-sm">✍️</span>,
        },
        {
          name:
            t("explorepage.news_blog.book_reviews") ||
            "Book Reviews & Analysis",
          href: "/footerpages/bookreviews",
          icon: <span className="text-amber-400 text-sm">⭐</span>,
        },
      ],
      gradient: "from-rose-50 to-orange-50",
      darkGradient: "from-rose-900/30 to-orange-900/30",
    },
    {
      title: t("explorepage.help_support.title") || "Help & Support",
      subtitle: t("explorepage.help_support.subtitle") || "Get assistance",
      icon: <span className="text-rose-500">🆘</span>,
      links: [
        {
          name: t("explorepage.help_support.help_center") || "Help Center",
          href: "/footerpages/help",
          icon: <span className="text-sky-400 text-sm">❓</span>,
        },
        {
          name:
            t("explorepage.help_support.contact_support") || "Contact Support",
          href: "/footerpages/contact",
          icon: <span className="text-rose-400 text-sm">🤝</span>,
        },
        {
          name: t("explorepage.help_support.faq") || "FAQ",
          href: "/footerpages/faq",
          icon: <span className="text-amber-400 text-sm">❓</span>,
        },
      ],
      gradient: "from-rose-50 to-pink-50",
      darkGradient: "from-rose-900/30 to-pink-900/30",
    },
    {
      title: t("explorepage.authors.title") || "Authors",
      subtitle: t("explorepage.authors.subtitle") || "Meet the creators",
      icon: <span className="text-amber-500">✍️</span>,
      links: [
        {
          name: t("explorepage.authors.all_authors") || "All Authors",
          href: "/authors",
          icon: <span className="text-sky-400 text-sm">👥</span>,
        },
        {
          name: t("explorepage.authors.top_authors") || "Top Authors",
          href: "/authors/top",
          icon: <span className="text-amber-400 text-sm">👑</span>,
        },
        {
          name: t("explorepage.authors.social_media") || "Drift (By BookQubit)",
          href: "/drift",
          icon: <span className="text-green-400 text-sm">📤</span>,
        },
      ],
      gradient: "from-amber-50 to-orange-50",
      darkGradient: "from-amber-900/30 to-orange-900/30",
    },
  ];

  // Helper function for gradients
  const getGradient = (col, isDarkMode) => {
    if (isDarkMode) {
      return col.darkGradient || "from-gray-800 to-gray-900";
    }
    return col.gradient || "from-gray-100 to-gray-200";
  };

  // Helper function for hover gradients
  const getHoverGradient = (isDarkMode) => {
    return isDarkMode
      ? "hover:from-gray-800 hover:to-gray-900"
      : "hover:from-gray-50 hover:to-white";
  };

  return (
    <section
      className={`${theme.background?.section || "bg-white dark:bg-gray-900"} mt-10 py-12`}
    >
      <div
        className={`${theme.layout?.containerWidth || "max-w-7xl"} mx-auto px-4 sm:px-6`}
      >
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4">
            <span className="text-xs">📚</span>
            {t("explorepage.header_badge") || "Explore BookQubit"}
          </div>

          <h2
            className={`text-2xl sm:text-3xl md:text-4xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} mb-3`}
          >
            {t("explorepage.header_title_prefix") || "Discover Your"}{" "}
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
              {t("explorepage.header_title_highlight") || "Reading Ecosystem"}
            </span>
          </h2>

          <p
            className={`${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} text-sm sm:text-base max-w-2xl mx-auto`}
          >
            {t("explorepage.header_subtitle") ||
              "Explore our vast library, premium features, developer tools, and vibrant community all in one place."}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {footerLinks.map((col) => (
            <div
              key={col.title}
              className={`
                group relative 
                ${theme.background?.section || "bg-white dark:bg-gray-800"} 
                ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
                ${theme.shadow?.container || "shadow-lg"}
                rounded-2xl 
                p-5 sm:p-6 
                hover:shadow-xl 
                transition-all duration-300 
                hover:-translate-y-1
                ${theme.ringEffect || ""}
              `}
            >
              {/* Column Header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div
                  className={`
                    relative w-12 h-12 rounded-xl 
                    bg-gradient-to-br ${getGradient(col, isDarkMode)} 
                    flex items-center justify-center 
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  {col.icon}
                </div>
                <div>
                  <h3
                    className={`text-lg sm:text-xl font-bold ${theme.textColors?.primary || "text-gray-900 dark:text-white"} group-hover:text-sky-600 transition-colors`}
                  >
                    {col.title}
                  </h3>
                  <p
                    className={`${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} text-xs sm:text-sm mt-1`}
                  >
                    {col.subtitle}
                  </p>
                </div>
              </div>

              {/* Links List */}
              <ul className="space-y-2 sm:space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`
                        flex items-center justify-between p-2 sm:p-3 
                        rounded-lg 
                        ${getHoverGradient(isDarkMode)}
                        group/link 
                        transition-all duration-200 
                        active:scale-[0.98]
                        ${theme.border?.button || "border border-transparent"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-md bg-gradient-to-br ${isDarkMode ? "from-gray-700 to-gray-800" : "from-sky-50 to-blue-50"} flex items-center justify-center`}
                        >
                          {link.icon}
                        </div>
                        <span
                          className={`text-sm sm:text-base font-medium ${theme.textColors?.primary || "text-gray-900 dark:text-white"} group-hover/link:text-sky-600 transition-colors`}
                        >
                          {link.name}
                        </span>
                      </div>
                      <span
                        className={`${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"} text-xs group-hover/link:text-sky-500 group-hover/link:translate-x-1 transition-all duration-300`}
                      >
                        {t("explorepage.arrow") || "→"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-sky-500/50 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExplorePage;
