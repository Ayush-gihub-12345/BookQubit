"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaBell, FaArrowLeft, FaHeart, FaComment, FaUserPlus, FaBookmark, FaTimes 
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { allNotifications } from "./data/notifications";

export default function NotificationsPage() {
  const router = useRouter();
  const { themeName } = useTheme();
  const { direction, isRTL } = useRTL();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  useEffect(() => {
    // Locks layout background scrolling while inside the panel view
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      setNotifications(allNotifications);
      setIsLoading(false);
    }, 400);

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    return notifications.filter(n => n.type === filter);
  };

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
    router.push(`/notifications/${notification.slug}`);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: '64px', // Pushed down to keep navbar visible during loading status
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode ? '#1a1a1a' : '#f9fafb'
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          borderTopColor: '#0ea5e9',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div 
      dir={direction}
      style={{
        position: 'fixed', 
        top: '64px', // CHANGED: This offsets the component from the top so your BookQubit header shows!
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode ? '#1a1a1a' : 'white',
        overflowY: 'auto', 
        zIndex: 999, // Lowered slightly so your main navbar stays stacked on top of it if needed
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Header Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: isDarkMode ? '#1a1a1a' : 'white',
        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        padding: '12px 16px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isRTL ? 'rotate(180deg)' : 'none'
              }}
            >
              <FaArrowLeft size={18} />
            </button>
            
            <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          {/* Close/Cross Button */}
          <button
            onClick={() => router.back()}
            style={{
              background: isDarkMode ? '#2a2a2a' : '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['all', 'like', 'comment', 'follow', 'bookmark'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: filter === f ? '#0ea5e9' : (isDarkMode ? '#374151' : '#f3f4f6'),
                color: filter === f ? 'white' : (isDarkMode ? '#9ca3af' : '#6b7280'),
                whiteSpace: 'nowrap'
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List Content */}
      <div style={{ padding: '4px 0', background: isDarkMode ? '#1a1a1a' : 'white' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FaBell style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#111827' }}>
              No notifications found
            </h3>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
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
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDarkMode ? '#374151' : '#f3f4f6',
                fontSize: 16,
                flexShrink: 0
              }}>
                {getNotificationIcon(notification.type)}
              </div>
              <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                  {notification.title}
                </div>
                <div style={{ fontSize: 13, color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: 4 }}>
                  {notification.message}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{notification.time}</div>
              </div>
              {!notification.read && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', marginTop: 6 }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}