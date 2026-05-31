// src/components_drift/layout/feed.jsx

"use client";

import { useState } from "react";
import { 
  HiHeart, 
  HiChat, 
  HiShare, 
  HiBookmark, 
  HiDotsHorizontal,
  HiOutlineHeart,
  HiOutlineChat,
  HiOutlineShare,
  HiOutlineBookmark,
  HiPhotograph,
  HiEmojiHappy,
  HiCalendar,
  HiLocationMarker
} from "react-icons/hi";
import { FaRetweet, FaRegHeart, FaRegComment, FaRegBookmark } from "react-icons/fa";
import "./feed.css";

// Individual Post Component
function DriftPost({ post }) {
  const [liked, setLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="drift-post">
      <div className="drift-post-container">
        {/* Avatar */}
        <div className="drift-post-avatar">
          <img src={post.avatar} alt={post.name} />
        </div>

        {/* Content */}
        <div className="drift-post-content">
          {/* Header */}
          <div className="drift-post-header">
            <div className="drift-post-user">
              <span className="drift-post-name">{post.name}</span>
              {post.isVerified && (
                <span className="drift-verified-badge">✓</span>
              )}
              <span className="drift-post-username">@{post.username}</span>
              <span className="drift-post-time">· {post.time}</span>
            </div>
            
            <div className="drift-post-menu">
              <button onClick={() => setShowMenu(!showMenu)} className="drift-menu-btn">
                <HiDotsHorizontal />
              </button>
              {showMenu && (
                <div className="drift-post-dropdown">
                  <button>Report</button>
                  <button>Unfollow</button>
                  <button>Copy link</button>
                </div>
              )}
            </div>
          </div>

          {/* Content Text */}
          <div className="drift-post-text">
            <p>{post.content}</p>
          </div>

          {/* Media */}
          {post.image && (
            <div className="drift-post-media">
              <img src={post.image} alt="Post media" />
            </div>
          )}

          {/* Stats */}
          <div className="drift-post-stats">
            <span>{formatNumber(likeCount)} likes</span>
            <span>{formatNumber(post.comments)} comments</span>
            <span>{formatNumber(post.retweets)} reposts</span>
          </div>

          {/* Actions */}
          <div className="drift-post-actions">
            <button className="drift-action-btn comment" onClick={() => setShowComments(!showComments)}>
              <HiOutlineChat />
              <span>{formatNumber(post.comments)}</span>
            </button>
            
            <button className="drift-action-btn retweet">
              <FaRetweet />
              <span>{formatNumber(post.retweets)}</span>
            </button>
            
            <button className={`drift-action-btn like ${liked ? 'active' : ''}`} onClick={handleLike}>
              {liked ? <HiHeart /> : <HiOutlineHeart />}
              <span>{formatNumber(likeCount)}</span>
            </button>
            
            <button className={`drift-action-btn bookmark ${bookmarked ? 'active' : ''}`} onClick={() => setBookmarked(!bookmarked)}>
              {bookmarked ? <HiBookmark /> : <HiOutlineBookmark />}
            </button>
            
            <button className="drift-action-btn share">
              <HiOutlineShare />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="drift-comments-section">
              <div className="drift-comment-input">
                <img src="https://ui-avatars.com/api/?background=0284c7&color=fff&name=User" alt="Your avatar" />
                <input type="text" placeholder="Write a comment..." />
                <button>Post</button>
              </div>
              <div className="drift-comments-list">
                <div className="drift-comment">
                  <img src="https://ui-avatars.com/api/?background=059669&color=fff&name=John" alt="Avatar" />
                  <div className="drift-comment-content">
                    <div className="drift-comment-header">
                      <span className="drift-comment-name">John Doe</span>
                      <span className="drift-comment-time">2h ago</span>
                    </div>
                    <p>Great post! Really enjoyed reading this.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Post Component
function CreatePost() {
  const [postContent, setPostContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (postContent.trim()) {
      console.log("Posting:", postContent);
      setPostContent("");
    }
  };

  return (
    <div className="drift-create-post">
      <div className="drift-create-post-container">
        <div className="drift-create-post-avatar">
          <img src="https://ui-avatars.com/api/?background=0284c7&color=fff&name=User" alt="Your avatar" />
        </div>
        
        <div className="drift-create-post-content">
          <form onSubmit={handleSubmit}>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              rows="3"
            />
            
            <div className="drift-create-post-actions">
              <div className="drift-create-post-tools">
                <button type="button" className="drift-tool-btn">
                  <HiPhotograph />
                </button>
                <button type="button" className="drift-tool-btn">
                  <HiEmojiHappy />
                </button>
                <button type="button" className="drift-tool-btn">
                  <HiLocationMarker />
                </button>
                <button type="button" className="drift-tool-btn">
                  <HiCalendar />
                </button>
              </div>
              
              <button 
                type="submit" 
                className="drift-submit-btn"
                disabled={!postContent.trim()}
              >
                Drift
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Feed Tabs
function FeedTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "trending", label: "Trending" },
  ];

  return (
    <div className="drift-feed-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`drift-feed-tab ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
          {activeTab === tab.id && <div className="drift-tab-indicator"></div>}
        </button>
      ))}
    </div>
  );
}

