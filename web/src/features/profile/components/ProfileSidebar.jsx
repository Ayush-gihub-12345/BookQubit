"use client";

import { 
  FaUser, 
  FaChartLine, 
  FaTrophy, 
  FaCog,
  FaBookOpen,
  FaHeart,
  FaBookmark,
  FaClock,
  FaFire,
  FaUsers,
  FaSignOutAlt
} from "react-icons/fa";
import { MdDashboard, MdLibraryBooks } from "react-icons/md";
import { useTheme } from "@/themes/useTheme";
import "./ProfileSidebar.css";

export default function ProfileSidebar({ activeTab, setActiveTab, user, handleSignOut }) {
  const { theme, themeName } = useTheme();

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  const isForestTheme = themeName === 'forest';

  // All menu items in a simple list
  const menuItems = [
    { id: "overview", label: "Overview", icon: <FaUser /> },,
    { id: "Edit Profile", label: "Edit-Profile", icon: <FaUsers />, badge: "156" },
    { id: "settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <aside className={`profile-sidebar-simple ${isDarkMode ? 'dark' : 'light'} ${isForestTheme ? 'forest' : ''}`}>
      {/* User Card */}
      <div className="sidebar-user-card">
        <div className="user-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} />
          ) : (
            <div className="avatar-placeholder">
              {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div className="online-dot"></div>
        </div>
        <div className="user-info">
          <h4>{user?.displayName || "Reader"}</h4>
          <p>{user?.email || "user@example.com"}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Sign Out Button */}
      <button className="signout-btn" onClick={handleSignOut}>
        <FaSignOutAlt /> Sign Out
      </button>
    </aside>
  );
}