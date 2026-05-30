"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const YouMayAlsoLike = ({ currentComic, allComics, isDarkMode, theme, t }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  const fallbackImage = "/placeholder-comic.jpg";

  const handleImageError = (comicId) => {
    setImageErrors(prev => ({ ...prev, [comicId]: true }));
  };

  useEffect(() => {
    if (!currentComic || !allComics || allComics.length === 0) return;

    const getRecommendations = () => {
      const scoredComics = allComics
        .filter(comic => comic.id !== currentComic.id && comic.slug !== currentComic.slug)
        .map(comic => {
          let score = 0;

          if (comic.category === currentComic.category) score += 30;
          if (comic.publisher === currentComic.publisher) score += 20;
          
          const ratingDiff = Math.abs((comic.rating || 0) - (currentComic.rating || 0));
          if (ratingDiff <= 2) score += 15;
          else if (ratingDiff <= 4) score += 10;
          
          const sharedCharacters = comic.charactersIntroduced?.filter(
            char => currentComic.charactersIntroduced?.includes(char)
          ) || [];
          score += sharedCharacters.length * 5;
          
          const comicYear = parseInt(comic.publicationDate?.split(",")[1] || comic.publicationDate?.split(" ")[2] || "0");
          const currentYear = parseInt(currentComic.publicationDate?.split(",")[1] || currentComic.publicationDate?.split(" ")[2] || "0");
          if (Math.abs(comicYear - currentYear) <= 3) score += 10;
          
          const sharedWriters = comic.creators?.writersArtists?.filter(
            writer => currentComic.creators?.writersArtists?.includes(writer)
          ) || [];
          score += sharedWriters.length * 8;

          return { ...comic, score };
        });

      return scoredComics.sort((a, b) => b.score - a.score).slice(0, 4);
    };

    setRecommendations(getRecommendations());
  }, [currentComic, allComics]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
          {t("comic.you_may_also_like") || "🔍 You May Also Like"}
        </h2>
        <Link 
          href="/comics"
          className={`text-sm ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} hover:underline`}
        >
          {t("comic.view_all") || "View All →"}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((comic) => (
          <Link 
            href={`/comics/${comic.slug}`} 
            key={comic.id || comic.slug}
            className="group animate-fadeIn"
          >
            <div className={`${theme.background?.card || (isDarkMode ? "bg-gray-800" : "bg-white")} rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl relative`}>
              <div className="absolute top-2 left-2 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${isDarkMode ? "bg-sky-600" : "bg-sky-500"} text-white`}>
                  {comic.score >= 40 ? "🔥 Hot Pick" : comic.score >= 25 ? "⭐ Recommended" : "📖 You might like"}
                </div>
              </div>
              
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={imageErrors[comic.id] ? fallbackImage : (comic.image || fallbackImage)}
                  alt={comic.title || "Comic cover"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={() => handleImageError(comic.id)}
                />
              </div>
              
              <div className="p-4">
                <h3 className={`font-bold text-lg mb-1 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} line-clamp-2`}>
                  {comic.title}
                </h3>
                <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? "text-gray-400" : "text-gray-600")} mb-2`}>
                  {comic.publisher || "Unknown Publisher"} • {comic.category || "Comic"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default YouMayAlsoLike;