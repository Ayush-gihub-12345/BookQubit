"use client";

import { FaTrophy, FaLock } from "react-icons/fa";

export default function AchievementsTab({ userStats, isDarkMode }) {
  const badges = [
    { name: "Bookworm", icon: "📚", unlocked: true, description: "Read 50 books" },
    { name: "Speed Reader", icon: "⚡", unlocked: true, description: "Read 10 books in a month" },
    { name: "Review Master", icon: "⭐", unlocked: true, description: "Write 20 reviews" },
    { name: "Collector", icon: "📖", unlocked: false, description: "Add 100 books to library" },
    { name: "Community Leader", icon: "👥", unlocked: false, description: "Get 500 followers" },
    { name: "Night Owl", icon: "🦉", unlocked: false, description: "Read 50 hours at night" },
  ];

  return (
    <div className={`achievements-tab ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="badges-grid">
        {badges.map((badge, idx) => (
          <div key={idx} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="badge-icon">{badge.icon}</div>
            <div className="badge-info">
              <div className="badge-name">{badge.name}</div>
              <div className="badge-description">{badge.description}</div>
            </div>
            {!badge.unlocked && <FaLock className="badge-lock" />}
          </div>
        ))}
      </div>
    </div>
  );
}