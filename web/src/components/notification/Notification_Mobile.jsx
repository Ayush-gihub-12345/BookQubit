"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaTimes, FaEnvelope, FaHeart, FaUserPlus, FaBookmark, FaComment } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";

const Notification_Mobile = ({ user, onClose }) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { direction, isRTL } = useRTL();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: "like",
      title: "Someone liked your review",
      message: "Priyal Shrivastava liked your review on 'The Great Gatsby'",
      time: "5 minutes ago",
      read: false,
      link: "/notifications/like/1",
    },
    {
      id: 2,
      type: "comment",
      title: "New comment on your post",
      message: "Sachin commented on your book review",
      time: "1 hour ago",
      read: false,
      link: "/notifications/comment/2",
    },
    {
      id: 3,
      type: "follow",
      title: "New follower",
      message: "Rahul Sharma started following you",
      time: "3 hours ago",
      read: true,
      link: "/profile/rahul",
    },
    {
      id: 4,
      type: "bookmark",
      title: "Book saved to your list",
      message: "Your book 'Atomic Habits' has been saved by 50 users",
      time: "Yesterday",
      read: true,
      link: "/books/atomic-habits",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      setIsLoading(false);
    }, 500);
  }, []);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like': return <FaHeart style={{ color: '#ef4444' }} />;
      case 'comment': return <FaComment style={{ color: '#0ea5e9' }} />;
      case 'follow': return <FaUserPlus style={{ color: '#10b981' }} />;
      case 'bookmark': return <FaBookmark style={{ color: '#8b5cf6' }} />;
      default: return <FaBell style={{ color: '#6b7280' }} />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      router.push(notification.link);
    }
    if (onClose) onClose();
  };

  const viewAllNotifications = () => {
    router.push('/notifications');
    if (onClose) onClose();
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode ? '#1a1a1a' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: `3px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderTopColor: '#0ea5e9',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: 16, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDarkMode ? '#1a1a1a' : 'white',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1100
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        background: 'inherit'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600 }}>
          <FaBell style={{ color: '#0ea5e9' }} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 12,
              marginLeft: 8
            }}>{unreadCount}</span>
          )}
        </div>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }}>✕</button>
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaBell style={{ fontSize: 64, color: '#d1d5db', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No notifications yet</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>When you get notifications, they'll appear here</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 16,
                cursor: 'pointer',
                borderBottom: `1px solid ${isDarkMode ? '#2a2a2a' : '#f3f4f6'}`,
                background: !notification.read ? (isDarkMode ? '#1a3a4a' : '#f0f9ff') : 'transparent'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDarkMode ? '#374151' : '#f3f4f6',
                fontSize: 20
              }}>
                {getNotificationIcon(notification.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                  {notification.title}
                </div>
                <div style={{ fontSize: 13, color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: 4 }}>
                  {notification.message}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{notification.time}</div>
              </div>
              {!notification.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', marginTop: 8 }} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{ padding: 16, borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
          <button onClick={viewAllNotifications} style={{
            width: '100%',
            padding: 12,
            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification_Mobile;