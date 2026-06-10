"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaBell,
  FaEnvelope,
  FaHeart,
  FaBookmark,
  FaUserPlus,
  FaComment,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaGift,
  FaFire,
  FaNewspaper,
  FaTrash,
  FaCheckDouble,
} from "react-icons/fa";

// Sample notification data
const generateNotifications = () => [
  {
    id: "1",
    type: "like",
    title: "Sarah Johnson liked your review",
    message: "Sarah Johnson liked your review of 'The Midnight Library'",
    time: "5 minutes ago",
    read: false,
    icon: <FaHeart className="text-pink-500" />,
    link: "/profile/notifications",
    actionLink: "/books/the-midnight-library",
  },
  {
    id: "2",
    type: "comment",
    title: "New comment on your post",
    message: "Michael Chen commented: 'Great review! I totally agree with you.'",
    time: "1 hour ago",
    read: false,
    icon: <FaComment className="text-blue-500" />,
    link: "/profile/notifications",
    actionLink: "/blog/post-123",
  },
  {
    id: "3",
    type: "bookmark",
    title: "Book saved to your library",
    message: "Atomic Habits has been added to your library",
    time: "3 hours ago",
    read: true,
    icon: <FaBookmark className="text-emerald-500" />,
    link: "/library",
    actionLink: "/books/atomic-habits",
  },
  {
    id: "4",
    type: "follow",
    title: "New follower",
    message: "Emily Rodriguez started following you",
    time: "1 day ago",
    read: true,
    icon: <FaUserPlus className="text-purple-500" />,
    link: "/profile/followers",
    actionLink: "/profile/emily-rodriguez",
  },
  {
    id: "5",
    type: "achievement",
    title: "Achievement unlocked!",
    message: "You've earned the 'Bookworm' badge for reading 50 books",
    time: "2 days ago",
    read: false,
    icon: <FaStar className="text-amber-500" />,
    link: "/achievements",
    actionLink: "/achievements/bookworm",
  },
  {
    id: "6",
    type: "promotion",
    title: "Special offer just for you",
    message: "Get 30% off on your next purchase! Use code: BOOK30",
    time: "3 days ago",
    read: false,
    icon: <FaGift className="text-red-500" />,
    link: "/offers",
    actionLink: "/books",
  },
  {
    id: "7",
    type: "trending",
    title: "Trending in your favorite genre",
    message: "New sci-fi books are trending this week",
    time: "5 days ago",
    read: true,
    icon: <FaFire className="text-orange-500" />,
    link: "/trending",
    actionLink: "/books?genre=sci-fi",
  },
  {
    id: "8",
    type: "news",
    title: "New feature available",
    message: "AI Book Recommendations is now live! Try it now.",
    time: "1 week ago",
    read: true,
    icon: <FaNewspaper className="text-sky-500" />,
    link: "/features",
    actionLink: "/bookqubitai",
  },
];

const NotificationDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { language } = useLanguage();

  if (!user) return null;

  // Check if current language is RTL
  const isRTL = ['ur', 'ar', 'he', 'fa', 'ps', 'sd'].includes(language);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Calculate dropdown position to prevent going off-screen
  const calculatePosition = () => {
    if (!buttonRef.current || typeof window === "undefined") return {};
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 384; // w-96 = 384px
    const margin = 10;
    
    let position = {};
    
    if (isRTL) {
      // For RTL languages - align to the LEFT edge of button
      const dropdownLeft = buttonRect.left;
      
      // Check if dropdown would go off the LEFT edge
      if (dropdownLeft - dropdownWidth < 0) {
        // If goes off left edge, align to left edge of viewport
        position.left = `${margin}px`;
        position.right = 'auto';
      } 
      // Check if it would go off the RIGHT edge
      else if (buttonRect.left + dropdownWidth > viewportWidth) {
        position.right = `${margin}px`;
        position.left = 'auto';
      }
      else {
        // Normal RTL positioning - align to left of button
        position.left = '0';
        position.right = 'auto';
      }
    } else {
      // For LTR languages - align to the RIGHT edge of button
      const dropdownRight = buttonRect.right;
      
      // Check if dropdown would go off the RIGHT edge
      if (dropdownRight + dropdownWidth > viewportWidth) {
        // If goes off right edge, align to right edge of viewport
        position.right = `${margin}px`;
        position.left = 'auto';
      }
      // Check if it would go off the LEFT edge
      else if (buttonRect.left - dropdownWidth < 0) {
        position.left = `${margin}px`;
        position.right = 'auto';
      }
      else {
        // Normal LTR positioning - align to right of button
        position.right = '0';
        position.left = 'auto';
      }
    }
    
    return position;
  };

  // Update position when dropdown opens or window resizes
  useEffect(() => {
    if (isOpen) {
      const updatePosition = () => {
        setDropdownPosition(calculatePosition());
      };
      
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen, isRTL, language]);

  // Load notifications
  useEffect(() => {
    // In a real app, fetch from API
    const loadNotifications = () => {
      const notifs = generateNotifications();
      setNotifications(notifs);
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
    };
    loadNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.actionLink) {
      router.push(notification.actionLink);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      like: <FaHeart className="text-pink-500" />,
      comment: <FaComment className="text-blue-500" />,
      bookmark: <FaBookmark className="text-emerald-500" />,
      follow: <FaUserPlus className="text-purple-500" />,
      achievement: <FaStar className="text-amber-500" />,
      promotion: <FaGift className="text-red-500" />,
      trending: <FaFire className="text-orange-500" />,
      news: <FaNewspaper className="text-sky-500" />,
    };
    return icons[type] || <FaBell />;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "unread") return !notif.read;
    return true;
  });

  const getTimeAgo = (timeString) => {
    return timeString;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-full transition-all duration-200 hover:scale-110
          ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
        `}
        aria-label="Notifications"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <FaBell className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute mt-2 w-96 rounded-xl shadow-2xl z-50 overflow-hidden
            ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')}
            border ${theme.border?.default || (isDarkMode ? 'border-gray-700' : 'border-gray-200')}
          `}
          style={{ 
            top: "100%",
            ...dropdownPosition
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
              {isRTL ? "اطلاعات" : "Notifications"}
              {notifications.length > 0 && (
                <span className={`mr-2 text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>
                  ({notifications.length})
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs ${theme.textColors?.highlight || 'text-sky-600'} hover:underline flex items-center gap-1`}
                >
                  <FaCheckDouble size={12} /> 
                  {isRTL ? "سبھی پڑھیں" : "Mark all read"}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                activeTab === "all"
                  ? `${theme.textColors?.highlight || 'text-sky-600'} border-b-2 border-sky-600`
                  : `${theme.textColors?.secondary || 'text-gray-500'} hover:${theme.textColors?.primary || 'text-gray-900'}`
              }`}
            >
              {isRTL ? "سب" : "All"}
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                activeTab === "unread"
                  ? `${theme.textColors?.highlight || 'text-sky-600'} border-b-2 border-sky-600`
                  : `${theme.textColors?.secondary || 'text-gray-500'} hover:${theme.textColors?.primary || 'text-gray-900'}`
              }`}
            >
              {isRTL ? "ناپڑھے" : "Unread"}
              {unreadCount > 0 && (
                <span className="mr-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <FaBell className={`text-4xl mx-auto mb-3 ${theme.textColors?.secondary || 'text-gray-400'}`} />
                <p className={`${theme.textColors?.secondary || 'text-gray-500'}`}>
                  {activeTab === "unread" 
                    ? (isRTL ? "کوئی نہیں پڑھی اطلاع نہیں" : "No unread notifications")
                    : (isRTL ? "کوئی اطلاع نہیں" : "No notifications yet")
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    relative group border-b last:border-b-0 transition-all hover:bg-opacity-50
                    ${notification.read ? 'opacity-80' : ''}
                    ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                    ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}
                  `}
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center justify-between gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <p className={`text-sm font-medium ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'} line-clamp-2`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-400'}`}>
                        {getTimeAgo(notification.time)}
                      </p>
                    </div>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className={`
                      absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-1.5 rounded-full
                      opacity-0 group-hover:opacity-100 transition-opacity
                      ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}
                    `}
                  >
                    <FaTrash className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-4 py-3 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Link
                href="/profile/notifications"
                onClick={() => setIsOpen(false)}
                className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}
              >
                {isRTL ? "تمام اطلاعات دیکھیں" : "View all notifications"}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
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
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;