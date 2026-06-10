"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaThumbsUp,
  FaRegThumbsUp,
  FaComment,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
} from "react-icons/fa";

// Sample blog data (in a real app, this would come from an API)
const blogData = [
  {
    id: 1,
    title: "10 Books That Will Change Your Perspective on Life",
    slug: "10-books-that-will-change-your-perspective",
    excerpt: "Discover life-changing books that offer profound insights and new ways of thinking.",
    content: `
      <p>Reading has the power to transform our thinking, challenge our assumptions, and open our minds to new possibilities. The following ten books have been carefully selected for their ability to shift perspectives and inspire personal growth.</p>
      
      <h2>The Power of Literature</h2>
      <p>Literature has always been a medium for change. From the philosophical works of ancient Greece to contemporary self-help books, the written word continues to shape how we see ourselves and the world around us.</p>
      
      <h2>Why These Books?</h2>
      <p>Each book on this list offers a unique lens through which to view life's challenges and opportunities. Whether you're seeking practical advice, philosophical insights, or simply a new way of thinking, these books deliver.</p>
      
      <h3>Key Takeaways</h3>
      <ul>
        <li>Embrace curiosity and lifelong learning</li>
        <li>Challenge your existing beliefs</li>
        <li>Develop empathy through diverse perspectives</li>
        <li>Find meaning in everyday experiences</li>
      </ul>
      
      <p>Start your journey today by picking up one of these transformative reads. You might be surprised by how much a single book can change your outlook on life.</p>
    `,
    author: "Sarah Johnson",
    authorImage: "https://randomuser.me/api/portraits/women/1.jpg",
    authorBio: "Sarah is a book enthusiast and literary critic with over 10 years of experience in the publishing industry. She loves discovering hidden gems and sharing them with readers.",
    date: "2024-05-15",
    category: "Book Lists",
    tags: ["Self-Help", "Philosophy", "Inspiration"],
    image: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=800&h=400&fit=crop",
    readTime: 8,
    views: 1234,
    likes: 89,
    comments: 23,
  },
  // Add more posts as needed
];

const BlogPostPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { theme, themeName } = useTheme();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    if (slug) {
      // Find post by slug
      const foundPost = blogData.find((post) => post.slug === slug);
      setPost(foundPost);
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this article: ${post.title}`;
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
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
          <p className={`mt-4 ${theme.textColors?.secondary || 'text-gray-600'}`}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'} mb-2`}>Article Not Found</h1>
          <p className={`${theme.textColors?.secondary || 'text-gray-600'} mb-6`}>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/footerpages/blog"
            className={`inline-block px-6 py-3 ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
          >
            Back to Blog
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
          <FaArrowLeft size={16} /> Back to Blog
        </button>

        {/* Header Image */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-xl">
          <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
        </div>

        {/* Title and Meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-sm rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
              {post.category}
            </span>
            <span className={`text-sm flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
              <FaCalendarAlt size={14} /> {formatDate(post.date)}
            </span>
            <span className={`text-sm flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
              📖 {post.readTime} min read
            </span>
          </div>
          
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img src={post.authorImage} alt={post.author} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{post.author}</p>
                <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>{post.authorBio?.substring(0, 60)}...</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isLiked ? 'bg-blue-500 text-white' : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || 'text-gray-900'}`}`}>
                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />} {isLiked ? post.likes + 1 : post.likes}
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
        </div>

        {/* Content */}
        <div className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''} mb-8`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              href={`/footerpages/blog?tag=${tag.toLowerCase()}`}
              className={`px-3 py-1 text-sm rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.secondary || 'text-gray-600'} hover:${theme.textColors?.highlight || 'text-sky-600'} transition`}
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Author Section */}
        <div className={`p-6 rounded-xl ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} mb-8`}>
          <div className="flex items-start gap-4">
            <img src={post.authorImage} alt={post.author} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>About {post.author}</h3>
              <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-600'}`}>{post.authorBio}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={`p-6 rounded-xl ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} border ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
            <FaComment /> Comments ({post.comments})
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

export default BlogPostPage;