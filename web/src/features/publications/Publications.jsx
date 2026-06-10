"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPublicationsDataByLanguage } from "@/data/publications";
import { FaSearch, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaGlobe, FaBook } from "react-icons/fa";

const Publications = () => {
  const { theme, themeName } = useTheme();
  const { language, t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Get publications data based on current language
  const publicationsData = useMemo(() => {
    return getPublicationsDataByLanguage(language);
  }, [language]);

  // Get unique types
  const types = ["All", ...new Set(publicationsData.map(pub => pub.type))];

  // Filter publications
  const filteredPublications = publicationsData.filter((pub) => {
    const matchesSearch = searchTerm === "" ||
      pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.headquarters?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || pub.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPublications = filteredPublications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || selectedType !== "All";

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaBuilding className={`text-4xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            {t('publications.pageTitle')}
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            {t('publications.pageDescription')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('publications.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-48 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? t('publications.filter.all') : type}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button onClick={clearFilters} className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                {t('publications.clearFilters')}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-6 text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          {t('publications.results', { count: filteredPublications.length })}
        </div>

        {/* Publications Grid */}
        {currentPublications.length === 0 ? (
          <div className="text-center py-16">
            <FaBuilding className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
              {t('publications.noResults')}
            </h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {t('publications.noResultsMessage')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentPublications.map((pub) => (
              <Link
                key={pub.id}
                href={`/publications/${pub.slug}`}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className={`p-6 ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} flex justify-center items-center h-40`}>
                  {pub.logo ? (
                    <img src={pub.logo} alt={pub.name} className="h-full object-contain" />
                  ) : (
                    <FaBuilding className={`text-5xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
                  )}
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-lg line-clamp-2 mb-1 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {pub.name}
                  </h3>
                  <p className={`text-xs mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {pub.type}
                  </p>
                  <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {pub.description}
                  </p>
                  <div className={`flex items-center gap-2 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {pub.founded && (
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} /> {pub.founded}
                      </span>
                    )}
                    {pub.headquarters && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt size={10} /> {pub.headquarters.split(',')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex justify-center gap-2 mt-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              {t('publications.previous')}
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg transition-all ${currentPage === i + 1 ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              {t('publications.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;