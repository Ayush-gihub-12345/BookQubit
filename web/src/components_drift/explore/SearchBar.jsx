// src/components_drift/explore/SearchBar.jsx

"use client";

import { useState } from "react";

export default function SearchBar({ searchQuery, setSearchQuery }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-200 ${
      isFocused ? "scale-105" : ""
    }`}>
      <input
        type="text"
        placeholder="Search people, posts, topics..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-full py-3 pl-12 pr-4 border focus:border-blue-500 focus:outline-none transition-colors"
      />
      <svg
        className="absolute left-4 top-3.5 w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}