// Main Feed Component
export default function DriftFeed() {
  const [activeTab, setActiveTab] = useState("for-you");
  const [posts, setPosts] = useState([
    {
      id: 1,
      name: "BookQubit",
      username: "bookqubit",
      time: "2h ago",
      content: "Just launched our new Drift feature! 🚀 Experience social media like never before. Connect with readers, authors, and creators from around the world. #Drift #BookQubit",
      image: null,
      likes: 1234,
      comments: 89,
      retweets: 234,
      avatar: "https://ui-avatars.com/api/?background=0284c7&color=fff&name=BookQubit",
      isVerified: true,
      liked: false,
    },
    {
      id: 2,
      name: "Tech News",
      username: "technews",
      time: "4h ago",
      content: "Breaking: New AI technology revolutionizes how we interact with social media. The future is here! 🚀",
      image: "https://picsum.photos/600/400?random=1",
      likes: 5678,
      comments: 456,
      retweets: 1234,
      avatar: "https://ui-avatars.com/api/?background=059669&color=fff&name=Tech+News",
      isVerified: true,
      liked: true,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      username: "sarahj",
      time: "6h ago",
      content: "Just finished reading an amazing book! Highly recommend 'The Midnight Library' by Matt Haig. Such a thought-provoking read. 📚✨",
      image: "https://picsum.photos/600/400?random=2",
      likes: 3456,
      comments: 234,
      retweets: 567,
      avatar: "https://ui-avatars.com/api/?background=7c3aed&color=fff&name=Sarah+Johnson",
      isVerified: false,
      liked: false,
    },
    {
      id: 4,
      name: "Writing Community",
      username: "writingcomm",
      time: "8h ago",
      content: "Tip for writers: The best time to write is when inspiration strikes. Keep a notebook handy at all times! ✍️ What's your writing routine?",
      image: null,
      likes: 2345,
      comments: 123,
      retweets: 456,
      avatar: "https://ui-avatars.com/api/?background=dc2626&color=fff&name=Writing+Community",
      isVerified: true,
      liked: false,
    },
    {
      id: 5,
      name: "Book Review",
      username: "bookreview",
      time: "10h ago",
      content: "Book Review: 'Project Hail Mary' - 5/5 stars! One of the best sci-fi books I've read this year. Amazing plot, great characters, and fascinating science. Must read! 🌟🌟🌟🌟🌟",
      image: "https://picsum.photos/600/400?random=3",
      likes: 7890,
      comments: 567,
      retweets: 890,
      avatar: "https://ui-avatars.com/api/?background=ea580c&color=fff&name=Book+Review",
      isVerified: false,
      liked: true,
    },
  ]);

  return (
    <div className="drift-feed">
      <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <CreatePost />
      <div className="drift-posts-list">
        {posts.map((post) => (
          <DriftPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}