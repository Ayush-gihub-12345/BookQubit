"use client";

import React from "react";
import { FaExchangeAlt, FaFileSignature, FaMicrophone, FaRobot, FaMagic } from "react-icons/fa";

const ToolsPage = () => {
  const tools = [
    {
      title: "Book Compare",
      desc: "Compare editions, prices, and ratings across platforms.",
      icon: <FaExchangeAlt className="text-blue-500" />,
      tag: "Popular",
    },
    {
      title: "AI Writer Assist",
      desc: "Get suggestions for your next chapter using AI.",
      icon: <FaRobot className="text-purple-500" />,
      tag: "Beta",
    },
    {
      title: "Format Converter",
      desc: "Convert PDF to EPUB or Mobi seamlessly.",
      icon: <FaMagic className="text-emerald-500" />,
      tag: "Free",
    },
    {
      title: "Dictation Pro",
      desc: "Convert your voice recordings into manuscript text.",
      icon: <FaMicrophone className="text-red-500" />,
      tag: "PRO",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Author <span className="opacity-70">&</span> Reader Toolkit</h1>
            <p className="text-indigo-100 max-w-xl text-lg">Powerful utilities to streamline your writing process and enhance your reading experience.</p>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map((tool, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-8 rounded-3xl hover:shadow-xl transition-all group flex items-start gap-6 cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{tool.title}</h2>
                   <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-md uppercase tracking-widest">{tool.tag}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{tool.desc}</p>
                <button className="mt-4 text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 group-hover:underline">
                  Launch Tool <FaExchangeAlt className="text-[10px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;