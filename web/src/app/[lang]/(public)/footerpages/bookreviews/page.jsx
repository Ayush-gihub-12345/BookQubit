"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaBook,
  FaThumbsUp,
  FaRegThumbsUp,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaFilter,
} from "react-icons/fa";

// Sample book reviews data
const bookReviewsData = [
  {
    id: 1,
    title: "The Midnight Library",
    slug: "the-midnight-library-review",
    bookTitle: "The Midnight Library",
    bookAuthor: "Matt Haig",
    bookCover: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=200&h=300&fit=crop",
    rating: 4.8,
    excerpt: "A captivating exploration of regret, choices, and the infinite possibilities of life. Matt Haig delivers a thought-provoking novel that stays with you long after the last page.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "Sarah Johnson",
    reviewerImage: "https://randomuser.me/api/portraits/women/1.jpg",
    date: "2024-05-15",
    category: "Fiction",
    genre: ["Literary Fiction", "Fantasy"],
    tags: ["Self-Discovery", "Mental Health", "Philosophical"],
    readTime: 6,
    helpful: 234,
    comments: 45,
    featured: true,
  },
  {
    id: 2,
    title: "Atomic Habits: An In-Depth Review",
    slug: "atomic-habits-review",
    bookTitle: "Atomic Habits",
    bookAuthor: "James Clear",
    bookCover: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?w=200&h=300&fit=crop",
    rating: 4.9,
    excerpt: "James Clear's practical guide to building good habits and breaking bad ones is a game-changer for personal development.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "Michael Chen",
    reviewerImage: "https://randomuser.me/api/portraits/men/2.jpg",
    date: "2024-05-10",
    category: "Non-Fiction",
    genre: ["Self-Help", "Productivity"],
    tags: ["Habits", "Personal Growth", "Motivation"],
    readTime: 5,
    helpful: 456,
    comments: 78,
    featured: true,
  },
  {
    id: 3,
    title: "Project Hail Mary: A Masterpiece",
    slug: "project-hail-mary-review",
    bookTitle: "Project Hail Mary",
    bookAuthor: "Andy Weir",
    bookCover: "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?w=200&h=300&fit=crop",
    rating: 4.9,
    excerpt: "Andy Weir delivers another brilliant sci-fi adventure filled with problem-solving, humor, and heart.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "Emily Rodriguez",
    reviewerImage: "https://randomuser.me/api/portraits/women/3.jpg",
    date: "2024-05-05",
    category: "Science Fiction",
    genre: ["Sci-Fi", "Adventure"],
    tags: ["Space", "Survival", "Problem Solving"],
    readTime: 7,
    helpful: 345,
    comments: 56,
    featured: false,
  },
  {
    id: 4,
    title: "Where the Crawdads Sing Review",
    slug: "where-the-crawdads-sing-review",
    bookTitle: "Where the Crawdads Sing",
    bookAuthor: "Delia Owens",
    bookCover: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?w=200&h=300&fit=crop",
    rating: 4.7,
    excerpt: "A beautiful coming-of-age story that blends mystery, romance, and nature into an unforgettable tale.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "David Kim",
    reviewerImage: "https://randomuser.me/api/portraits/men/4.jpg",
    date: "2024-04-28",
    category: "Fiction",
    genre: ["Mystery", "Romance"],
    tags: ["Nature", "Coming of Age", "Mystery"],
    readTime: 6,
    helpful: 567,
    comments: 89,
    featured: false,
  },
  {
    id: 5,
    title: "The Psychology of Money",
    slug: "psychology-of-money-review",
    bookTitle: "The Psychology of Money",
    bookAuthor: "Morgan Housel",
    bookCover: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=200&h=300&fit=crop",
    rating: 4.8,
    excerpt: "Morgan Housel explores the fascinating ways our psychology affects financial decisions.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "Jessica Williams",
    reviewerImage: "https://randomuser.me/api/portraits/women/5.jpg",
    date: "2024-04-20",
    category: "Non-Fiction",
    genre: ["Finance", "Psychology"],
    tags: ["Money", "Behavioral Economics", "Wealth"],
    readTime: 5,
    helpful: 678,
    comments: 67,
    featured: false,
  },
  {
    id: 6,
    title: "Dune: The Classic Revisited",
    slug: "dune-classic-review",
    bookTitle: "Dune",
    bookAuthor: "Frank Herbert",
    bookCover: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?w=200&h=300&fit=crop",
    rating: 4.9,
    excerpt: "A timeless masterpiece of science fiction that continues to influence generations of readers.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "Robert Taylor",
    reviewerImage: "https://randomuser.me/api/portraits/men/6.jpg",
    date: "2024-04-15",
    category: "Science Fiction",
    genre: ["Epic Fantasy", "Political Sci-Fi"],
    tags: ["Classic", "World-Building", "Politics"],
    readTime: 8,
    helpful: 789,
    comments: 123,
    featured: true,
  },
  {
    id: 7,
    title: "Becoming by Michelle Obama",
    slug: "becoming-michelle-obama-review",
    bookTitle: "Becoming",
    bookAuthor: "Michelle Obama",
    bookCover: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?w=200&h=300&fit=crop",
    rating: 4.9,
    excerpt: "An intimate, powerful, and inspiring memoir from the former First Lady.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    reviewer: "Lisa Anderson",
    reviewerImage: "https://randomuser.me/api/portraits/women/7.jpg",
    date: "2024-04-10",
    category: "Biography",
    genre: ["Memoir", "Inspirational"],
    tags: ["Leadership", "Women", "Inspiration"],
    readTime: 7,
    helpful: 890,
    comments: 145,
    featured: false,
  },
];

const categories = ["All", "Fiction", "Non-Fiction", "Science Fiction", "Biography"];
const ratings = [5, 4, 3, 2, 1];

const BookReviewsPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedReviews, setSavedReviews] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter reviews
  const filteredReviews = bookReviewsData.filter((review) => {
    const matchesSearch = searchTerm === "" ||
      review.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || review.category === selectedCategory;
    const matchesRating = selectedRating === 0 || review.rating >= selectedRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // Featured reviews
  const featuredReviews = filteredReviews.filter(review => review.featured).slice(0, 2);

  const handleSave = (id) => {
    if (savedReviews.includes(id)) {
      setSavedReviews(savedReviews.filter(i => i !== id));
    } else {
      setSavedReviews([...savedReviews, id]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedRating(0);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-amber-400 w-4 h-4" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-amber-400 w-4 h-4" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 w-4 h-4" />
        ))}
        <span className={`text-sm ml-2 ${theme.textColors?.secondary || 'text-gray-500'}`}>{rating}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All" || selectedRating !== 0;

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaStar className={`text-4xl ${theme.textColors?.highlight || 'text-yellow-500'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Book Reviews
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Honest, in-depth reviews of the latest and greatest books
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by book title, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${showFilters ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-600'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}`}
            >
              <FaFilter /> Filters {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">!</span>}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`p-4 rounded-lg ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} mb-4`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedCategory === category ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Minimum Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {ratings.map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating === 5 ? rating : rating)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedRating === (rating === 5 ? rating : rating) ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {rating}+ Stars
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex justify-end mt-2">
              <button onClick={clearFilters} className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-6 text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {filteredReviews.length} book reviews
        </div>

        {/* Featured Reviews */}
        {featuredReviews.length > 0 && currentPage === 1 && !hasActiveFilters && (
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-6 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
              Featured Reviews
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/footerpages/bookreviews/${review.slug}`}
                  className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all hover:shadow-xl hover:scale-105`}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3">
                      <img src={review.bookCover} alt={review.bookTitle} className="w-full h-48 sm:h-full object-cover" />
                    </div>
                    <div className="p-6 sm:w-2/3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full bg-red-500 text-white`}>Featured</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                          {review.category}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                        {review.bookTitle}
                      </h3>
                      <p className={`text-sm mb-2 ${theme.textColors?.secondary || 'text-gray-600'}`}>by {review.bookAuthor}</p>
                      <div className="mb-3">{renderStars(review.rating)}</div>
                      <p className={`text-sm line-clamp-2 mb-4 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {review.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={review.reviewerImage} alt={review.reviewer} className="w-6 h-6 rounded-full object-cover" />
                          <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{review.reviewer}</span>
                        </div>
                        <span className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'}`}>
                          Read Review →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {currentReviews.length === 0 ? (
          <div className="text-center py-16">
            <FaStar className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No reviews found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentReviews.map((review) => (
              <div
                key={review.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all hover:shadow-xl hover:scale-105`}
              >
                <Link href={`/footerpages/bookreviews/${review.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={review.bookCover} alt={review.bookTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <FaThumbsUp size={10} /> {review.helpful}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {review.category}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={10} /> {formatDate(review.date)}
                      </span>
                    </div>
                    <h3 className={`font-bold text-md line-clamp-2 mb-1 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                      {review.bookTitle}
                    </h3>
                    <p className={`text-xs mb-2 ${theme.textColors?.secondary || 'text-gray-500'}`}>by {review.bookAuthor}</p>
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    <p className={`text-xs line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {review.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <img src={review.reviewerImage} alt={review.reviewer} className="w-5 h-5 rounded-full object-cover" />
                        <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{review.reviewer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.preventDefault(); handleSave(review.id); }} className={`${savedReviews.includes(review.id) ? 'text-yellow-500' : theme.textColors?.secondary || 'text-gray-500'}`}>
                          {savedReviews.includes(review.id) ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
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

export default BookReviewsPage;