"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthorsDataByLanguage } from "@/data/authors";

const AuthorTrendDashboard = () => {
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("trending");

  // Get authors data based on current language
  const authorsData = useMemo(() => {
    return getAuthorsDataByLanguage(language);
  }, [language]);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Calculate trend scores based on followers, books, and popularity
  const calculateTrendScore = (author) => {
    // Use real data if available, otherwise generate mock data
    const followers = author.followers || Math.floor(Math.random() * 500000) + 5000;
    const booksWritten = author.bookCount || author.books?.length || Math.floor(Math.random() * 20) + 1;
    const popularity = author.popularity || Math.floor(Math.random() * 100) + 1;
    
    return {
      trendScore: Math.floor((followers / 10000) + (booksWritten * 2) + (popularity / 10)),
      followers,
      booksWritten,
      growth: `+${Math.floor(Math.random() * 60) + 20}%`
    };
  };

  // Process authors with trend data
  const trendingAuthors = useMemo(() => {
    if (!authorsData || authorsData.length === 0) return [];
    
    return authorsData.slice(0, 10).map((author, index) => {
      const trendData = calculateTrendScore(author);
      return {
        id: author.id || index + 1,
        name: author.name,
        avatar: author.image || author.avatar || "https://via.placeholder.com/80?text=Author",
        slug: author.slug,
        topBook: author.topBook || author.books?.[0]?.title || "Various Books",
        bio: author.bio,
        ...trendData
      };
    });
  }, [authorsData]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setAuthors(trendingAuthors);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [trendingAuthors]);

  const getSortedAuthors = () => {
    switch (sortBy) {
      case "trending":
        return [...authors].sort((a, b) => b.trendScore - a.trendScore);
      case "followers":
        return [...authors].sort((a, b) => b.followers - a.followers);
      case "books":
        return [...authors].sort((a, b) => b.booksWritten - a.booksWritten);
      default:
        return authors;
    }
  };

  // Get theme-specific gradient for rank badge
  const getRankGradient = () => {
    if (theme.buttonColors?.primaryButton?.background) {
      return theme.buttonColors.primaryButton.background;
    }
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" style={{ borderTopColor: '#667eea' }}></div>
        <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
          {t("trend.loading_authors")}
        </p>
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="no-data-container">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">✍️</span>
          <h3 className={`text-xl font-semibold ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} mb-2`}>
            {t("trend.no_authors")}
          </h3>
          <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {t("trend.check_back_authors")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`author-trend-dashboard ${theme.background?.bookCoverSide || 'bg-white dark:bg-gray-800'}`}>
      <div className="dashboard-header">
        <h2 className={theme.textColors?.primary || 'text-gray-900 dark:text-white'}>
          ✍️ {t("trend.trending_authors")}
        </h2>
        <div className="sort-controls">
          <label className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
            {t("trend.sort_by")}:
          </label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={`${theme.background?.section || 'bg-white dark:bg-gray-900'} ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer`}
          >
            <option value="trending">{t("trend.sort_trending")}</option>
            <option value="followers">{t("trend.sort_followers")}</option>
            <option value="books">{t("trend.sort_books")}</option>
          </select>
        </div>
      </div>

      <div className="authors-grid">
        {getSortedAuthors().map((author, idx) => (
          <Link href={`/authors/${author.slug}`} key={author.id}>
            <div className={`author-card ${theme.background?.section || 'bg-white dark:bg-gray-900'} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
              <div className="author-rank" style={{ background: getRankGradient() }}>
                #{idx + 1}
              </div>
              
              <div className="author-header">
                <img 
                  src={author.avatar} 
                  alt={author.name} 
                  className="author-avatar"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/80?text=Author";
                  }}
                />
                <div className="author-info">
                  <h3 className={`author-name ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                    {author.name}
                  </h3>
                  <p className={`author-stats ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                    📚 {author.booksWritten} {t("trend.books_written")} • 👥 {author.followers.toLocaleString()} {t("trend.followers")}
                  </p>
                </div>
              </div>
              
              <div className="author-details">
                <div className="trend-info">
                  <span className="trend-score">🔥 {author.trendScore}</span>
                  <span className="growth-badge">{author.growth}</span>
                </div>
                <div className="top-book">
                  <span className="top-book-label">{t("trend.top_book")}:</span>
                  <span className="top-book-title">"{author.topBook}"</span>
                </div>
              </div>
              
              <button className={`view-details-btn ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'} text-white transition-all duration-300 hover:scale-105 mt-4`}>
                {t("trend.view_details")}
              </button>
            </div>
          </Link>
        ))}
      </div>

      <style jsx="true">{`
        .author-trend-dashboard {
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-controls label {
          font-weight: 500;
        }

        .sort-controls select {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .authors-grid {
          display: grid;
          gap: 1rem;
        }

        .author-card {
          border-radius: 1rem;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .author-card:hover {
          transform: translateX(8px);
        }

        .author-rank {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: bold;
          z-index: 2;
        }

        .author-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
          padding: 1rem 1rem 0 1rem;
        }

        .author-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #f59e0b;
        }

        .author-info {
          flex: 1;
        }

        .author-name {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .author-stats {
          margin: 0;
          font-size: 0.8rem;
        }

        .author-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }

        .dark .author-details {
          border-color: #374151;
        }

        .trend-info {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .trend-score {
          font-size: 1.25rem;
          font-weight: bold;
          color: #f59e0b;
        }

        .growth-badge {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .top-book {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }

        .top-book-label {
          color: #6b7280;
          font-weight: 500;
        }

        .top-book-title {
          color: #667eea;
          font-weight: 600;
        }

        .view-details-btn {
          width: calc(100% - 2rem);
          margin: 0 1rem 1rem 1rem;
          padding: 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
        }

        .loader {
          border: 3px solid #f3f4f6;
          border-top: 3px solid;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-data-container {
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .author-trend-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .author-header {
            flex-direction: column;
            text-align: center;
          }

          .author-details {
            flex-direction: column;
            text-align: center;
          }

          .author-rank {
            top: 0.5rem;
            right: 0.5rem;
          }

          .top-book {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthorTrendDashboard;