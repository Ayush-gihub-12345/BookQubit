"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaQuestionCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaHeadset,
  FaBook,
  FaUserCircle,
  FaShoppingCart,
  FaCreditCard,
  FaMobileAlt,
  FaShieldAlt,
  FaDownload,
  FaSync,
  FaStar,
  FaTrophy,
  FaUsers,
  FaRobot,
  FaFileAlt,
} from "react-icons/fa";

// FAQ Categories and Questions
const faqCategories = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: <FaBook />,
    color: "from-blue-500 to-cyan-500",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button in the top right corner. Enter your email, create a password, and follow the verification link sent to your inbox. You can also sign up using Google or Facebook for quick access."
      },
      {
        q: "Is BookQubit free to use?",
        a: "BookQubit offers both free and premium plans. Free users can access a limited selection of books and features. Premium subscribers get unlimited access to our entire library, AI recommendations, and offline reading."
      },
      {
        q: "How do I reset my password?",
        a: "Go to the login page and click 'Forgot Password'. Enter your registered email address, and we'll send you a password reset link. Follow the instructions to create a new password."
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can delete your account from Settings > Account > Delete Account. Please note that this action is permanent and will remove all your data, including saved books and reading history."
      }
    ]
  },
  {
    id: "account-profile",
    name: "Account & Profile",
    icon: <FaUserCircle />,
    color: "from-purple-500 to-pink-500",
    questions: [
      {
        q: "How do I update my profile information?",
        a: "Go to your Profile page by clicking on your avatar in the top right corner. From there, you can edit your name, bio, profile picture, and reading preferences."
      },
      {
        q: "Can I change my email address?",
        a: "Yes, you can change your email address in Settings > Account > Email Preferences. You'll need to verify the new email address before the change takes effect."
      },
      {
        q: "How do I manage notification preferences?",
        a: "Navigate to Settings > Notifications. There you can customize which emails and push notifications you receive, including book recommendations, reading reminders, and promotional offers."
      },
      {
        q: "What is two-factor authentication?",
        a: "Two-factor authentication adds an extra layer of security to your account. You can enable it in Settings > Security. After enabling, you'll need to enter a code from your authenticator app when logging in."
      }
    ]
  },
  {
    id: "reading-purchasing",
    name: "Reading & Purchasing",
    icon: <FaShoppingCart />,
    color: "from-green-500 to-emerald-500",
    questions: [
      {
        q: "How do I purchase a book?",
        a: "Find the book you want, click 'Buy Now' or 'Add to Cart'. Proceed to checkout, enter your payment information, and complete the purchase. The book will be added to your library instantly."
      },
      {
        q: "Can I read books offline?",
        a: "Yes! Premium subscribers can download books for offline reading. Look for the download icon on any book in your library. Downloaded books can be accessed even without an internet connection."
      },
      {
        q: "How do I return a book?",
        a: "You can return digital books within 7 days of purchase if you haven't downloaded or read more than 10% of the content. Go to your Purchase History and click 'Request Refund'."
      },
      {
        q: "What formats are available?",
        a: "Books are available in EPUB, PDF, and audiobook formats. Our mobile app also supports offline reading. Most books are compatible with all major e-readers."
      }
    ]
  },
  {
    id: "payments-subscriptions",
    name: "Payments & Subscriptions",
    icon: <FaCreditCard />,
    color: "from-orange-500 to-red-500",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Google Pay, and Apple Pay. For annual subscriptions, we also accept bank transfers."
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings > Subscription > Cancel Subscription. Your cancellation will take effect at the end of your current billing cycle. You'll retain access until then."
      },
      {
        q: "Can I get a refund?",
        a: "We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions can be canceled anytime, but no refunds are provided for partial months."
      },
      {
        q: "How do I update my billing information?",
        a: "Navigate to Settings > Billing Information. There you can update your credit card details, billing address, and tax information."
      }
    ]
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    icon: <FaMobileAlt />,
    color: "from-indigo-500 to-blue-500",
    questions: [
      {
        q: "Where can I download the app?",
        a: "Our app is available on both iOS App Store and Google Play Store. Search for 'BookQubit' and download the official app for free."
      },
      {
        q: "How do I sync my reading progress?",
        a: "Your reading progress automatically syncs across all devices when you're logged in. Just ensure you're connected to the internet when you start and finish reading sessions."
      },
      {
        q: "The app is crashing. What should I do?",
        a: "Try clearing the app cache, updating to the latest version, or reinstalling the app. If the issue persists, contact our support team with details about your device and OS version."
      },
      {
        q: "Can I listen to audiobooks on the app?",
        a: "Yes! Our mobile app supports full audiobook playback with features like speed control, sleep timer, and offline downloads for premium subscribers."
      }
    ]
  },
  {
    id: "security-privacy",
    name: "Security & Privacy",
    icon: <FaShieldAlt />,
    color: "from-slate-500 to-gray-500",
    questions: [
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use industry-standard SSL encryption and never store your full payment details. All transactions are processed through secure payment gateways like Stripe and PayPal."
      },
      {
        q: "How is my data protected?",
        a: "We employ multiple security measures including encryption, firewalls, and regular security audits. Your personal information is never sold to third parties."
      },
      {
        q: "Can I export my reading data?",
        a: "Yes, you can export your reading history, highlights, and notes from Settings > Data Export. Data is provided in JSON and CSV formats."
      },
      {
        q: "How do I report a security issue?",
        a: "Please email security@bookqubit.com with details of the issue. We take security seriously and will investigate promptly."
      }
    ]
  }
];

