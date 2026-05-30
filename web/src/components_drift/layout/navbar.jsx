// src/components_drift/layout/navbar.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HiSearch, 
  HiBell, 
  HiMail, 
  HiUser, 
  HiCog,
  HiX,
  HiChevronDown,
  HiLogout,
  HiUserCircle,
  HiBookmarkAlt,
  HiSparkles
} from "react-icons/hi";
import { FaCrown } from "react-icons/fa";
import "./navbar.css";

export default function DriftNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Someone liked your drift", time: "5m ago", read: false },
    { id: 2, text: "New follower: @booklover", time: "1h ago", read: false },
    { id: 3, text: "Your drift is trending!", time: "3h ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header className="drift-navbar">
        <div className="drift-navbar-container">
          {/* Left Section - Welcome Message */}
          <div className="drift-navbar-left">
            <div className="drift-welcome">
              <h2>Welcome back,</h2>
              <h1>BookQubit User!</h1>
            </div>
            <div className="drift-stats">
              <div className="drift-stat">
                <span className="drift-stat-value">1,234</span>
                <span className="drift-stat-label">Followers</span>
              </div>
              <div className="drift-stat">
                <span className="drift-stat-value">567</span>
                <span className="drift-stat-label">Following</span>
              </div>
              <div className="drift-stat">
                <span className="drift-stat-value">8,901</span>
                <span className="drift-stat-label">Drifts</span>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="drift-navbar-center">
            <div className="drift-search-container">
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

          {/* Right Section - Actions */}
          <div className="drift-navbar-right">
            {/* Premium Button */}
            <button className="drift-premium-btn-nav">
              <FaCrown />
              <span>Premium</span>
            </button>

            {/* Notifications */}
            <div className="drift-notification-wrapper">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="drift-icon-btn"
              >
                <HiBell />
                {unreadCount > 0 && (
                  <span className="drift-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="drift-notification-dropdown">
                  <div className="drift-notification-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="drift-mark-read">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="drift-notification-list">
                    {notifications.length === 0 ? (
                      <div className="drift-no-notifications">
                        <HiBell />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`drift-notification-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="drift-notification-content">
                            <p>{notif.text}</p>
                            <span className="drift-notification-time">{notif.time}</span>
                          </div>
                          {!notif.read && <div className="drift-notification-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <Link href="/drift/messages" className="drift-icon-btn">
              <HiMail />
            </Link>

            {/* User Menu */}
            <div className="drift-user-menu-wrapper">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="drift-user-menu-btn"
              >
                <img 
                  src="https://ui-avatars.com/api/?background=0284c7&color=fff&name=User" 
                  alt="Avatar"
                  className="drift-avatar"
                />
                <HiChevronDown className={`drift-chevron ${isUserMenuOpen ? 'open' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="drift-user-dropdown">
                  <div className="drift-user-info">
                    <img 
                      src="https://ui-avatars.com/api/?background=0284c7&color=fff&name=User" 
                      alt="Avatar"
                      className="drift-dropdown-avatar"
                    />
                    <div>
                      <h4>BookQubit User</h4>
                      <p>@bookqubit</p>
                    </div>
                  </div>
                  <div className="drift-dropdown-divider"></div>
                  <Link href="/drift/profile/bookqubit" className="drift-dropdown-item">
                    <HiUserCircle />
                    <span>Profile</span>
                  </Link>
                  <Link href="/drift/bookmarks" className="drift-dropdown-item">
                    <HiBookmarkAlt />
                    <span>Bookmarks</span>
                  </Link>
                  <Link href="/drift/premium" className="drift-dropdown-item premium">
                    <FaCrown />
                    <span>Premium</span>
                  </Link>
                  <Link href="/drift/settings" className="drift-dropdown-item">
                    <HiCog />
                    <span>Settings</span>
                  </Link>
                  <div className="drift-dropdown-divider"></div>
                  <button className="drift-dropdown-item logout">
                    <HiLogout />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navbar */}
      <header className="drift-mobile-navbar">
        <div className="drift-mobile-navbar-container">
          <div className="drift-mobile-logo">
            <h1>Drift</h1>
            <span>by BookQubit</span>
          </div>
          
          <div className="drift-mobile-actions">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="drift-mobile-icon-btn"
            >
              <HiSearch />
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="drift-mobile-icon-btn"
            >
              <HiBell />
              {unreadCount > 0 && (
                <span className="drift-mobile-badge">{unreadCount}</span>
              )}
            </button>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="drift-mobile-icon-btn"
            >
              <img 
                src="https://ui-avatars.com/api/?background=0284c7&color=fff&name=User" 
                alt="Avatar"
                className="drift-mobile-avatar"
              />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="drift-mobile-search">
            <div className="drift-mobile-search-box">
              <HiSearch className="drift-mobile-search-icon" />
              <input
                type="text"
                placeholder="Search Drift..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="drift-mobile-search-input"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="drift-mobile-search-clear">
                  <HiX />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Notifications */}
        {showNotifications && (
          <>
            <div className="drift-mobile-overlay" onClick={() => setShowNotifications(false)} />
            <div className="drift-mobile-notifications">
              <div className="drift-mobile-notification-header">
                <h3>Notifications</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <HiX />
                </button>
              </div>
              <div className="drift-mobile-notification-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`drift-mobile-notification-item ${!notif.read ? 'unread' : ''}`}>
                    <div>
                      <p>{notif.text}</p>
                      <span>{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mobile User Menu */}
        {isUserMenuOpen && (
          <>
            <div className="drift-mobile-overlay" onClick={() => setIsUserMenuOpen(false)} />
            <div className="drift-mobile-user-menu">
              <div className="drift-mobile-user-info">
                <img 
                  src="https://ui-avatars.com/api/?background=0284c7&color=fff&name=User" 
                  alt="Avatar"
                />
                <div>
                  <h4>BookQubit User</h4>
                  <p>@bookqubit</p>
                </div>
              </div>
              <Link href="/drift/profile/bookqubit" className="drift-mobile-user-item">
                Profile
              </Link>
              <Link href="/drift/bookmarks" className="drift-mobile-user-item">
                Bookmarks
              </Link>
              <Link href="/drift/settings" className="drift-mobile-user-item">
                Settings
              </Link>
              <button className="drift-mobile-user-item logout">
                Logout
              </button>
            </div>
          </>
        )}
      </header>
    </>
  );
}