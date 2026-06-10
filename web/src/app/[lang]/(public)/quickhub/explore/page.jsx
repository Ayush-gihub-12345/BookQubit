"use client";

import React, { useState } from "react";
import { FaBook, FaMask, FaScroll, FaSearch, FaFilter } from "react-icons/fa";

const ExplorePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { name: "All", icon: <FaSearch />, color: "bg-gray-500" },
    { name: "Books", icon: <FaBook />, color: "bg-blue-500" },
    { name: "Comics", icon: <FaMask />, color: "bg-red-500" },
    { name: "Novels", icon: <FaScroll />, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F1A] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Discover <span className="text-blue-500">Content</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl">
            Browse through our curated collection of literature, visual novels, and digital comics.
          </p>
        </header>

        {/* Category Filter */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                activeCategory === cat.name
                  ? `${cat.color} text-white shadow-lg scale-105`
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Content Grid Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-100 dark:border-white/5 transition-transform duration-300 group-hover:scale-95 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-white font-bold text-sm">View Details</span>
                </div>
              </div>
              <h3 className="mt-3 font-bold text-gray-900 dark:text-white truncate">Item Title {i + 1}</h3>
              <p className="text-xs text-gray-500">Author Name</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;