"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaBlog,
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
  FaArrowRight,
} from "react-icons/fa";

// Sample blog data
const blogData = [
  {
    id: 1,
    title: "10 Books That Will Change Your Perspective on Life",
    slug: "10-books-that-will-change-your-perspective",
    excerpt: "Discover life-changing books that offer profound insights and new ways of thinking about the world around you.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Sarah Johnson",
    authorImage: "https://randomuser.me/api/portraits/women/1.jpg",
    date: "2024-05-15",
    category: "Book Lists",
    tags: ["Self-Help", "Philosophy", "Inspiration"],
    image: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=800&h=400&fit=crop",
    readTime: 8,
    views: 1234,
    likes: 89,
    comments: 23,
    featured: true,
  },
  {
    id: 2,
    title: "How to Build a Sustainable Reading Habit",
    slug: "how-to-build-sustainable-reading-habit",
    excerpt: "Practical tips and strategies to develop a consistent reading routine that lasts beyond the first few weeks.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Michael Chen",
    authorImage: "https://randomuser.me/api/portraits/men/2.jpg",
    date: "2024-05-10",
    category: "Reading Tips",
    tags: ["Productivity", "Habits", "Reading"],
    image: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?w=800&h=400&fit=crop",
    readTime: 5,
    views: 2345,
    likes: 156,
    comments: 45,
    featured: true,
  },
  {
    id: 3,
    title: "The Ultimate Guide to Starting a Book Club",
    slug: "ultimate-guide-starting-book-club",
    excerpt: "Everything you need to know about starting and running a successful book club, from choosing members to selecting books.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Emily Rodriguez",
    authorImage: "https://randomuser.me/api/portraits/women/3.jpg",
    date: "2024-05-05",
    category: "Community",
    tags: ["Book Club", "Community", "Discussion"],
    image: "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?w=800&h=400&fit=crop",
    readTime: 6,
    views: 3456,
    likes: 234,
    comments: 67,
    featured: false,
  },
  {
    id: 4,
    title: "Digital vs Physical Books: Pros and Cons",
    slug: "digital-vs-physical-books-pros-cons",
    excerpt: "An in-depth comparison of digital and physical books to help you decide which format suits your reading style best.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "David Kim",
    authorImage: "https://randomuser.me/api/portraits/men/4.jpg",
    date: "2024-04-28",
    category: "Reading Tips",
    tags: ["E-books", "Print Books", "Comparison"],
    image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=800&h=400&fit=crop",
    readTime: 4,
    views: 5678,
    likes: 345,
    comments: 89,
    featured: false,
  },
  {
    id: 5,
    title: "Why You Should Read Outside Your Comfort Zone",
    slug: "why-read-outside-comfort-zone",
    excerpt: "Explore the benefits of reading genres and authors you wouldn't normally choose and how it expands your horizons.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Jessica Williams",
    authorImage: "https://randomuser.me/api/portraits/women/5.jpg",
    date: "2024-04-20",
    category: "Reading Tips",
    tags: ["Diversity", "Growth", "Exploration"],
    image: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=800&h=400&fit=crop",
    readTime: 7,
    views: 4321,
    likes: 278,
    comments: 56,
    featured: false,
  },
  {
    id: 6,
    title: "The Best Books of 2024: A Mid-Year Review",
    slug: "best-books-2024-mid-year-review",
    excerpt: "A comprehensive look at the standout books of 2024 so far, across all genres and categories.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Robert Taylor",
    authorImage: "https://randomuser.me/api/portraits/men/6.jpg",
    date: "2024-04-15",
    category: "Book Lists",
    tags: ["Best of", "Reviews", "Recommendations"],
    image: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=800&h=400&fit=crop",
    readTime: 10,
    views: 2345,
    likes: 167,
    comments: 34,
    featured: true,
  },
  {
    id: 7,
    title: "How to Find More Time to Read",
    slug: "how-to-find-more-time-to-read",
    excerpt: "Practical strategies to carve out more reading time in your busy schedule, even with a full-time job and family.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Lisa Anderson",
    authorImage: "https://randomuser.me/api/portraits/women/7.jpg",
    date: "2024-04-10",
    category: "Reading Tips",
    tags: ["Time Management", "Productivity", "Tips"],
    image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?w=800&h=400&fit=crop",
    readTime: 5,
    views: 5432,
    likes: 298,
    comments: 76,
    featured: false,
  },
  {
    id: 8,
    title: "The Rise of BookTok: How TikTok is Revolutionizing Reading",
    slug: "rise-of-booktok-tiktok-revolutionizing-reading",
    excerpt: "How the book community on TikTok is driving sales, creating trends, and introducing millions to new authors.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    author: "Mark Wilson",
    authorImage: "https://randomuser.me/api/portraits/men/8.jpg",
    date: "2024-04-05",
    category: "Industry News",
    tags: ["Social Media", "Trends", "BookTok"],
    image: "https://images.pexels.com/photos/1676991/pexels-photo-1676991.jpeg?w=800&h=400&fit=crop",
    readTime: 6,
    views: 8765,
    likes: 567,
    comments: 123,
    featured: false,
  },
];

const categories = ["All", "Book Lists", "Reading Tips", "Community", "Industry News"];

const BlogPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const itemsPerPage = 6;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter blog posts
  const filteredPosts = blogData.filter((post) => {
    const matchesSearch = searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  // Featured posts
  const featuredPosts = blogData.filter(post => post.featured).slice(0, 2);

  const handleSave = (id) => {
    if (savedPosts.includes(id)) {
      setSavedPosts(savedPosts.filter(i => i !== id));
    } else {
      setSavedPosts([...savedPosts, id]);
    }
  };

  const handleLike = (id) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter(i => i !== id));
    } else {
      setLikedPosts([...likedPosts, id]);
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
              <FaBlog className={`text-4xl ${theme.textColors?.highlight || 'text-sky-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Blog
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Insights, tips, and stories from the BookQubit community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search articles..."
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

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && currentPage === 1 && !searchTerm && selectedCategory === "All" && (
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-6 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/footerpages/blog/${post.slug}`}
                  className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all hover:shadow-xl hover:scale-105`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white`}>
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {post.category}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={12} /> {formatDate(post.date)}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaEye size={12} /> {post.views}
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                      {post.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={post.authorImage} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                        <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{post.author}</span>
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
          Found {filteredPosts.length} articles
        </div>

        {/* Blog Grid */}
        {currentPosts.length === 0 ? (
          <div className="text-center py-16">
            <FaBlog className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No articles found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <div
                key={post.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all hover:shadow-xl hover:scale-105`}
              >
                <Link href={`/footerpages/blog/${post.slug}`}>
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {post.category}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={10} /> {formatDate(post.date)}
                      </span>
                    </div>
                    <h3 className={`font-bold text-md line-clamp-2 mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                      {post.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <img src={post.authorImage} alt={post.author} className="w-6 h-6 rounded-full object-cover" />
                        <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.preventDefault(); handleLike(post.id); }} className={`flex items-center gap-1 text-xs ${likedPosts.includes(post.id) ? 'text-blue-500' : theme.textColors?.secondary || 'text-gray-500'}`}>
                          <FaThumbsUp size={12} /> {likedPosts.includes(post.id) ? post.likes + 1 : post.likes}
                        </button>
                        <button className={`flex items-center gap-1 text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>
                          <FaComment size={12} /> {post.comments}
                        </button>
                        <button onClick={(e) => { e.preventDefault(); handleSave(post.id); }} className={`${savedPosts.includes(post.id) ? 'text-yellow-500' : theme.textColors?.secondary || 'text-gray-500'}`}>
                          {savedPosts.includes(post.id) ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                        </button>
                      </div>
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

export default BlogPage;