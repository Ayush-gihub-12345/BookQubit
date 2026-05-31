// src/components_drift/layout/rightslider.jsx

"use client";

import { useState } from "react";
import { 
  HiSearch, 
  HiTrendingUp, 
  HiFire, 
  HiUserAdd,
  HiDotsHorizontal,
  HiX,
  HiExternalLink
} from "react-icons/hi";
import { 
  FaCrown, 
  FaRegHeart, 
  FaRegComment, 
  FaRetweet,
  FaBookmark,
  FaShare
} from "react-icons/fa";
import "./rightslider.css";

export default function DriftRightSlider() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trends");

  // Trending topics data
  const trendingTopics = [
    { 
      id: 1, 
      rank: 1, 
      category: "Technology", 
      title: "#AIRevolution", 
      posts: "125K", 
      isVerified: true,
      trending: "+234%" 
    },
    { 
      id: 2, 
      rank: 2, 
      category: "Books", 
      title: "BookQubit Launch", 
      posts: "89K", 
      isVerified: true,
      trending: "+189%" 
    },
    { 
      id: 3, 
      rank: 3, 
      category: "Sports", 
      title: "#WorldCup2026", 
      posts: "234K", 
      isVerified: false,
      trending: "+456%" 
    },
    { 
      id: 4, 
      rank: 4, 
      category: "Entertainment", 
      title: "New Movie Release", 
      posts: "67K", 
      isVerified: true,
      trending: "+123%" 
    },
    { 
      id: 5, 
      rank: 5, 
      category: "Politics", 
      title: "#Election2024", 
      posts: "456K", 
      isVerified: false,
      trending: "+789%" 
    },
  ];

  // Suggested users data
  const suggestedUsers = [
    {
      id: 1,
      name: "Elon Musk",
      username: "elonmusk",
      avatar: "https://ui-avatars.com/api/?background=0284c7&color=fff&name=Elon+Musk",
      bio: "CEO of Tesla, SpaceX",
      followers: "45M",
      isVerified: true,
    },
    {
      id: 2,
      name: "NASA",
      username: "nasa",
      avatar: "https://ui-avatars.com/api/?background=059669&color=fff&name=NASA",
      bio: "Space exploration agency",
      followers: "32M",
      isVerified: true,
    },
    {
      id: 3,
      name: "BookQubit",
      username: "bookqubit",
      avatar: "https://ui-avatars.com/api/?background=7c3aed&color=fff&name=BookQubit",
      bio: "Digital reading platform",
      followers: "1.2M",
      isVerified: true,
    },
    {
      id: 4,
      name: "Mark Zuckerberg",
      username: "zuck",
      avatar: "https://ui-avatars.com/api/?background=dc2626&color=fff&name=Mark+Zuckerberg",
      bio: "Meta CEO",
      followers: "28M",
      isVerified: true,
    },
  ];

  // Premium features
  const premiumFeatures = [
    "No ads",
    "Early access to features",
    "Premium badge",
    "HD media uploads",
  ];

  return (
    <aside className="drift-rightslider">
      <div className="drift-rightslider-content">
        {/* Search Bar */}
        <div className="drift-search-container">
          <div className="drift-search-box">
            <HiSearch className="drift-search-icon" />
            <input
              type="text"
              placeholder="Search Drift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="drift-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="drift-search-clear">
                <HiX />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="drift-tabs">
          <button
            onClick={() => setActiveTab("trends")}
            className={`drift-tab ${activeTab === "trends" ? "active" : ""}`}
          >
            <HiTrendingUp />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`drift-tab ${activeTab === "suggestions" ? "active" : ""}`}
          >
            <HiUserAdd />
            <span>Suggestions</span>
          </button>
        </div>

        {/* Trending Tab Content */}
        {activeTab === "trends" && (
          <div className="drift-trending">
            <div className="drift-section-header">
              <HiFire className="drift-section-icon" />
              <h3>What's Happening</h3>
            </div>
            
            <div className="drift-trending-list">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="drift-trending-item">
                  <div className="drift-trending-header">
                    <span className="drift-trending-rank">{topic.rank}</span>
                    <span className="drift-trending-category">{topic.category}</span>
                    {topic.isVerified && (
                      <span className="drift-verified-badge">✓</span>
                    )}
                  </div>
                  <div className="drift-trending-title">{topic.title}</div>
                  <div className="drift-trending-stats">
                    <span>{topic.posts} posts</span>
                    <span className="drift-trending-up">↑ {topic.trending}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="drift-show-more">Show more</button>
          </div>
        )}

        {/* Suggestions Tab Content */}
        {activeTab === "suggestions" && (
          <div className="drift-suggestions">
            <div className="drift-section-header">
              <HiUserAdd className="drift-section-icon" />
              <h3>Who to Follow</h3>
            </div>
            
            <div className="drift-suggestions-list">
              {suggestedUsers.map((user) => {
                const [following, setFollowing] = useState(false);
                return (
                  <div key={user.id} className="drift-suggestion-item">
                    <div className="drift-suggestion-avatar">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                    <div className="drift-suggestion-info">
                      <div className="drift-suggestion-name">
                        {user.name}
                        {user.isVerified && (
                          <span className="drift-verified-badge">✓</span>
                        )}
                      </div>
                      <div className="drift-suggestion-username">
                        @{user.username}
                      </div>
                      <div className="drift-suggestion-bio">{user.bio}</div>
                      <div className="drift-suggestion-followers">
                        {user.followers} followers
                      </div>
                    </div>
                    <button
                      onClick={() => setFollowing(!following)}
                      className={`drift-follow-btn ${following ? "following" : ""}`}
                    >
                      {following ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <button className="drift-show-more">Show more</button>
          </div>
        )}

        {/* Premium Card */}
        <div className="drift-premium-card">
          <div className="drift-premium-header">
            <FaCrown className="drift-premium-icon" />
            <h3>Upgrade to Premium</h3>
          </div>
          <p className="drift-premium-description">
            Get exclusive features and support Drift
          </p>
          <div className="drift-premium-features">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="drift-premium-feature">
                <span>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <button className="drift-premium-btn">Get Premium</button>
        </div>

        {/* Footer */}
        <div className="drift-footer">
          <div className="drift-footer-links">
            <a href="#">Terms</a>
            <span>·</span>
            <a href="#">Privacy</a>
            <span>·</span>
            <a href="#">Cookies</a>
            <span>·</span>
            <a href="#">About</a>
          </div>
          <p className="drift-copyright">© 2024 Drift by BookQubit</p>
        </div>
      </div>
    </aside>
  );
}