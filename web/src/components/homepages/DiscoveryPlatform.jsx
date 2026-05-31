"use client";

import React from "react";
import { FaBrain, FaSearch, FaLanguage, FaLayerGroup, FaArrowRight } from "react-icons/fa";

const DiscoveryPlatform = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#06080F]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header with Stats */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
            Smart <span className="text-blue-500">Discovery.</span> Endless Reading.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Our neural-link AI scans over 500,000+ titles to find your perfect match.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 pt-6">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">500K+</div>
              <div className="text-xs uppercase font-bold text-blue-500 tracking-widest">Books</div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">20</div>
              <div className="text-xs uppercase font-bold text-purple-500 tracking-widest">Languages</div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">10</div>
              <div className="text-xs uppercase font-bold text-orange-500 tracking-widest">Themes</div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Engine Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-12 items-center">
            
            <div className="md:w-1/2 space-y-6">
              <div className="flex items-center gap-3 text-blue-500 font-bold">
                <FaBrain className="animate-pulse" /> AI RECOMMENDATION SYSTEM
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Our AI knows what you want to read before you do.
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Using behavioral analysis and linguistic mapping, Bookqubit suggests titles across 20 languages tailored to your current mood and reading history.
              </p>
              
              <div className="space-y-3">
                {["Mood-based filtering", "Cross-language suggestions", "Real-time trending analysis"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {item}
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-3 text-white bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all group/btn">
                Try AI Discovery <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual Representation of Themes/Languages */}
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className={`h-40 rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex flex-col justify-end transition-all hover:scale-105 cursor-pointer
                   ${i === 1 ? 'bg-blue-500/10' : i === 2 ? 'bg-purple-500/10' : i === 3 ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`}>
                    <div className="text-xs font-bold uppercase opacity-50 mb-1">Theme 0{i}</div>
                    <div className="font-black text-gray-900 dark:text-white">Interface Style</div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoveryPlatform;