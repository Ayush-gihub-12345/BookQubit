"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaAlgolia, FaNewspaper, FaUserFriends, FaFire, FaBookmark, FaArrowRight, FaBell } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";

const BookQubitSnapDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Example count
  const dropdownRef = useRef(null);
  const { theme, themeName } = useTheme();
  const { isRTL } = useRTL();
  const router = useRouter();

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate fetching notification count
  useEffect(() => {
    // You can replace this with actual API call
    const fetchNotifications = async () => {
      // Example: fetch unread notifications count
      // const response = await fetch('/api/notifications/unread');
      // const data = await response.json();
      // setNotificationCount(data.count);
    };
    fetchNotifications();
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleNavigation = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const getTextHighlightClass = () => {
    return theme.textColors?.highlight || (isDarkMode ? "text-blue-400" : "text-sky-600");
  };

  const menuItems = [
    { id: "feed", label: "Feed", icon: FaNewspaper, color: "#3b82f6", path: "/bookqubitsnap?tab=feed" },
    { id: "trending", label: "Trending", icon: FaFire, color: "#f59e0b", path: "/bookqubitsnap?tab=trending" },
    { id: "authors", label: "Authors", icon: FaUserFriends, color: "#8b5cf6", path: "/bookqubitsnap?tab=authors" },
    { id: "saved", label: "Saved", icon: FaBookmark, color: "#10b981", path: "/bookqubitsnap?tab=saved" },
  ];

  return (
    <div className="bookqubitsnap-dropdown" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`navbar-desktop-snap-button ${isOpen ? "open" : ""}`}
        aria-label="BookQubitSnap Social Feed"
        title="BookQubitSnap"
      >
        <FaAlgolia className={`snap-icon ${getTextHighlightClass()}`} size={18} />
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={`snap-dropdown-menu ${isDarkMode ? "dark" : "light"} ${isRTL ? "rtl" : "ltr"}`}>
          <div className="snap-dropdown-header">
            <div className="snap-header-icon">
              <FaAlgolia />
            </div>
            <div className="snap-header-text">
              <h3>BookQubitSnap</h3>
              <p>Social feed for readers & authors</p>
            </div>
          </div>

          <div className="snap-dropdown-items">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="snap-dropdown-item"
                onClick={() => handleNavigation(item.path)}
              >
                <div className="snap-item-icon" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon style={{ color: item.color }} size={14} />
                </div>
                <div className="snap-item-content">
                  <span className="snap-item-label">{item.label}</span>
                </div>
                <FaArrowRight className="snap-item-arrow" />
              </button>
            ))}
          </div>

        <div className="snap-dropdown-footer">
  <Link
    href="/bookqubitsnap"
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => setIsOpen(false)}
    className="snap-footer-link"
  >
    Go to BookQubitSnap →
  </Link>
</div>
        </div>
      )}

      <style jsx>{`
        .bookqubitsnap-dropdown {
          position: relative;
          display: inline-block;
        }

        .navbar-desktop-snap-button {
          position: relative;
          padding: 0.5rem;
          border-radius: 9999px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: none;
          border: 1px solid;
          border-color: ${isDarkMode ? "#374151" : "#e5e7eb"};
          flex-shrink: 0;
        }

        .navbar-desktop-snap-button:hover {
          transform: scale(1.05);
          background-color: rgba(2, 132, 199, 0.1);
        }

        .snap-icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        /* Notification Badge */
        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          min-width: 16px;
          height: 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid ${isDarkMode ? "#1f2937" : "#ffffff"};
        }

        /* Dropdown Menu */
        .snap-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          ${isRTL ? "right" : "left"}: 0;
          width: 280px;
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease;
          border: 1px solid ${isDarkMode ? "#374151" : "#e5e7eb"};
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .snap-dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%);
          border-bottom: 1px solid ${isDarkMode ? "#374151" : "#f0f0f0"};
        }

        .snap-header-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .snap-header-text h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 2px;
          color: ${isDarkMode ? "#f9fafb" : "#111827"};
        }

        .snap-header-text p {
          font-size: 11px;
          opacity: 0.7;
          margin: 0;
          color: ${isDarkMode ? "#9ca3af" : "#6b7280"};
        }

        .snap-dropdown-items {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .snap-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          width: 100%;
          text-align: ${isRTL ? "right" : "left"};
        }

        .snap-dropdown-item:hover {
          background: ${isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"};
        }

        .snap-item-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .snap-item-content {
          flex: 1;
        }

        .snap-item-label {
          font-size: 13px;
          font-weight: 500;
          color: ${isDarkMode ? "#f3f4f6" : "#374151"};
        }

        .snap-item-arrow {
          font-size: 11px;
          opacity: 0.5;
          color: ${isDarkMode ? "#9ca3af" : "#6b7280"};
        }

        .snap-dropdown-footer {
          padding: 12px 16px;
          border-top: 1px solid ${isDarkMode ? "#374151" : "#f0f0f0"};
        }

        .snap-footer-link {
          font-size: 12px;
          font-weight: 500;
          color: #667eea;
          text-decoration: none;
          display: block;
          text-align: center;
        }

        .snap-footer-link:hover {
          text-decoration: underline;
        }

        /* RTL Support */
        .rtl .snap-dropdown-item {
          flex-direction: row-reverse;
        }

        .rtl .snap-item-arrow {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default BookQubitSnapDropdown;