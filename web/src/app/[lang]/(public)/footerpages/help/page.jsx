"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaSearch,
  FaQuestionCircle,
  FaBook,
  FaUserCircle,
  FaShoppingCart,
  FaCreditCard,
  FaMobileAlt,
  FaEnvelope,
  FaComments,
  FaShieldAlt,
  FaDownload,
  FaSync,
  FaStar,
  FaTrophy,
  FaUsers,
  FaHeadset,
  FaRobot,
  FaFileAlt,
  FaVideo,
  FaArrowRight,
} from "react-icons/fa";

// Help categories
const helpCategories = [
  {
    id: 1,
    title: "Getting Started",
    icon: <FaBook />,
    description: "Learn how to create an account, set up your profile, and start your reading journey.",
    color: "from-blue-500 to-cyan-500",
    articles: [
      { title: "How to Create an Account", link: "/help/create-account", popular: true },
      { title: "Setting Up Your Profile", link: "/help/setup-profile" },
      { title: "Adding Books to Your Library", link: "/help/add-books" },
      { title: "Navigating the Platform", link: "/help/navigation" },
    ],
  },
  {
    id: 2,
    title: "Account & Profile",
    icon: <FaUserCircle />,
    description: "Manage your account settings, privacy preferences, and notification options.",
    color: "from-purple-500 to-pink-500",
    articles: [
      { title: "Account Security", link: "/help/account-security", popular: true },
      { title: "Privacy Settings", link: "/help/privacy-settings" },
      { title: "Managing Notifications", link: "/help/notifications" },
      { title: "Deleting Your Account", link: "/help/delete-account" },
    ],
  },
  {
    id: 3,
    title: "Reading & Purchasing",
    icon: <FaShoppingCart />,
    description: "Learn about purchasing books, reading options, and your digital library.",
    color: "from-green-500 to-emerald-500",
    articles: [
      { title: "How to Purchase Books", link: "/help/purchase-books", popular: true },
      { title: "Reading Online vs Offline", link: "/help/reading-modes" },
      { title: "Managing Your Library", link: "/help/manage-library" },
      { title: "Bookmarks & Highlights", link: "/help/bookmarks" },
    ],
  },
  {
    id: 4,
    title: "Payments & Subscriptions",
    icon: <FaCreditCard />,
    description: "Information about payment methods, billing, and subscription plans.",
    color: "from-orange-500 to-red-500",
    articles: [
      { title: "Payment Methods", link: "/help/payment-methods", popular: true },
      { title: "Subscription Plans", link: "/help/subscription-plans" },
      { title: "Refund Policy", link: "/help/refund-policy" },
      { title: "Billing Issues", link: "/help/billing-issues" },
    ],
  },
  {
    id: 5,
    title: "Mobile App",
    icon: <FaMobileAlt />,
    description: "Get help with our mobile app for iOS and Android devices.",
    color: "from-indigo-500 to-blue-500",
    articles: [
      { title: "Downloading the App", link: "/help/download-app", popular: true },
      { title: "Syncing Across Devices", link: "/help/sync-devices" },
      { title: "App Features Guide", link: "/help/app-features" },
      { title: "Troubleshooting App Issues", link: "/help/app-troubleshooting" },
    ],
  },
  {
    id: 6,
    title: "Contact & Support",
    icon: <FaHeadset />,
    description: "How to reach our support team and get help with your issues.",
    color: "from-rose-500 to-pink-500",
    articles: [
      { title: "Contact Support", link: "/help/contact-support", popular: true },
      { title: "FAQs", link: "/faq" },
      { title: "Live Chat", link: "/help/live-chat" },
      { title: "Community Forums", link: "/community/forums" },
    ],
  },
];

// Popular articles
const popularArticles = [
  { title: "How to Reset Your Password", views: 15234, link: "/help/reset-password" },
  { title: "Understanding Book Ratings", views: 12345, link: "/help/book-ratings" },
  { title: "How to Leave a Review", views: 9876, link: "/help/leave-review" },
  { title: "Using the AI Assistant", views: 8765, link: "/help/ai-assistant" },
  { title: "Gift Cards & Promotions", views: 7654, link: "/help/gift-cards" },
  { title: "Parental Controls", views: 6543, link: "/help/parental-controls" },
];

// Quick answers (FAQs)
const quickAnswers = [
  { question: "How do I reset my password?", answer: "Go to Login page > click 'Forgot Password' > follow email instructions.", link: "/help/reset-password" },
  { question: "Can I cancel my subscription anytime?", answer: "Yes, you can cancel anytime from your Account Settings > Subscription.", link: "/help/cancel-subscription" },
  { question: "How do I get a refund?", answer: "Contact support within 7 days of purchase for a full refund.", link: "/help/refund-policy" },
  { question: "Are books available offline?", answer: "Yes, download books to read offline via our mobile app.", link: "/help/offline-reading" },
  { question: "How do I contact support?", answer: "Email support@bookqubit.com or use live chat.", link: "/help/contact-support" },
  { question: "What payment methods are accepted?", answer: "Credit cards, PayPal, Google Pay, and Apple Pay.", link: "/help/payment-methods" },
];

const HelpPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter categories based on search
  const filteredCategories = helpCategories.filter((category) => {
    const matchesSearch = searchTerm === "" ||
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.articles.some(article => article.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Filter popular articles based on search
  const filteredPopularArticles = popularArticles.filter((article) =>
    searchTerm === "" || article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter quick answers based on search
  const filteredQuickAnswers = quickAnswers.filter((qa) =>
    searchTerm === "" ||
    qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qa.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaQuestionCircle className={`text-4xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Help Center
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Find answers, get support, and learn how to make the most of BookQubit
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search for help articles, topics, or questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'} hover:text-gray-600`}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className={`mt-4 text-center ${theme.textColors?.secondary || 'text-gray-500'}`}>
              Found {filteredCategories.length + filteredPopularArticles.length + filteredQuickAnswers.length} results
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12">
            {filteredQuickAnswers.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  Quick Answers
                </h2>
                <div className="space-y-3">
                  {filteredQuickAnswers.map((qa, index) => (
                    <Link
                      key={index}
                      href={qa.link}
                      className={`block p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all`}
                    >
                      <p className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{qa.question}</p>
                      <p className={`text-sm mt-1 ${theme.textColors?.secondary || 'text-gray-600'}`}>{qa.answer}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredPopularArticles.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  Popular Articles
                </h2>
                <div className="space-y-3">
                  {filteredPopularArticles.map((article, index) => (
                    <Link
                      key={index}
                      href={article.link}
                      className={`block p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all`}
                    >
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{article.title}</p>
                        <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>{article.views.toLocaleString()} views</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredCategories.length > 0 && (
              <div>
                <h2 className={`text-2xl font-bold mb-4 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  Categories
                </h2>
                <div className="space-y-3">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className={`p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{category.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.articles.map((article, idx) => (
                          <Link key={idx} href={article.link} className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'} hover:${theme.textColors?.highlight || 'text-sky-600'} transition`}>
                            {article.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredCategories.length === 0 && filteredPopularArticles.length === 0 && filteredQuickAnswers.length === 0 && (
              <div className="text-center py-12">
                <FaQuestionCircle className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No results found</h3>
                <p className={`${theme.textColors?.secondary || 'text-gray-600'}`}>Try different keywords or browse our help categories below</p>
              </div>
            )}
          </div>
        )}

        {/* Help Categories */}
        {!searchTerm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {helpCategories.map((category) => (
                <div
                  key={category.id}
                  className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl p-6 transition-all hover:shadow-xl hover:scale-105`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 text-white text-xl`}>
                    {category.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {category.title}
                  </h3>
                  <p className={`text-sm mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`}>
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.articles.slice(0, 3).map((article, idx) => (
                      <Link
                        key={idx}
                        href={article.link}
                        className={`block text-sm ${theme.textColors?.secondary || 'text-gray-500'} hover:${theme.textColors?.highlight || 'text-sky-600'} transition`}
                      >
                        • {article.title}
                      </Link>
                    ))}
                    {category.articles.length > 3 && (
                      <Link
                        href={`/help/${category.title.toLowerCase().replace(/ /g, '-')}`}
                        className={`block text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline mt-2 flex items-center gap-1`}
                      >
                        View all <FaArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Articles */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  🔥 Popular Articles
                </h2>
                <Link href="/help/popular" className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline flex items-center gap-1`}>
                  View all <FaArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularArticles.map((article, index) => (
                  <Link
                    key={index}
                    href={article.link}
                    className={`flex items-center justify-between p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all`}
                  >
                    <span className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>{article.title}</span>
                    <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{article.views.toLocaleString()} views</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Answers */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  💡 Quick Answers
                </h2>
                <Link href="/faq" className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline flex items-center gap-1`}>
                  View all FAQs <FaArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickAnswers.map((qa, index) => (
                  <Link
                    key={index}
                    href={qa.link}
                    className={`p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all`}
                  >
                    <p className={`font-semibold mb-1 ${theme.textColors?.primary || 'text-gray-900'}`}>{qa.question}</p>
                    <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{qa.answer}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Support CTA */}
            <div className={`p-8 rounded-2xl text-center ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
              <FaHeadset className={`text-4xl mx-auto mb-4 ${theme.textColors?.highlight || 'text-sky-600'}`} />
              <h2 className={`text-2xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                Still Need Help?
              </h2>
              <p className={`mb-6 ${theme.textColors?.secondary || 'text-gray-600'}`}>
                Our support team is here to assist you with any questions or issues
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className={`px-6 py-3 ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                >
                  <FaEnvelope /> Contact Support
                </Link>
                <Link
                  href="/faq"
                  className={`px-6 py-3 rounded-lg border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition flex items-center gap-2`}
                >
                  <FaQuestionCircle /> Visit FAQ
                </Link>
                <Link
                  href="/community/forums"
                  className={`px-6 py-3 rounded-lg ${theme.background?.section || 'bg-white dark:bg-gray-900'} ${theme.border?.default || 'border border-gray-300 dark:border-gray-600'} ${theme.textColors?.primary || 'text-gray-900'} hover:shadow-md transition flex items-center gap-2`}
                >
                  <FaUsers /> Community Forums
                </Link>
              </div>
            </div>

            {/* Support Resources */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className={`text-2xl font-bold text-center mb-8 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                Additional Resources
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/help/video-tutorials" className={`text-center p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all group`}>
                  <FaVideo className={`text-3xl mx-auto mb-2 ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>Video Tutorials</p>
                  <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Watch step-by-step guides</p>
                </Link>
                <Link href="/help/user-guides" className={`text-center p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all group`}>
                  <FaFileAlt className={`text-3xl mx-auto mb-2 ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>User Guides</p>
                  <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Downloadable PDF guides</p>
                </Link>
                <Link href="/help/api-docs" className={`text-center p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all group`}>
                  <FaRobot className={`text-3xl mx-auto mb-2 ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>API Documentation</p>
                  <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>For developers</p>
                </Link>
                <Link href="/help/status" className={`text-center p-4 rounded-lg ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} hover:shadow-lg transition-all group`}>
                  <FaSync className={`text-3xl mx-auto mb-2 ${theme.textColors?.highlight || 'text-sky-600'} group-hover:scale-110 transition`} />
                  <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>System Status</p>
                  <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Check service availability</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpPage;