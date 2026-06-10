"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import {
  FaArrowLeft,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaBook,
  FaThumbsUp,
  FaRegThumbsUp,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
} from "react-icons/fa";

// Sample book reviews data (in a real app, this would come from an API)
const bookReviewsData = [
  {
    id: 1,
    title: "The Midnight Library",
    slug: "the-midnight-library-review",
    bookTitle: "The Midnight Library",
    bookAuthor: "Matt Haig",
    bookCover: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=400&h=600&fit=crop",
    rating: 4.8,
    excerpt: "A captivating exploration of regret, choices, and the infinite possibilities of life.",
    content: `
      <p>The Midnight Library by Matt Haig is a beautiful, thought-provoking novel that explores the infinite possibilities of life and the choices we make.</p>
      
      <h2>The Premise</h2>
      <p>The story follows Nora Seed, a woman who finds herself in a mysterious library between life and death. Here, each book offers a chance to try out a different life she could have lived - the "what ifs" we all wonder about.</p>
      
      <h2>What Makes It Special</h2>
      <p>Haig's writing is both poetic and accessible, blending philosophical questions with heartfelt storytelling. The book explores themes of regret, mental health, and the meaning of happiness without being preachy.</p>
      
      <h3>Key Themes</h3>
      <ul>
        <li>The importance of small decisions</li>
        <li>Overcoming regret and self-doubt</li>
        <li>Finding meaning in ordinary moments</li>
        <li>The value of human connection</li>
      </ul>
      
      <h2>Final Verdict</h2>
      <p>The Midnight Library is a must-read for anyone who has ever wondered "what if." It's a reminder that no life is perfect, but every life has value. Highly recommended for fans of literary fiction and philosophical novels.</p>
    `,
    reviewer: "Sarah Johnson",
    reviewerImage: "https://randomuser.me/api/portraits/women/1.jpg",
    reviewerBio: "Sarah is a book reviewer and literary critic with over 10 years of experience. She specializes in contemporary fiction and self-help books.",
    date: "2024-05-15",
    category: "Fiction",
    genre: ["Literary Fiction", "Fantasy"],
    tags: ["Self-Discovery", "Mental Health", "Philosophical"],
    readTime: 6,
    helpful: 234,
    comments: 45,
  },
  // Add more reviews as needed
];

const BookReviewDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { theme, themeName } = useTheme();
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    if (slug) {
      const foundReview = bookReviewsData.find((review) => review.slug === slug);
      setReview(foundReview);
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this book review: ${review.bookTitle}`;
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(review.bookTitle)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-amber-400 w-5 h-5" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-amber-400 w-5 h-5" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600 w-5 h-5" />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
          <p className={`mt-4 ${theme.textColors?.secondary || 'text-gray-600'}`}>Loading review...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto px-4">
          <FaStar className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
          <h1 className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'} mb-2`}>Review Not Found</h1>
          <p className={`${theme.textColors?.secondary || 'text-gray-600'} mb-6`}>
            The book review you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/footerpages/bookreviews"
            className={`inline-block px-6 py-3 ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
          >
            Back to Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-6 ${theme.textColors?.highlight || 'text-sky-600'} hover:underline transition`}
        >
          <FaArrowLeft size={16} /> Back to Reviews
        </button>

        {/* Book Header */}
        <div className={`rounded-2xl overflow-hidden mb-8 ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 p-6 flex justify-center">
              <img src={review.bookCover} alt={review.bookTitle} className="w-48 h-auto object-cover rounded-lg shadow-xl" />
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                {review.bookTitle}
              </h1>
              <p className={`text-xl mb-3 ${theme.textColors?.secondary || 'text-gray-600'}`}>by {review.bookAuthor}</p>
              <div className="mb-4">{renderStars(review.rating)}</div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-sm flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                  <FaCalendarAlt size={14} /> {formatDate(review.date)}
                </span>
                <span className={`text-sm flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                  <FaBook size={14} /> {review.category}
                </span>
                <span className={`text-sm flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                  📖 {review.readTime} min read
                </span>
              </div>
              <p className={`text-lg italic ${theme.textColors?.secondary || 'text-gray-600'}`}>
                "{review.excerpt}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <img src={review.reviewerImage} alt={review.reviewer} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{review.reviewer}</p>
              <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>Book Reviewer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleHelpful} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isHelpful ? 'bg-blue-500 text-white' : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-900'}`}`}>
              {isHelpful ? <FaThumbsUp /> : <FaRegThumbsUp />} Helpful ({isHelpful ? review.helpful + 1 : review.helpful})
            </button>
            <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isSaved ? 'bg-yellow-500 text-white' : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-900'}`}`}>
              {isSaved ? <FaBookmark /> : <FaRegBookmark />} Save
            </button>
            <div className="relative">
              <button onClick={() => setShowShareMenu(!showShareMenu)} className={`px-4 py-2 rounded-lg transition-all ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-900'}`}>
                <FaShare /> Share
              </button>
              {showShareMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 overflow-hidden ${theme.background?.section || 'bg-white dark:bg-gray-800'} border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
                  <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <FaTwitter className="text-blue-400" /> Twitter
                  </button>
                  <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <FaFacebook className="text-blue-600" /> Facebook
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <FaLinkedin className="text-blue-700" /> LinkedIn
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <FaLink /> Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''} mb-8`}
          dangerouslySetInnerHTML={{ __html: review.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          {review.tags.map((tag, index) => (
            <Link
              key={index}
              href={`/footerpages/bookreviews?tag=${tag.toLowerCase()}`}
              className={`px-3 py-1 text-sm rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.secondary || 'text-gray-600'} hover:${theme.textColors?.highlight || 'text-sky-600'} transition`}
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Reviewer Bio */}
        <div className={`p-6 rounded-xl ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} mb-8`}>
          <div className="flex items-start gap-4">
            <img src={review.reviewerImage} alt={review.reviewer} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>About {review.reviewer}</h3>
              <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{review.reviewerBio}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={`p-6 rounded-xl ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
            <FaComment /> Comments ({review.comments})
          </h3>
          <div className="text-center py-8">
            <p className={theme.textColors?.secondary || 'text-gray-600'}>No comments yet. Be the first to share your thoughts!</p>
            <button className={`mt-4 px-6 py-2 ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}>
              Write a Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReviewDetailPage;