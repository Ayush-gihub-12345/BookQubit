"use client";

import { useState, useEffect } from "react";
import { 
  FaCrown, 
  FaMedal, 
  FaBook, 
  FaStar, 
  FaFire, 
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaTrophy,
  FaUserGraduate,
  FaHeart,
  FaComments,
  FaShare,
  FaArrowUp,
  FaArrowDown,
  FaBookOpen,
  FaClock
} from "react-icons/fa";
import { MdVerified, MdTrendingUp, MdEmojiEvents } from "react-icons/md";
import { useTheme } from "@/themes/useTheme";
import "./bookworm-leaderboard.css";

const BookwormLeaderboard = () => {
  const { theme, themeName } = useTheme();
  const [activeCategory, setActiveCategory] = useState("books");
  const [timeRange, setTimeRange] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  const isForestTheme = themeName === 'forest';

  // Mock user data
  const leaderboardData = [
    { id: 1, name: "Sarah Johnson", username: "@sarahj", avatar: "https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=Sarah+J", booksRead: 142, pagesRead: 48520, reviews: 89, likes: 2340, streak: 156, verified: true, badges: ["Elite Reader", "Review Master"] },
    { id: 2, name: "Michael Chen", username: "@mchen", avatar: "https://ui-avatars.com/api/?background=3B82F6&color=fff&name=Michael+C", booksRead: 128, pagesRead: 42340, reviews: 67, likes: 1890, streak: 98, verified: true, badges: ["Speed Reader", "Page Turner"] },
    { id: 3, name: "Emma Watson", username: "@emmareads", avatar: "https://ui-avatars.com/api/?background=EC4899&color=fff&name=Emma+W", booksRead: 115, pagesRead: 38720, reviews: 134, likes: 4560, streak: 203, verified: true, badges: ["Book Club Leader", "Top Reviewer"] },
    { id: 4, name: "David Kim", username: "@davidk", avatar: "https://ui-avatars.com/api/?background=10B981&color=fff&name=David+K", booksRead: 98, pagesRead: 32450, reviews: 45, likes: 1230, streak: 67, verified: false, badges: ["Rising Star"] },
    { id: 5, name: "Lisa Rodriguez", username: "@lisar", avatar: "https://ui-avatars.com/api/?background=F59E0B&color=fff&name=Lisa+R", booksRead: 87, pagesRead: 29120, reviews: 78, likes: 2340, streak: 89, verified: true, badges: ["Community Hero", "Book Donor"] },
    { id: 6, name: "James Wilson", username: "@jamesw", avatar: "https://ui-avatars.com/api/?background=EF4444&color=fff&name=James+W", booksRead: 76, pagesRead: 25340, reviews: 34, likes: 890, streak: 45, verified: false, badges: [] },
    { id: 7, name: "Priya Patel", username: "@priyap", avatar: "https://ui-avatars.com/api/?background=06B6D4&color=fff&name=Priya+P", booksRead: 68, pagesRead: 22680, reviews: 56, likes: 1670, streak: 112, verified: true, badges: ["Consistent Reader"] },
    { id: 8, name: "Alex Turner", username: "@alext", avatar: "https://ui-avatars.com/api/?background=8B5CF6&color=fff&name=Alex+T", booksRead: 59, pagesRead: 19720, reviews: 23, likes: 670, streak: 34, verified: false, badges: [] },
    { id: 9, name: "Maria Garcia", username: "@mariag", avatar: "https://ui-avatars.com/api/?background=EC4899&color=fff&name=Maria+G", booksRead: 52, pagesRead: 17340, reviews: 67, likes: 2340, streak: 78, verified: true, badges: ["Reviewer of the Month"] },
    { id: 10, name: "Tom Harris", username: "@tomh", avatar: "https://ui-avatars.com/api/?background=3B82F6&color=fff&name=Tom+H", booksRead: 48, pagesRead: 16020, reviews: 34, likes: 890, streak: 56, verified: false, badges: [] },
  ];

  // Current user data
  const currentUser = {
    id: 15,
    name: "You",
    username: "@currentuser",
    avatar: "https://ui-avatars.com/api/?background=6366F1&color=fff&name=Current+User",
    booksRead: 32,
    pagesRead: 10680,
    reviews: 12,
    likes: 456,
    streak: 23,
    verified: false,
    badges: ["Book Enthusiast"],
    rank: 24
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUsers(leaderboardData);
      setCurrentUserRank(currentUser);
      setIsLoading(false);
    }, 800);
  }, []);

  const getStatValue = (user) => {
    switch(activeCategory) {
      case 'books': return user.booksRead;
      case 'pages': return user.pagesRead;
      case 'reviews': return user.reviews;
      case 'likes': return user.likes;
      case 'streak': return user.streak;
      default: return user.booksRead;
    }
  };

  const getStatLabel = () => {
    switch(activeCategory) {
      case 'books': return 'Books Read';
      case 'pages': return 'Pages Read';
      case 'reviews': return 'Reviews';
      case 'likes': return 'Likes Received';
      case 'streak': return 'Day Streak';
      default: return 'Books Read';
    }
  };

  const getStatIcon = () => {
    switch(activeCategory) {
      case 'books': return <FaBook />;
      case 'pages': return <FaBookOpen />;
      case 'reviews': return <FaStar />;
      case 'likes': return <FaHeart />;
      case 'streak': return <FaFire />;
      default: return <FaBook />;
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'rank') {
      return getStatValue(b) - getStatValue(a);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return getStatValue(b) - getStatValue(a);
  });

  const filteredUsers = sortedUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankIcon = (index) => {
    if (index === 0) return <FaCrown className="rank-icon gold" />;
    if (index === 1) return <FaMedal className="rank-icon silver" />;
    if (index === 2) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">#{index + 1}</span>;
  };

  const categories = [
    { id: "books", label: "Most Books", icon: FaBook },
    { id: "pages", label: "Most Pages", icon: FaBookOpen },
    { id: "reviews", label: "Top Reviewers", icon: FaStar },
    { id: "likes", label: "Most Liked", icon: FaHeart },
    { id: "streak", label: "Longest Streak", icon: FaFire },
  ];

  const timeRanges = [
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
    { id: "all", label: "All Time" },
  ];

  if (isLoading) {
    return (
      <div className={`leaderboard-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`leaderboard-container ${isDarkMode ? 'dark' : 'light'} ${isForestTheme ? 'forest' : ''}`}>
      <div className="leaderboard-wrapper">
        {/* Header */}
        <div className="leaderboard-header">
          <div className="header-title">
            <MdEmojiEvents className="title-icon" />
            <h1>Bookworm Leaderboard</h1>
          </div>
          <p>Celebrating the most dedicated readers in our community</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card-overview">
            <FaBook />
            <div>
              <span className="stat-value">1,234</span>
              <span className="stat-label">Total Books Read</span>
            </div>
          </div>
          <div className="stat-card-overview">
            <FaUserGraduate />
            <div>
              <span className="stat-value">456</span>
              <span className="stat-label">Active Readers</span>
            </div>
          </div>
          <div className="stat-card-overview">
            <FaFire />
            <div>
              <span className="stat-value">203</span>
              <span className="stat-label">Longest Streak</span>
            </div>
          </div>
          <div className="stat-card-overview">
            <FaStar />
            <div>
              <span className="stat-value">8,234</span>
              <span className="stat-label">Total Reviews</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="leaderboard-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search readers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="time-filters">
            {timeRanges.map(range => (
              <button
                key={range.id}
                className={`time-btn ${timeRange === range.id ? 'active' : ''}`}
                onClick={() => setTimeRange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rank">Sort by Rank</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-user">Reader</div>
            <div className="col-stats">
              {getStatIcon()} {getStatLabel()}
            </div>
            <div className="col-badges">Badges</div>
            <div className="col-actions">Actions</div>
          </div>

          {filteredUsers.map((user, index) => (
            <div key={user.id} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
              <div className="col-rank">
                {getRankIcon(index)}
              </div>
              <div className="col-user">
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <div className="user-info">
                  <div className="user-name">
                    {user.name}
                    {user.verified && <MdVerified className="verified-icon" />}
                  </div>
                  <div className="user-username">{user.username}</div>
                </div>
              </div>
              <div className="col-stats">
                <div className="stat-value">
                  {getStatValue(user).toLocaleString()}
                  {activeCategory === 'pages' && ' pages'}
                  {activeCategory === 'streak' && ' days'}
                </div>
                {activeCategory === 'books' && (
                  <div className="stat-sub">{Math.round(user.pagesRead / user.booksRead)} avg pages/book</div>
                )}
              </div>
              <div className="col-badges">
                {user.badges.slice(0, 2).map((badge, i) => (
                  <span key={i} className="badge">{badge}</span>
                ))}
                {user.badges.length > 2 && <span className="badge-more">+{user.badges.length - 2}</span>}
              </div>
              <div className="col-actions">
                <button className="action-btn follow">Follow</button>
                <button className="action-btn view">View Profile</button>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Rank */}
        {currentUserRank && (
          <div className="current-user-rank">
            <div className="rank-indicator">
              <span className="rank-label">Your Rank</span>
              <span className="rank-value">#{currentUserRank.rank}</span>
            </div>
            <div className="user-rank-card">
              <img src={currentUserRank.avatar} alt={currentUserRank.name} className="user-avatar" />
              <div className="user-info">
                <div className="user-name">{currentUserRank.name}</div>
                <div className="user-stats">
                  <span><FaBook /> {currentUserRank.booksRead} books</span>
                  <span><FaFire /> {currentUserRank.streak} day streak</span>
                </div>
              </div>
              <button className="improve-btn">
                <MdTrendingUp /> Improve Rank
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="leaderboard-footer">
          <p>📖 Read more books, write reviews, and engage with the community to climb the ranks!</p>
        </div>
      </div>
    </div>
  );
};

export default BookwormLeaderboard;