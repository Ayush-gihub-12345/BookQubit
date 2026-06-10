"use client";

import { FaEdit, FaShare, FaEllipsisH, FaCamera, FaMapMarkerAlt, FaCalendarAlt, FaLink, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import { MdVerified, MdEmail } from "react-icons/md";
import { useTheme } from "@/themes/useTheme";
import "./ProfileHeader.css";

export default function ProfileHeader({ user, userStats, onEditProfile, onShareProfile }) {
  const { theme, themeName } = useTheme();
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  const isForestTheme = themeName === 'forest';

  const displayName = user?.displayName || "Sachin Chakrawarti";
  const username = user?.displayName 
    ? `@${user.displayName.toLowerCase().replace(/\s/g, '')}` 
    : "@sachin";
  const avatarUrl = user?.photoURL || "https://ui-avatars.com/api/?background=6366F1&color=fff&name=Sachin+Chakrawarti";
  
  const booksRead = userStats?.booksRead || 127;
  const followers = userStats?.followers || 2400;
  const following = userStats?.following || 421;
  const readingStreak = userStats?.readingStreak || 12;

  return (
    <div className={`profile-header-modern ${isDarkMode ? 'dark' : 'light'} ${isForestTheme ? 'forest' : ''}`}>
      {/* Animated Cover */}
      <div className="modern-cover">
        <div className="cover-overlay"></div>
        <div className="cover-pattern"></div>
        <button className="cover-edit-btn">
          <FaCamera />
        </button>
      </div>

      {/* Floating Content */}
      <div className="modern-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img src={avatarUrl} alt={displayName} />
            <button className="avatar-edit-btn" onClick={onEditProfile}>
              <FaCamera />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="user-info-section">
          <div className="name-badge">
            <h1>{displayName}</h1>
            <MdVerified className="verified-icon" />
            <span className="role-badge">Reader</span>
          </div>
          
          <p className="username">{username}</p>
          
          <p className="bio">
            📚 Passionate reader & tech enthusiast | Building BookQubit 🚀
          </p>

          {/* Location & Join Date */}
          <div className="user-metadata">
            <span><FaMapMarkerAlt /> New York, NY</span>
            <span><FaCalendarAlt /> Joined Jan 2024</span>
            <span><FaLink /> bookqubit.com/sachin</span>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid-modern">
            <div className="stat-card-mini">
              <div className="stat-icon">📚</div>
              <div>
                <div className="stat-number">{booksRead}</div>
                <div className="stat-label">Books Read</div>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-icon">🔥</div>
              <div>
                <div className="stat-number">{readingStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-number">{followers.toLocaleString()}</div>
                <div className="stat-label">Followers</div>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="stat-icon">✨</div>
              <div>
                <div className="stat-number">{following.toLocaleString()}</div>
                <div className="stat-label">Following</div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="social-links-modern">
            <a href="#" className="social-link twitter"><FaTwitter /></a>
            <a href="#" className="social-link instagram"><FaInstagram /></a>
            <a href="#" className="social-link github"><FaGithub /></a>
            <a href="#" className="social-link email"><MdEmail /></a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-modern">
          <button className="btn-primary" onClick={onEditProfile}>
            <FaEdit /> Edit Profile
          </button>
          <button className="btn-secondary" onClick={onShareProfile}>
            <FaShare /> Share
          </button>
          <button className="btn-icon">
            <FaEllipsisH />
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="floating-dots"></div>
    </div>
  );
}