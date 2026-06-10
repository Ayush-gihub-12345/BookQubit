"use client";

import { FaBookOpen, FaFire, FaClock, FaMedal, FaStar, FaHeart, FaShare, FaBookmark } from "react-icons/fa";
import { MdTrendingUp, MdEmojiEvents } from "react-icons/md";
import "./OverviewTab.css";

export default function OverviewTab({ userStats, isDarkMode }) {
  const statsCards = [
    { label: "Books Read", value: userStats?.booksRead || 127, icon: <FaBookOpen />, color: "#3b82f6", change: "+12%" },
    { label: "Reading Streak", value: `${userStats?.readingStreak || 12} days`, icon: <FaFire />, color: "#f59e0b", change: "+3 days" },
    { label: "Hours Spent", value: userStats?.hoursSpent || 342, icon: <FaClock />, color: "#10b981", change: "+28 hrs" },
    { label: "Achievements", value: userStats?.achievements || 8, icon: <FaMedal />, color: "#fbbf24", change: "+2" },
  ];

  const recentActivity = [
    { action: "Finished reading", book: "The Midnight Library", date: "2 days ago", icon: <FaBookOpen />, rating: 5 },
    { action: "Wrote a review", book: "Atomic Habits", date: "5 days ago", icon: <FaStar />, rating: 5 },
    { action: "Added to wishlist", book: "Project Hail Mary", date: "1 week ago", icon: <FaHeart /> },
    { action: "Started reading", book: "A Court of Thorns and Roses", date: "3 days ago", icon: <FaBookOpen />, progress: 45 },
  ];

  const readingGoal = {
    target: 52,
    current: userStats?.booksRead || 47,
    percentage: Math.round((userStats?.booksRead || 47) / 52 * 100)
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-mini">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
        ))}
      </div>
    );
  };

  return (
    <div className={`overview-tab ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h2>Welcome back! 👋</h2>
          <p>Keep up the great reading momentum</p>
        </div>
        <div className="mini-stat">
          <MdTrendingUp /> <span>+15% this month</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <div className="stat-change positive">{stat.change} ↑</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reading Goal */}
      <div className="goal-card">
        <div className="goal-header">
          <h3>📖 2024 Reading Goal</h3>
          <span>{readingGoal.current}/{readingGoal.target} books</span>
        </div>
        <div className="goal-progress-bar">
          <div className="goal-progress-fill" style={{ width: `${readingGoal.percentage}%` }}></div>
        </div>
        <div className="goal-percentage">{readingGoal.percentage}% Complete</div>
        <div className="goal-stats">
          <div><span>{readingGoal.target - readingGoal.current}</span> books to go</div>
          <div><span>≈ {Math.ceil((readingGoal.target - readingGoal.current) / 2)}</span> books/month</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-card">
        <div className="section-header">
          <h3>📋 Recent Activity</h3>
          <button className="see-all">See All →</button>
        </div>
        <div className="activity-list">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-details">
                <div>{activity.action} <strong>"{activity.book}"</strong></div>
                {activity.rating && renderStars(activity.rating)}
                {activity.progress && <div className="activity-progress">{activity.progress}% complete</div>}
                <div className="activity-date">{activity.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn"><FaBookOpen /> Log Reading</button>
          <button className="action-btn"><FaStar /> Write Review</button>
          <button className="action-btn"><FaShare /> Share Progress</button>
          <button className="action-btn"><FaBookmark /> Add to Shelf</button>
        </div>
      </div>
    </div>
  );
}