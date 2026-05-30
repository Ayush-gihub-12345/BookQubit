"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaSignOutAlt,
  FaTachometerAlt,
  FaBookReader,
  FaUserCircle,
} from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { useFont } from "@/contexts/FontContext";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./Slider_Auth_Mobile.css";

const Slider_Auth_Mobile = ({ 
  onItemClick, 
  onLogout,
  themeCSSVariables,  // Receive CSS variables from parent
  isDarkMode: parentIsDarkMode  // Receive dark mode flag from parent
}) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { direction } = useRTL();
  const { currentFont } = useFont();
  
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    ranking: 0,
    booksRead: 0,
    reviews: 0
  });

  // Use parent's dark mode detection or calculate locally
  const isDarkMode = parentIsDarkMode !== undefined 
    ? parentIsDarkMode 
    : (themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk");

  // Use parent's CSS variables or create local ones
  const cssVars = themeCSSVariables || {
    '--sidebar-text-primary': theme.textColors?.primary || (isDarkMode ? '#ffffff' : '#1a1a2e'),
    '--sidebar-text-secondary': theme.textColors?.secondary || (isDarkMode ? '#a0aec0' : '#666666'),
    '--sidebar-border': theme.border?.default || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
    '--sidebar-hover-bg': theme.background?.hover || (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
    '--sidebar-btn-primary-bg': theme.buttonColors?.primaryButton?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--sidebar-btn-primary-hover': theme.buttonColors?.primaryButton?.hoverBackground || 'linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)',
    '--sidebar-btn-primary-text': theme.buttonColors?.primaryButton?.textColor || '#ffffff',
    '--sidebar-btn-secondary-bg': theme.buttonColors?.secondaryButton?.background || (isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'),
    '--sidebar-btn-secondary-hover': theme.buttonColors?.secondaryButton?.hoverBackground || (isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb'),
    '--sidebar-btn-secondary-text': theme.buttonColors?.secondaryButton?.textColor || (isDarkMode ? '#ffffff' : '#374151'),
    '--sidebar-icon-active': theme.iconColors?.starFilled || '#0ea5e9',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      setLoading(false);
      
      if (currentUser) {
        fetchUserStats(currentUser.uid);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      // Replace with your actual API call
      setUserStats({
        ranking: 0,
        booksRead: 0,
        reviews: 0
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const getInitials = (name) => {
    if (!name && !user) return "U";
    const displayName = name || user?.displayName || user?.email?.split("@")[0] || "User";
    const nameParts = displayName.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  const formatRankingNumber = (num) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUser(null);
      if (onLogout) await onLogout();
      onItemClick?.();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNavigation = (path) => {
    onItemClick?.();
    router.push(path);
  };

  const handleLogin = () => {
    onItemClick?.();
    router.push("/auth/login");
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className="mobile-auth-loading"
        dir={direction}
        style={{
          fontFamily: currentFont?.family,
          backgroundColor: `var(--sidebar-bg, ${isDarkMode ? '#1a1a2e' : '#ffffff'})`,
          color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
        }}
      >
        <div 
          className="loading-spinner"
          style={{
            borderTopColor: `var(--sidebar-icon-active, #0ea5e9)`,
          }}
        ></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Logged In View - Show when user is authenticated
  if (isLoggedIn && user) {
    return (
      <div
        className="mobile-auth-section"
        dir={direction}
        style={{
          fontFamily: currentFont?.family,
          backgroundColor: `var(--sidebar-bg, ${isDarkMode ? '#1a1a2e' : '#ffffff'})`,
          color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
          borderColor: `var(--sidebar-border, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'})`,
        }}
      >
        {/* User Profile Section */}
        <div className="mobile-auth-profile">
          <div className="mobile-auth-avatar-wrapper">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="mobile-auth-avatar"
              />
            ) : (
              <div
                className="mobile-auth-avatar-placeholder"
                style={{
                  background: `var(--sidebar-btn-primary-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))`,
                }}
              >
                <span className="avatar-initials">
                  {getInitials()}
                </span>
              </div>
            )}
          </div>
          <div className="mobile-auth-info">
            <div
              className="mobile-auth-name"
              style={{
                color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
              }}
            >
              {user.displayName || user.email?.split("@")[0] || "User"}
            </div>
            <div
              className="mobile-auth-email"
              style={{
                color: `var(--sidebar-text-secondary, ${isDarkMode ? '#a0aec0' : '#666666'})`,
              }}
            >
              {user.email}
            </div>
          </div>
        </div>

        {/* Three Action Buttons */}
        <div className="mobile-auth-buttons">
          {/* Profile Button */}
          <button
            onClick={() => handleNavigation("/auth/profile")}
            className="mobile-auth-btn profile-btn"
            style={{
              backgroundColor: `var(--sidebar-btn-secondary-bg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'})`,
              color: `var(--sidebar-btn-secondary-text, ${isDarkMode ? '#ffffff' : '#374151'})`,
              border: `1px solid var(--sidebar-border, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'})`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `var(--sidebar-btn-secondary-hover, ${isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb'})`;
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `var(--sidebar-btn-secondary-bg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'})`;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaUserCircle className="nav-icon" />
            <span className="nav-text">Profile</span>
          </button>

          {/* Dashboard Button */}
          <button
            onClick={() => handleNavigation("/auth/userdashboard")}
            className="mobile-auth-btn dashboard-btn"
            style={{
              background: `var(--sidebar-btn-primary-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))`,
              color: `var(--sidebar-btn-primary-text, #ffffff)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `var(--sidebar-btn-primary-hover, linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%))`;
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `var(--sidebar-btn-primary-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))`;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaTachometerAlt className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </button>

          {/* Bookworm Ranking Button */}
          <button
            onClick={() => handleNavigation("/auth/bookwormranking")}
            className="mobile-auth-btn ranking-btn"
            style={{
              backgroundColor: `var(--sidebar-btn-secondary-bg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'})`,
              color: `var(--sidebar-btn-secondary-text, ${isDarkMode ? '#ffffff' : '#374151'})`,
              border: `1px solid var(--sidebar-border, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'})`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `var(--sidebar-btn-secondary-hover, ${isDarkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb'})`;
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `var(--sidebar-btn-secondary-bg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6'})`;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaBookReader className="nav-icon" />
            <span className="nav-text">Bookworm Ranking</span>
            {userStats.ranking > 0 && (
              <span
                className="ranking-badge"
                style={{
                  backgroundColor: `var(--sidebar-btn-primary-bg, #667eea)`,
                  color: `var(--sidebar-btn-primary-text, #ffffff)`,
                }}
              >
                #{formatRankingNumber(userStats.ranking)}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mobile-auth-btn logout-btn"
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.08)",
              color: "#dc2626",
              border: "1px solid rgba(220, 38, 38, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.15)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Logged Out View - Show only login button
  return (
    <div
      className="mobile-auth-guest"
      dir={direction}
      style={{
        fontFamily: currentFont?.family,
        backgroundColor: `var(--sidebar-bg, ${isDarkMode ? '#1a1a2e' : '#ffffff'})`,
        color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
        borderColor: `var(--sidebar-border, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'})`,
      }}
    >
      <div className="mobile-auth-guest-content">
        <div
          className="mobile-auth-guest-icon"
          style={{
            background: `var(--sidebar-btn-primary-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))`,
          }}
        >
          <FaUser className="text-white" />
        </div>
        <div className="mobile-auth-guest-text">
          <div
            className="mobile-auth-guest-title"
            style={{
              color: `var(--sidebar-text-primary, ${isDarkMode ? '#ffffff' : '#1a1a2e'})`,
            }}
          >
            Welcome Guest
          </div>
          <div
            className="mobile-auth-guest-subtitle"
            style={{
              color: `var(--sidebar-text-secondary, ${isDarkMode ? '#a0aec0' : '#666666'})`,
            }}
          >
            Sign in to access your account
          </div>
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="mobile-auth-guest-login"
        style={{
          background: `var(--sidebar-btn-primary-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))`,
          color: `var(--sidebar-btn-primary-text, #ffffff)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `var(--sidebar-btn-primary-hover, linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%))`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `var(--sidebar-btn-primary-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%))`;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Log In
      </button>
    </div>
  );
};

export default Slider_Auth_Mobile;