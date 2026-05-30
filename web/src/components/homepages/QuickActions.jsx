"use client";

import React from "react";
import Link from "next/link";
import { 
  FaCompass, 
  FaTools, 
  FaChartLine, 
  FaUsers, 
  FaArrowRight 
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const QuickActions = () => {
  const { theme, themeName } = useTheme();
  const { isRTL, t } = useLanguage();
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const actionCards = [
    {
      id: "explore",
      title: "Explore Library",
      desc: "Discover new worlds and hidden literary gems.",
      icon: <FaCompass />,
      color: "from-blue-500 to-cyan-400",
      link: "/quickhub/explore",
    },
    {
      id: "AudioBook",
      title: "Audiobook Library",
      desc: "Listen to your favorite books on the go.",
      icon: <FaTools />,
      color: "from-purple-600 to-pink-500",
      link: "/quickhub/audiobook",
    },
    {
      id: "VisualBooks",
      title: "Visual Books",
      desc: "Experience books in a whole new visual format.",
      icon: <FaChartLine />,
      color: "from-orange-500 to-yellow-400",
      link: "/quickhub/visualbooks",
    },
    {
      id: "community",
      title: "Community",
      desc: "Connect with thinkers and writers globally.",
      icon: <FaUsers />,
      color: "from-emerald-500 to-teal-400",
      link: "/community",
    },
  ];

  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className={`mb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Quick Hub
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Everything you need to manage your literary journey.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card) => (
            <Link key={card.id} href={card.link}>
              <div className="group h-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white mb-4 bg-gradient-to-br ${card.color} shadow-lg`}>
                  {card.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {card.desc}
                </p>

                {/* Link */}
                <div className={`flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>Open Section</span>
                  <FaArrowRight className={`text-xs transition-transform duration-200 ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;