// General FAQs (uncategorized)
const generalFaqs = [
  {
    q: "How do I contact customer support?",
    a: "You can reach our support team via email at support@bookqubit.com, live chat on our website (available 9 AM - 6 PM EST), or through our contact form."
  },
  {
    q: "Do you offer discounts for students?",
    a: "Yes! Students with a valid .edu email address get 50% off on annual subscriptions. Contact our support team with your student ID for verification."
  },
  {
    q: "Can I gift a subscription?",
    a: "Absolutely! You can purchase gift subscriptions from our Gift page. Gift cards are available in 3, 6, and 12-month options."
  },
  {
    q: "How do I become an affiliate?",
    a: "Visit our Affiliate Program page to apply. Affiliates earn 20% commission on referrals and get exclusive promotional materials."
  }
];

const FaqPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [openQuestions, setOpenQuestions] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const toggleQuestion = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`;
    setOpenQuestions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter questions based on search
  const filterQuestions = (questions) => {
    if (!searchTerm) return questions;
    return questions.filter(q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filter categories based on search
  const filteredCategories = faqCategories.filter(category => {
    if (activeCategory !== "all" && category.id !== activeCategory) return false;
    const filteredQuestions = filterQuestions(category.questions);
    return filteredQuestions.length > 0;
  });

  const filteredGeneralFaqs = filterQuestions(generalFaqs);
  const hasSearchResults = searchTerm && (
    filteredCategories.length > 0 || filteredGeneralFaqs.length > 0
  );

  const clearSearch = () => {
    setSearchTerm("");
    setActiveCategory("all");
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaQuestionCircle className={`text-4xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Frequently Asked Questions
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-2xl mx-auto`}>
            Find answers to common questions about BookQubit
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
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
            <div className={`mt-2 text-center text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>
              Found {filteredCategories.reduce((acc, cat) => acc + filterQuestions(cat.questions).length, 0) + filteredGeneralFaqs.length} results
            </div>
          )}
        </div>

        {/* Category Tabs */}
        {!searchTerm && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.secondary || 'text-gray-600'}`}`}
            >
              All
            </button>
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${activeCategory === category.id ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.secondary || 'text-gray-600'}`}`}
              >
                <span className="text-sm">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Sections */}
        {hasSearchResults || (!searchTerm && activeCategory !== "all" ? filteredCategories.length > 0 : true) ? (
          <>
            {filteredCategories.map((category) => {
              const filteredQuestions = filterQuestions(category.questions);
              if (filteredQuestions.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                      {category.icon}
                    </div>
                    <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                      {category.name}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {filteredQuestions.map((faq, idx) => {
                      const key = `${category.id}-${idx}`;
                      const isOpen = openQuestions[key];
                      
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl overflow-hidden ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} transition-all`}
                        >
                          <button
                            onClick={() => toggleQuestion(category.id, idx)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                          >
                            <span className={`font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                              {faq.q}
                            </span>
                            {isOpen ? (
                              <FaChevronUp className={`${theme.textColors?.secondary || 'text-gray-500'}`} />
                            ) : (
                              <FaChevronDown className={`${theme.textColors?.secondary || 'text-gray-500'}`} />
                            )}
                          </button>
                          {isOpen && (
                            <div className={`px-6 py-4 border-t ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* General FAQs */}
            {filteredGeneralFaqs.length > 0 && (activeCategory === "all" || !searchTerm) && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white`}>
                    <FaQuestionCircle />
                  </div>
                  <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    General Questions
                  </h2>
                </div>
                <div className="space-y-3">
                  {filteredGeneralFaqs.map((faq, idx) => {
                    const key = `general-${idx}`;
                    const isOpen = openQuestions[key];
                    
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl overflow-hidden ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} transition-all`}
                      >
                        <button
                          onClick={() => toggleQuestion("general", idx)}
                          className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <span className={`font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <FaChevronUp className={`${theme.textColors?.secondary || 'text-gray-500'}`} />
                          ) : (
                            <FaChevronDown className={`${theme.textColors?.secondary || 'text-gray-500'}`} />
                          )}
                        </button>
                        {isOpen && (
                          <div className={`px-6 py-4 border-t ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FaQuestionCircle className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No results found</h3>
            <p className={`${theme.textColors?.secondary || 'text-gray-600'}`}>Try different keywords or browse our categories</p>
            <button
              onClick={clearSearch}
              className={`mt-4 px-6 py-2 ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Still Need Help */}
        <div className={`mt-12 p-8 rounded-2xl text-center ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
          <FaHeadset className={`text-4xl mx-auto mb-4 ${theme.textColors?.highlight || 'text-sky-600'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
            Still Need Help?
          </h2>
          <p className={`mb-6 ${theme.textColors?.secondary || 'text-gray-600'}`}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/footerpages/contact"
              className={`px-6 py-3 ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition flex items-center gap-2`}
            >
              <FaEnvelope /> Contact Support
            </Link>
            <Link
              href="/footerpages/help"
              className={`px-6 py-3 rounded-lg border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition flex items-center gap-2`}
            >
              <FaHeadset /> Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;