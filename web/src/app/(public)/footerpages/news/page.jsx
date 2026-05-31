"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaNewspaper,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaEye,
  FaThumbsUp,
  FaRegThumbsUp,
  FaComment,
} from "react-icons/fa";

// Sample news data
const newsData = [
  {
    id: 1,
    title: "BookQubit Launches New AI-Powered Book Recommendation Engine",
    slug: "bookqubit-ai-recommendation-engine",
    excerpt: "BookQubit introduces cutting-edge AI technology to help readers discover their next favorite book with personalized recommendations based on reading habits.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...",
    author: "Sarah Johnson",
    authorImage: "https://randomuser.me/api/portraits/women/1.jpg",
    date: "2024-05-15",
    category: "Product Launch",
    tags: ["AI", "Technology", "Recommendations"],
    image: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=800&h=400&fit=crop",
    readTime: 5,
    views: 1234,
    likes: 89,
    comments: 23,
    featured: true,
  },
  {
    id: 2,
    title: "Summer Reading Challenge 2024: Read 10 Books in 30 Days",
    slug: "summer-reading-challenge-2024",
    excerpt: "Join our annual summer reading challenge and earn exclusive badges, discounts, and a chance to win gift cards.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Michael Chen",
    authorImage: "https://randomuser.me/api/portraits/men/2.jpg",
    date: "2024-05-10",
    category: "Events",
    tags: ["Reading Challenge", "Summer", "Community"],
    image: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?w=800&h=400&fit=crop",
    readTime: 3,
    views: 2345,
    likes: 156,
    comments: 45,
    featured: false,
  },
  {
    id: 3,
    title: "Interview with Bestselling Author: Journey Behind the Pages",
    slug: "interview-bestselling-author",
    excerpt: "Exclusive interview with a renowned author discussing their creative process, inspirations, and upcoming works.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Emily Rodriguez",
    authorImage: "https://randomuser.me/api/portraits/women/3.jpg",
    date: "2024-05-05",
    category: "Author Interview",
    tags: ["Interview", "Authors", "Behind the Scenes"],
    image: "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?w=800&h=400&fit=crop",
    readTime: 8,
    views: 3456,
    likes: 234,
    comments: 67,
    featured: true,
  },
  {
    id: 4,
    title: "Top 20 Must-Read Books of 2024 So Far",
    slug: "top-20-books-2024",
    excerpt: "Our editors' picks for the best books of the year, from gripping thrillers to heartwarming romances.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "David Kim",
    authorImage: "https://randomuser.me/api/portraits/men/4.jpg",
    date: "2024-04-28",
    category: "Book Lists",
    tags: ["Best Sellers", "Recommendations", "Lists"],
    image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=800&h=400&fit=crop",
    readTime: 6,
    views: 5678,
    likes: 345,
    comments: 89,
    featured: false,
  },
  {
    id: 5,
    title: "The Rise of Audiobooks: How Listening is Changing Reading Habits",
    slug: "rise-of-audiobooks",
    excerpt: "Explore how audiobooks are revolutionizing the way we consume literature and the future of publishing.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Jessica Williams",
    authorImage: "https://randomuser.me/api/portraits/women/5.jpg",
    date: "2024-04-20",
    category: "Industry News",
    tags: ["Audiobooks", "Trends", "Publishing"],
    image: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=800&h=400&fit=crop",
    readTime: 7,
    views: 4321,
    likes: 278,
    comments: 56,
    featured: false,
  },
  {
    id: 6,
    title: "Independent Bookstores Making a Comeback",
    slug: "independent-bookstores-comeback",
    excerpt: "Despite digital challenges, independent bookstores are thriving with community-focused initiatives.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Robert Taylor",
    authorImage: "https://randomuser.me/api/portraits/men/6.jpg",
    date: "2024-04-15",
    category: "Bookstores",
    tags: ["Independent", "Local", "Community"],
    image: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=800&h=400&fit=crop",
    readTime: 4,
    views: 2345,
    likes: 167,
    comments: 34,
    featured: false,
  },
];

const categories = ["All", "Product Launch", "Events", "Author Interview", "Book Lists", "Industry News", "Bookstores"];

const NewsPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const itemsPerPage = 6;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter news
  const filteredNews = newsData.filter((news) => {
    const matchesSearch = searchTerm === "" ||
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // Featured news
  const featuredNews = newsData.filter(news => news.featured).slice(0, 2);

  const handleSave = (id) => {
    if (savedArticles.includes(id)) {
      setSavedArticles(savedArticles.filter(i => i !== id));
    } else {
      setSavedArticles([...savedArticles, id]);
    }
  };

  const handleLike = (id) => {
    if (likedArticles.includes(id)) {
      setLikedArticles(likedArticles.filter(i => i !== id));
    } else {
      setLikedArticles([...likedArticles, id]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaNewspaper className={`text-4xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            News & Updates
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Stay updated with the latest news, announcements, and stories from BookQubit
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search news, articles, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-48 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory !== "All") && (
            <div className="flex justify-end">
              <button onClick={clearFilters} className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Featured News Section */}
        {featuredNews.length > 0 && currentPage === 1 && !searchTerm && selectedCategory === "All" && (
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-6 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/footerpages/news/${news.slug}`}
                  className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all hover:shadow-xl hover:scale-105`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white`}>
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {news.category}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={12} /> {formatDate(news.date)}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaEye size={12} /> {news.views}
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                      {news.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {news.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={news.authorImage} alt={news.author} className="w-8 h-8 rounded-full object-cover" />
                        <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{news.author}</span>
                      </div>
                      <span className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'}`}>
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className={`mb-6 text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {filteredNews.length} articles
        </div>

        {/* News Grid */}
        {currentNews.length === 0 ? (
          <div className="text-center py-16">
            <FaNewspaper className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No articles found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentNews.map((news) => (
              <div
                key={news.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all hover:shadow-xl hover:scale-105`}
              >
                <Link href={`/footerpages/news/${news.slug}`}>
                  <div className="h-48 overflow-hidden">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {news.category}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={10} /> {formatDate(news.date)}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaEye size={10} /> {news.views}
                      </span>
                    </div>
                    <h3 className={`font-bold text-md line-clamp-2 mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                      {news.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {news.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.preventDefault(); handleLike(news.id); }} className={`flex items-center gap-1 text-sm ${likedArticles.includes(news.id) ? 'text-blue-500' : theme.textColors?.secondary || 'text-gray-500'}`}>
                          <FaThumbsUp size={14} /> {likedArticles.includes(news.id) ? news.likes + 1 : news.likes}
                        </button>
                        <button className={`flex items-center gap-1 text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>
                          <FaComment size={14} /> {news.comments}
                        </button>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); handleSave(news.id); }} className={`${savedArticles.includes(news.id) ? 'text-yellow-500' : theme.textColors?.secondary || 'text-gray-500'}`}>
                        {savedArticles.includes(news.id) ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              Previous
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
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;