"use client";

import React from "react";
import { FaRocket, FaGlobe, FaPalette, FaRobot, FaCheckCircle } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";

const LaunchYourBook = () => {
  const { theme, themeName } = useTheme();
  
  const features = [
    { icon: <FaGlobe className="text-blue-500" />, text: "Publish in 20+ Languages" },
    { icon: <FaPalette className="text-purple-500" />, text: "10 Premium Custom Themes" },
    { icon: <FaRobot className="text-orange-500" />, text: "AI-Powered Distribution" },
    { icon: <FaCheckCircle className="text-emerald-500" />, text: "Global Royalties" },
  ];

  return (
    <section className="py-20 px-6 overflow-hidden bg-white dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Content */}
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest">
            <FaRocket className="animate-bounce" /> Bookqubit Publication
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
            Turn your manuscript into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Global Masterpiece.</span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Empower your words with the world's most advanced publication ecosystem. From AI-driven formatting to multi-language translation, we make your book accessible to millions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-orange-500/50 transition-colors">
                {f.icon}
                <span className="font-bold text-gray-800 dark:text-gray-200">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1">
              Start Publishing
            </button>
            <button className="px-8 py-4 border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              View Pricing
            </button>
          </div>
        </div>

        {/* Right: Abstract 3D/Visual Representation */}
        <div className="flex-1 relative">
          <div className="relative z-10 w-full aspect-square bg-gradient-to-br from-orange-500/20 to-purple-600/20 rounded-[3rem] border border-white/20 backdrop-blur-3xl flex items-center justify-center p-12">
            <div className="relative w-full h-full bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="flex flex-col h-full justify-center items-center text-center p-8">
                    <div className="w-24 h-32 bg-orange-500 rounded shadow-[0_0_30px_rgba(234,88,12,0.4)] mb-6 group-hover:rotate-12 transition-transform duration-500"></div>
                    <h3 className="text-white text-2xl font-black">YOUR BOOK HERE</h3>
                    <p className="text-gray-500 text-sm mt-2 font-mono">Bookqubit Engine v4.0</p>
                </div>
            </div>
          </div>
          {/* Background Decorative Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-600/30 rounded-full blur-[120px] -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default LaunchYourBook;