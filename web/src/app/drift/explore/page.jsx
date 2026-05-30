// src/app/drift/explore/page.jsx

"use client";

import { useState, useEffect } from "react";
import { 
  HiSearch, 
  HiFire, 
  HiUserAdd,
  HiHeart, 
  HiChat, 
  HiShare, 
  HiBookmark, 
  HiDotsHorizontal,
  HiOutlineHeart,
  HiOutlineChat,
  HiOutlineShare,
  HiOutlineBookmark
} from "react-icons/hi";
import { FaRetweet, FaCrown, FaCompass } from "react-icons/fa";
import "./explore.css";

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  // Move following state to component level
  const [followingState, setFollowingState] = useState({});

  // Categories
  const categories = [
    { id: "for-you", label: "For You", icon: <FaCompass /> },
    { id: "trending", label: "Trending", icon: <HiFire /> },
    { id: "technology", label: "Tech", icon: "💻" },
    { id: "books", label: "Books", icon: "📚" },
    { id: "art", label: "Art", icon: "🎨" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "gaming", label: "Gaming", icon: "🎮" },
    { id: "sports", label: "Sports", icon: "⚽" },
  ];

  // Sample posts data
  const samplePosts = [
    {
      id: 1,
      name: "BookQubit",
      username: "bookqubit",
      time: "2h ago",
      content: "Excited to announce our new Explore feature! Discover amazing content tailored just for you. #Drift #BookQubit",
      image: null,
      likes: 1234,
      comments: 89,
      retweets: 234,
      avatar: "https://ui-avatars.com/api/?background=0284c7&color=fff&name=BookQubit",
      isVerified: true,
      category: "for-you",
      liked: false,
    },
    {
      id: 2,
      name: "TechCrunch",
      username: "techcrunch",
      time: "4h ago",
      content: "Breaking: New AI technology is revolutionizing how we interact with social media. The future of digital connection is here! 🚀",
      image: "https://picsum.photos/600/400?random=1",
      likes: 5678,
      comments: 456,
      retweets: 1234,
      avatar: "https://ui-avatars.com/api/?background=059669&color=fff&name=TechCrunch",
      isVerified: true,
      category: "technology",
      liked: false,
    },
    {
      id: 3,
      name: "Author Spotlight",
      username: "authorspotlight",
      time: "6h ago",
      content: "Featured author of the week: Stephen King! His latest masterpiece is captivating readers worldwide. Have you read it yet? 📚✨",
      image: "https://picsum.photos/600/400?random=2",
      likes: 3456,
      comments: 234,
      retweets: 567,
      avatar: "https://ui-avatars.com/api/?background=7c3aed&color=fff&name=Author+Spotlight",
      isVerified: true,
      category: "books",
      liked: false,
    },
    {
      id: 4,
      name: "Digital Art Daily",
      username: "digitalartdaily",
      time: "8h ago",
      content: "Check out this stunning digital artwork created by our community member! 🎨 The detail and creativity is incredible.",
      image: "https://picsum.photos/600/400?random=3",
      likes: 2345,
      comments: 123,
      retweets: 456,
      avatar: "https://ui-avatars.com/api/?background=dc2626&color=fff&name=Digital+Art",
      isVerified: false,
      category: "art",
      liked: false,
    },
    {
      id: 5,
      name: "Gaming News",
      username: "gamingnews",
      time: "10h ago",
      content: "Major esports tournament announced with $1M prize pool! Who's ready to compete? 🎮 Registration now open.",
      image: "https://picsum.photos/600/400?random=4",
      likes: 7890,
      comments: 567,
      retweets: 890,
      avatar: "https://ui-avatars.com/api/?background=ea580c&color=fff&name=Gaming+News",
      isVerified: true,
      category: "gaming",
      liked: false,
    },
    {
      id: 6,
      name: "Music Weekly",
      username: "musicweekly",
      time: "12h ago",
      content: "New album releases this week: Taylor Swift, Drake, and more! Which one are you excited about? 🎵",
      image: null,
      likes: 4567,
      comments: 345,
      retweets: 678,
      avatar: "https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=Music+Weekly",
      isVerified: true,
      category: "music",
      liked: false,
    },
    {
      id: 7,
      name: "Sports Center",
      username: "sportscenter",
      time: "14h ago",
      content: "Incredible match today! The championship finals went into overtime. What a game! 🏆⚽",
      image: "https://picsum.photos/600/400?random=5",
      likes: 12345,
      comments: 890,
      retweets: 2345,
      avatar: "https://ui-avatars.com/api/?background=ef4444&color=fff&name=Sports+Center",
      isVerified: true,
      category: "sports",
      liked: false,
    },
  ];

  // Trending topics
  const sampleTrending = [
    { id: 1, rank: 1, topic: "#AIRevolution", posts: "125K", category: "Technology" },
    { id: 2, rank: 2, topic: "BookQubit Launch", posts: "89K", category: "Books" },
    { id: 3, rank: 3, topic: "#SummerReads", posts: "67K", category: "Books" },
    { id: 4, rank: 4, topic: "New Album Drops", posts: "45K", category: "Music" },
    { id: 5, rank: 5, topic: "#GamingTournament", posts: "234K", category: "Gaming" },
  ];

  // Suggested users
  const sampleUsers = [
    { id: 1, name: "Elon Musk", username: "elonmusk", avatar: "https://ui-avatars.com/api/?background=0284c7&color=fff&name=Elon+Musk", followers: "45M", isVerified: true },
    { id: 2, name: "NASA", username: "nasa", avatar: "https://ui-avatars.com/api/?background=059669&color=fff&name=NASA", followers: "32M", isVerified: true },
    { id: 3, name: "Stephen King", username: "stephenking", avatar: "https://ui-avatars.com/api/?background=7c3aed&color=fff&name=Stephen+King", followers: "8.5M", isVerified: true },
    { id: 4, name: "Drift Official", username: "drift", avatar: "https://ui-avatars.com/api/?background=dc2626&color=fff&name=Drift", followers: "1.2M", isVerified: true },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredPosts = samplePosts;
      
      // Filter by category
      if (activeCategory !== "for-you" && activeCategory !== "trending") {
        filteredPosts = samplePosts.filter(post => post.category === activeCategory);
      }
      
      // Filter by search query
      if (searchQuery) {
        filteredPosts = filteredPosts.filter(post => 
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setPosts(filteredPosts);
      setTrendingTopics(sampleTrending);
      setSuggestedUsers(sampleUsers);
      setLoading(false);
    }, 500);
  }, [activeCategory, searchQuery]);

  // Handle follow/unfollow
  const handleFollow = (userId) => {
    setFollowingState(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Handle like/unlike
  const handleLike = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  // Handle bookmark
  const handleBookmark = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, bookmarked: !post.bookmarked }
          : post
      )
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Post Component
  const PostCard = ({ post }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="explore-post">
        <div className="explore-post-container">
          <div className="explore-post-avatar">
            <img src={post.avatar} alt={post.name} />
          </div>
          
          <div className="explore-post-content">
            <div className="explore-post-header">
              <div className="explore-post-user">
                <span className="explore-post-name">{post.name}</span>
                {post.isVerified && <span className="verified-badge">✓</span>}
                <span className="explore-post-username">@{post.username}</span>
                <span className="explore-post-time">· {post.time}</span>
              </div>
              
              <div className="explore-post-menu">
                <button onClick={() => setShowMenu(!showMenu)} className="menu-btn">
                  <HiDotsHorizontal />
                </button>
                {showMenu && (
                  <div className="post-dropdown">
                    <button>Report</button>
                    <button>Not interested</button>
                    <button>Copy link</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="explore-post-text">
              <p>{post.content}</p>
            </div>
            
            {post.image && (
              <div className="explore-post-media">
                <img src={post.image} alt="Post media" />
              </div>
            )}
            
            <div className="explore-post-actions">
              <button className={`action-btn like ${post.liked ? 'active' : ''}`} onClick={() => handleLike(post.id)}>
                {post.liked ? <HiHeart /> : <HiOutlineHeart />}
                <span>{formatNumber(post.likes)}</span>
              </button>
              <button className="action-btn comment">
                <HiOutlineChat />
                <span>{formatNumber(post.comments)}</span>
              </button>
              <button className="action-btn retweet">
                <FaRetweet />
                <span>{formatNumber(post.retweets)}</span>
              </button>
              <button className={`action-btn bookmark ${post.bookmarked ? 'active' : ''}`} onClick={() => handleBookmark(post.id)}>
                {post.bookmarked ? <HiBookmark /> : <HiOutlineBookmark />}
              </button>
              <button className="action-btn share">
                <HiOutlineShare />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading Spinner
  if (loading) {
    return (
      <div className="explore-loading">
        <div className="loading-spinner"></div>
        <p>Loading explore feed...</p>
      </div>
    );
  }

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="explore-header">
        <h1>Explore</h1>
        <p>Discover amazing content and connect with creators</p>
      </div>

      {/* Search Bar */}
      <div className="explore-search-container">
        <div className="explore-search-box">
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for posts, people, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="explore-search-input"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="explore-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="explore-grid">
        {/* Left Column - Posts Feed */}
        <div className="explore-feed">
          {posts.length === 0 ? (
            <div className="explore-empty">
              <FaCompass className="empty-icon" />
              <h3>No posts found</h3>
              <p>Try searching for something else or check out trending topics</p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="explore-sidebar">
          {/* Trending Topics */}
          <div className="trending-card">
            <div className="card-header">
              <HiFire className="card-icon" />
              <h3>Trending Now</h3>
            </div>
            <div className="trending-list">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="trending-item">
                  <div className="trending-rank">{topic.rank}</div>
                  <div className="trending-info">
                    <div className="trending-topic">{topic.topic}</div>
                    <div className="trending-stats">
                      <span>{topic.posts} posts</span>
                      <span className="trending-category">{topic.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="show-more-btn">Show more</button>
          </div>

          {/* Suggested Users */}
          <div className="suggestions-card">
            <div className="card-header">
              <HiUserAdd className="card-icon" />
              <h3>Who to Follow</h3>
            </div>
            <div className="suggestions-list">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="suggestion-item">
                  <img src={user.avatar} alt={user.name} className="suggestion-avatar" />
                  <div className="suggestion-info">
                    <div className="suggestion-name">
                      {user.name}
                      {user.isVerified && <span className="verified-badge">✓</span>}
                    </div>
                    <div className="suggestion-username">@{user.username}</div>
                    <div className="suggestion-followers">{user.followers} followers</div>
                  </div>
                  <button
                    onClick={() => handleFollow(user.id)}
                    className={`follow-btn ${followingState[user.id] ? 'following' : ''}`}
                  >
                    {followingState[user.id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
            <button className="show-more-btn">Show more</button>
          </div>

          {/* Premium Card */}
          <div className="premium-card">
            <FaCrown className="premium-icon" />
            <h3>Upgrade to Premium</h3>
            <p>Get exclusive features and support Drift</p>
            <button className="premium-btn">Get Premium</button>
          </div>
        </div>
      </div>
    </div>
  );
}