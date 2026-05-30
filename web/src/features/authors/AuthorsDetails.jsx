"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthorsDataByLanguage } from "@/data/authors";

const AuthorDetails = () => {
  const params = useParams();
  const slug = params?.slug;
  const { theme, themeName } = useTheme();
  const { language, t, isRTL } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  
  // Get authors data based on current language
  const authors = useMemo(() => {
    return getAuthorsDataByLanguage(language);
  }, [language]);

  const author = authors.find((a) => a.slug === slug);

  if (!author) {
    return (
      <div className={`min-h-screen ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} flex items-center justify-center py-20`}>
        <div className="text-center px-4" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            {t('authors.notFound')}
          </h2>
          <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} mb-8`}>
            {t('authors.notFoundMessage')}
          </p>
          <Link
            href="/authors"
            className={`
              ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
              ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
              ${theme.buttonColors?.primaryButton?.textColor || 'text-white'}
              px-6 py-3 rounded-lg inline-block
              transition-all duration-200 hover:shadow-lg
            `}
          >
            {t('authors.backToAuthors')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-16`}>
      <div className={`${theme.layout?.containerWidth || 'max-w-7xl'} mx-auto px-4`} dir={isRTL ? "rtl" : "ltr"}>
        
        {/* Back Button */}
        <Link
          href="/authors"
          className={`
            inline-flex items-center gap-2
            text-sm ${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} mb-8
            hover:underline transition-all
            ${isRTL ? 'flex-row-reverse' : 'flex-row'}
          `}
        >
          <span>{isRTL ? "→" : "←"}</span>
          <span>{t('authors.backToAuthors')}</span>
        </Link>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          
          {/* Author Image */}
          <div className="relative">
            <img
              src={author.image}
              alt={author.name}
              className="w-full rounded-2xl shadow-2xl"
              onError={(e) => {
                e.target.src = '/placeholder-author.jpg';
              }}
            />
            
            {/* Book Count Badge */}
            {author.bookCount && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {author.bookCount} {author.bookCount === 1 ? t('authors.book') : t('authors.books')}
              </div>
            )}
          </div>

          <div>
            {/* Name */}
            <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
              {author.name}
            </h1>

            {/* Basic Info */}
            <div className={`flex flex-wrap items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`px-3 py-1 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} text-sm`}>
                {author.country || t('authors.unknown')}
              </span>
              {author.birthYear && (
                <>
                  <span className={`w-1 h-1 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}`}></span>
                  <span className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {t('authors.born')} {author.birthYear}
                  </span>
                </>
              )}
              {author.deathYear && (
                <>
                  <span className={`w-1 h-1 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')}`}></span>
                  <span className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {t('authors.died')} {author.deathYear}
                  </span>
                </>
              )}
            </div>

            {/* Biography */}
            <div className="mb-8">
              <h2 className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-3`}>
                {t('authors.biography')}
              </h2>
              <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} leading-relaxed whitespace-pre-line`}>
                {author.bio}
              </p>
            </div>

            {/* Genres */}
            {author.genres && author.genres.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-3`}>
                  {t('authors.genres')}
                </h2>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  {author.genres.map((genre, index) => (
                    <Link
                      key={index}
                      href={`/bookslist?genre=${encodeURIComponent(genre)}`}
                      className={`
                        px-3 py-1.5 rounded-full text-sm
                        ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}
                        ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}
                        hover:${theme.background?.bookCoverSide || 'bg-gray-200 dark:bg-gray-700'}
                        transition-all duration-200
                      `}
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Famous Work */}
            {author.mostFamousWork && (
              <div className="mb-8">
                <h2 className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-2`}>
                  {t('authors.mostFamousWork')}
                </h2>
                <p className={`${theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'} font-medium`}>
                  {author.mostFamousWork}
                </p>
              </div>
            )}

            {/* Awards */}
            {author.awards && author.awards.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-3`}>
                  {t('authors.awards')}
                </h2>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  {author.awards.map((award, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-sm ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'}`}
                    >
                      🏆 {award}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex flex-wrap gap-4 mt-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <Link
                href={`/bookslist?author=${encodeURIComponent(author.name)}`}
                className={`
                  ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
                  ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
                  ${theme.buttonColors?.primaryButton?.textColor || 'text-white'}
                  px-6 py-3 rounded-lg font-medium
                  transition-all duration-200 hover:shadow-lg
                  flex-1 text-center
                `}
              >
                {t('authors.viewBooksBy', { name: author.name })}
              </Link>

              {/* Wikipedia Link */}
              {author.socials?.wikipedia && (
                <a
                  href={author.socials.wikipedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'}
                    ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
                    ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
                    px-6 py-3 rounded-lg font-medium
                    transition-all duration-200 hover:shadow-lg
                    flex-1 text-center
                  `}
                >
                  {t('authors.wikipedia')}
                </a>
              )}
            </div>

            {/* Additional Social Links */}
            <div className={`flex gap-4 mt-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              {author.socials?.twitter && (
                <a
                  href={author.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} hover:${theme.textColors?.highlight || 'text-sky-600'} transition-colors`}
                >
                  𝕏
                </a>
              )}
              {author.socials?.instagram && (
                <a
                  href={author.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} hover:${theme.textColors?.highlight || 'text-sky-600'} transition-colors`}
                >
                  📷
                </a>
              )}
              {author.socials?.facebook && (
                <a
                  href={author.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} hover:${theme.textColors?.highlight || 'text-sky-600'} transition-colors`}
                >
                  📘
                </a>
              )}
              {author.socials?.website && (
                <a
                  href={author.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} hover:${theme.textColors?.highlight || 'text-sky-600'} transition-colors`}
                >
                  🌐
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDetails;