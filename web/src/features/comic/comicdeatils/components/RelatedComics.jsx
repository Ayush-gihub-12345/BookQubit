"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import StarRating from "./StarRating";

const RelatedComics = ({ comics, currentComicId, title, isDarkMode, theme, t }) => {
  const [imageErrors, setImageErrors] = useState({});

  if (!comics || comics.length === 0) return null;

  const fallbackImage = "/placeholder-comic.jpg";

  const handleImageError = (comicId) => {
    setImageErrors(prev => ({ ...prev, [comicId]: true }));
  };

  return (
    <div className="mt-12">
      <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-6`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {comics.map((comic) => (
          <Link 
            href={`/comics/${comic.slug}`} 
            key={comic.id || comic.slug}
            className="group"
          >
            <div className={`${theme.background?.card || (isDarkMode ? "bg-gray-800" : "bg-white")} rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={imageErrors[comic.id] ? fallbackImage : (comic.image || fallbackImage)}
                  alt={comic.title || "Comic cover"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={() => handleImageError(comic.id)}
                />
                <div className={`absolute top-2 right-2 px-2 py-1 ${isDarkMode ? "bg-black/70" : "bg-white/90"} rounded-lg text-sm font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
                  {comic.publicationDate?.split(",")[0] || comic.publicationDate || "N/A"}
                </div>
              </div>
              <div className="p-4">
                <h3 className={`font-bold text-lg mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} line-clamp-2`}>
                  {comic.title}
                </h3>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-2`}>
                  {comic.publisher || "Unknown Publisher"}
                </p>
                <div className="flex items-center justify-between">
                  <StarRating rating={comic.rating || 0} theme={theme} isDarkMode={isDarkMode} size="sm" />
                  <span className={`text-sm font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}>
                    {comic.coverPrice || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedComics;