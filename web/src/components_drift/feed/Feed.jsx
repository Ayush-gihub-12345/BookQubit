"use client";

import { useState, useEffect } from 'react';
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaStar,
  FaRegStar,
  FaEllipsisH,
} from 'react-icons/fa';
import { useTheme } from '@/themes/useTheme';
import { useFont } from '@/contexts/FontContext';
import './Feed.css';

const Feed = () => {
  const { theme, themeName } = useTheme();
  const { currentFont } = useFont();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Mock data - replace with API call
  const mockPosts = [
    {
      id: 1,
      user: {
        name: 'Emma Watson',
        username: '@emma_reads',
        avatar: '/avatars/emma.jpg',
        isFollowing: true,
      },
      content: 'Just finished "Project Hail Mary" - absolutely incredible! Andy Weir does it again. 🚀📚 #BookRecommendation',
      book: {
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        cover: '/covers/project-hail-mary.jpg',
        rating: 4.8,
      },
      likes: 234,
      comments: 45,
      shares: 12,
      time: '2 hours ago',
      liked: false,
      saved: true,
    },
    {
      id: 2,
      user: {
        name: 'James Chen',
        username: '@james_loves_fantasy',
        avatar: '/avatars/james.jpg',
        isFollowing: false,
      },
      content: 'The Way of Kings is genuinely one of the best fantasy books I\'ve ever read. The world-building is insane! 🌟🌟🌟🌟🌟',
      book: {
        title: 'The Way of Kings',
        author: 'Brandon Sanderson',
        cover: '/covers/way-of-kings.jpg',
        rating: 4.9,
      },
      likes: 567,
      comments: 89,
      shares: 34,
      time: '5 hours ago',
      liked: true,
      saved: false,
    },
    {
      id: 3,
      user: {
        name: 'Book Club Hub',
        username: '@bookclubhub',
        avatar: '/avatars/bookclub.jpg',
        isFollowing: true,
      },
      content: '📖 April Book Pick: "Tomorrow, and Tomorrow, and Tomorrow" by Gabrielle Zevin\n\nJoin our discussion this Friday at 7PM EST!',
      book: null,
      likes: 892,
      comments: 156,
      shares: 89,
      time: '1 day ago',
      liked: false,
      saved: false,
    },
    {
      id: 4,
      user: {
        name: 'Sarah Johnson',
        username: '@sarah_reads',
        avatar: '/avatars/sarah.jpg',
        isFollowing: false,
      },
      content: 'Just added "Atomic Habits" to my reading list! Has anyone read it? 📚✨',
      book: {
        title: 'Atomic Habits',
        author: 'James Clear',
        cover: '/covers/atomic-habits.jpg',
        rating: 4.7,
      },
      likes: 123,
      comments: 34,
      shares: 5,
      time: '3 hours ago',
      liked: false,
      saved: false,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const handleComment = (postId) => {
    console.log('Open comments for post:', postId);
  };

  const handleShare = (postId) => {
    console.log('Share post:', postId);
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : filter === 'following'
    ? posts.filter(post => post.user.isFollowing)
    : posts;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="stars-container">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className={`star filled ${theme.iconColors?.starFilled || 'text-amber-400'}`} size={14} />;
          } else if (i === fullStars && hasHalfStar) {
            return <FaStar key={i} className={`star half ${theme.iconColors?.starFilled || 'text-amber-400'}`} size={14} />;
          } else {
            return <FaRegStar key={i} className={`star empty ${theme.iconColors?.starEmpty || 'text-gray-300 dark:text-gray-600'}`} size={14} />;
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`feed-loading ${theme.background?.page || 'bg-gray-50 dark:bg-gray-900'}`}>
        <div className={`spinner ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}`}></div>
        <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>
          Loading your feed...
        </p>
      </div>
    );
  }

  return (
    <div className="feed-container" style={{ fontFamily: currentFont?.family }}>
      {/* Story Bar */}
      <div className={`story-bar ${theme.background?.card || 'bg-white dark:bg-gray-800'} ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
        <div className="story-item">
          <div className={`story-ring ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}`}>
            <img src="/avatars/current-user.jpg" alt="Your story" />
          </div>
          <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>Your Story</span>
        </div>
        <div className="story-item">
          <div className="story-ring">
            <img src="/avatars/emma.jpg" alt="Emma" />
          </div>
          <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>Emma</span>
        </div>
        <div className="story-item">
          <div className="story-ring">
            <img src="/avatars/james.jpg" alt="James" />
          </div>
          <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>James</span>
        </div>
        <div className="story-item">
          <div className="story-ring">
            <img src="/avatars/sarah.jpg" alt="Sarah" />
          </div>
          <span className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>Sarah</span>
        </div>
      </div>

      {/* Create Post */}
      <div className={`create-post-card ${theme.background?.card || 'bg-white dark:bg-gray-800'} ${theme.border?.default || 'border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow'}`}>
        <div className="create-post-input">
          <img src="/avatars/current-user.jpg" alt="Your avatar" className="avatar" />
          <input 
            type="text" 
            placeholder="Share what you're reading..."
            className={`${theme.background?.input || 'bg-gray-50 dark:bg-gray-900'} ${theme.textColors?.primary || 'text-gray-900 dark:text-white'} ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}
            readOnly
          />
        </div>
        <div className="create-post-actions">
          <button className={`photo-btn ${theme.buttonColors?.secondaryButton?.background || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}>
            📸 Photo
          </button>
          <button className={`book-btn ${theme.buttonColors?.secondaryButton?.background || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}>
            📚 Add Book
          </button>
          <button className={`poll-btn ${theme.buttonColors?.secondaryButton?.background || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}>
            📊 Poll
          </button>
        </div>
      </div>

      {/* Feed Filters */}
      <div className={`feed-filters ${theme.background?.card || 'bg-white dark:bg-gray-800'} ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
        <button 
          className={`${filter === 'all' ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-500'} text-white` : theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}
          onClick={() => setFilter('all')}
        >
          For You
        </button>
        <button 
          className={`${filter === 'following' ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-500'} text-white` : theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}
          onClick={() => setFilter('following')}
        >
          Following
        </button>
        <button 
          className={`${filter === 'bookclub' ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-500'} text-white` : theme.textColors?.secondary || 'text-gray-700 dark:text-gray-300'}`}
          onClick={() => setFilter('bookclub')}
        >
          Book Clubs
        </button>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {filteredPosts.map(post => (
          <div key={post.id} className={`post-card ${theme.background?.card || 'bg-white dark:bg-gray-800'} ${theme.shadow?.container || 'shadow'} ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
            {/* Post Header */}
            <div className="post-header">
              <img src={post.user.avatar} alt={post.user.name} className="post-avatar" />
              <div className="post-user-info">
                <div className="post-user-name">
                  <span className={theme.textColors?.primary || 'text-gray-900 dark:text-white'}>{post.user.name}</span>
                  {post.user.isFollowing && <span className={`following-badge ${theme.background?.badge || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>Following</span>}
                </div>
                <div className={`post-username-time ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                  {post.user.username} • {post.time}
                </div>
              </div>
              <button className={`post-menu ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-500'}`}>
                <FaEllipsisH />
              </button>
            </div>

            {/* Post Content */}
            <div className="post-content">
              <p className={theme.textColors?.primary || 'text-gray-900 dark:text-white'}>{post.content}</p>
              
              {/* Book Card (if present) */}
              {post.book && (
                <div className={`book-card ${theme.background?.section || 'bg-gray-50 dark:bg-gray-900'} ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}`}>
                  <img src={post.book.cover} alt={post.book.title} className="book-cover" />
                  <div className="book-info">
                    <h4 className={theme.textColors?.primary || 'text-gray-900 dark:text-white'}>{post.book.title}</h4>
                    <p className={theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}>by {post.book.author}</p>
                    {renderStars(post.book.rating)}
                    <button className={`want-to-read-btn ${theme.buttonColors?.primaryButton?.background || 'bg-sky-500'} text-white`}>
                      Want to Read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post Stats */}
            <div className={`post-stats ${theme.textColors?.secondary || 'text-gray-500 dark:text-gray-400'}`}>
              <span>❤️ {post.likes} likes</span>
              <span>💬 {post.comments} comments</span>
              <span>🔄 {post.shares} shares</span>
            </div>

            {/* Post Actions */}
            <div className="post-actions">
              <button 
                className={`action-btn ${post.liked ? 'liked' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                {post.liked ? <FaHeart className="text-rose-500" size={20} /> : <FaRegHeart size={20} />}
                <span>Like</span>
              </button>
              <button className="action-btn" onClick={() => handleComment(post.id)}>
                <FaComment size={20} />
                <span>Comment</span>
              </button>
              <button className="action-btn" onClick={() => handleShare(post.id)}>
                <FaShare size={20} />
                <span>Share</span>
              </button>
              <button 
                className={`action-btn ${post.saved ? 'saved' : ''}`}
                onClick={() => handleSave(post.id)}
              >
                {post.saved ? <FaBookmark className="text-sky-500" size={20} /> : <FaRegBookmark size={20} />}
                <span>Save</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;