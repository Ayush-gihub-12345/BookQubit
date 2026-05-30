"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  FaArrowLeft, FaHeart, FaComment, FaUserPlus, 
  FaBookmark, FaBell, FaExternalLinkAlt 
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { getNotificationBySlug } from "../data/notifications"; // Correct relative import for this nested level

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { themeName } = useTheme();
  const { direction, isRTL } = useRTL();

  const notification = getNotificationBySlug(params.slug);
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like': return <FaHeart style={{ color: '#ef4444' }} />;
      case 'comment': return <FaComment style={{ color: '#0ea5e9' }} />;
      case 'follow': return <FaUserPlus style={{ color: '#10b981' }} />;
      case 'bookmark': return <FaBookmark style={{ color: '#8b5cf6' }} />;
      default: return <FaBell style={{ color: '#6b7280' }} />;
    }
  };

  if (!notification) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: 'center', 
        minHeight: '100vh',
        background: isDarkMode ? '#1a1a1a' : '#f9fafb',
        color: isDarkMode ? '#f3f4f6' : '#111827' 
      }}>
        <h3>Notification not found</h3>
        <button 
          onClick={() => router.back()} 
          style={{ marginTop: 20, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div 
      dir={direction} 
      style={{ 
        minHeight: '100vh', 
        background: isDarkMode ? '#1a1a1a' : '#f9fafb', 
        color: isDarkMode ? '#f3f4f6' : '#111827' 
      }}
    >
      {/* Header Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16, 
        padding: '12px 16px', 
        background: isDarkMode ? '#1a1a1a' : 'white', 
        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` 
      }}>
        <button 
          onClick={() => router.back()} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: isDarkMode ? '#9ca3af' : '#6b7280', 
            padding: '8px', 
            borderRadius: '50%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isRTL ? 'rotate(180deg)' : 'none' 
          }}
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Details</h1>
      </div>

      {/* Focused Content Card */}
      <div style={{ 
        margin: '24px 16px', 
        padding: 20, 
        background: isDarkMode ? '#222' : 'white', 
        borderRadius: 12, 
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
        textAlign: isRTL ? 'right' : 'left' 
      }}>
        <div style={{ 
          width: 56, 
          height: 56, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: isDarkMode ? '#374151' : '#f3f4f6', 
          fontSize: 24, 
          marginBottom: 16 
        }}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0' }}>{notification.title}</h2>
        <p style={{ fontSize: 15, color: isDarkMode ? '#d1d5db' : '#374151', lineHeight: '1.5', margin: '0 0 12px 0' }}>{notification.message}</p>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{notification.time}</span>

        {notification.link && (
          <button 
            onClick={() => router.push(notification.link)}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>View Details</span>
            <FaExternalLinkAlt size={14} />
          </button>
        )}
      </div>
    </div>
  );
}