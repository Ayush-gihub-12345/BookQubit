"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaUserCircle, FaTachometerAlt, FaBookReader } from "react-icons/fa";
import { useRTL } from "@/contexts/RTLContext";
import { useTheme } from "@/themes/useTheme";
import { useFont } from "@/contexts/FontContext";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./auth_mobile.css";

const Auth_Mobile = ({ onItemClick }) => {
  const router = useRouter();
  const { direction, isRTL } = useRTL();
  const { theme, themeName } = useTheme();
  const { currentFont } = useFont();
  
  // Real user state from Firebase
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if current theme is dark mode (from HeroSection pattern)
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";
  
  // Real user data from Firebase
  const [userStats, setUserStats] = useState({
    ranking: 0,
    booksRead: 0,
    reviews: 0
  });

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      setLoading(false);
      
      // Fetch real user stats if logged in
      if (currentUser) {
        fetchUserStats(currentUser.uid);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const fetchUserStats = async (userId) => {
    // Replace with your actual API call to fetch user stats
    try {
      // Example API call - replace with your actual endpoint
      // const response = await fetch(`/api/users/${userId}/stats`);
      // const data = await response.json();
      // setUserStats(data);
      
      // Temporary placeholder - remove when using real API
      setUserStats({
        ranking: 0,
        booksRead: 0,
        reviews: 0
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const formatRankingNumber = (num) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUser(null);
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

  // Theme-based dynamic styles (following HeroSection patterns)
  const themeStyles = {
    fontFamily: currentFont?.family,
    color: theme.textColors?.primary || "inherit",
    backgroundColor: theme.background?.section || theme.background?.default || "#ffffff",
  };

  // Show loading state
  if (loading) {
    return (
      <div 
        className="auth-mobile-loading" 
        dir={direction}
        style={themeStyles}
      >
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // Logged In View - Show only if user is actually logged in
  if (isLoggedIn && user) {
    return (
      <div 
        className="auth-mobile" 
        dir={direction}
        style={themeStyles}
      >
        {/* User Profile */}
        <div className={`auth-profile ${isRTL ? "rtl" : "ltr"}`}>
          <div className="auth-avatar-wrapper">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="auth-avatar"
              />
            ) : (
              <div 
                className="auth-avatar-placeholder"
                style={{
                  background: theme.buttonColors?.primaryButton?.background || 
                            theme.iconColors?.starFilled || 
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                }}
              >
                <span 
                  className="avatar-initials"
                  style={{
                    color: theme.buttonColors?.primaryButton?.textColor || "#ffffff"
                  }}
                >
                  {getInitials()}
                </span>
              </div>
            )}
          </div>
          <div className="auth-info">
            <div 
              className="auth-name"
              style={{
                color: theme.textColors?.primary || "#1a1a2e",
                fontFamily: currentFont?.family
              }}
            >
              {user.displayName || user.email?.split("@")[0] || "User"}
            </div>
            <div 
              className="auth-email"
              style={{
                color: theme.textColors?.secondary || "#666666",
                fontFamily: currentFont?.family
              }}
            >
              {user.email}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="auth-stats">
          <div 
            className="stat-item"
            style={{
              backgroundColor: theme.background?.card || theme.background?.hover || 
                              (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
              borderColor: theme.border?.default || "rgba(156, 163, 175, 0.15)"
            }}
          >
            <div 
              className="stat-value"
              style={{
                color: theme.textColors?.highlight || "#0ea5e9"
              }}
            >
              {formatRankingNumber(userStats.ranking)}
            </div>
            <div 
              className="stat-label"
              style={{
                color: theme.textColors?.secondary || "#666666"
              }}
            >
              Ranking
            </div>
          </div>
          <div 
            className="stat-item"
            style={{
              backgroundColor: theme.background?.card || theme.background?.hover || 
                              (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
              borderColor: theme.border?.default || "rgba(156, 163, 175, 0.15)"
            }}
          >
            <div 
              className="stat-value"
              style={{
                color: theme.textColors?.highlight || "#0ea5e9"
              }}
            >
              {userStats.booksRead}
            </div>
            <div 
              className="stat-label"
              style={{
                color: theme.textColors?.secondary || "#666666"
              }}
            >
              Books Read
            </div>
          </div>
          <div 
            className="stat-item"
            style={{
              backgroundColor: theme.background?.card || theme.background?.hover || 
                              (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
              borderColor: theme.border?.default || "rgba(156, 163, 175, 0.15)"
            }}
          >
            <div 
              className="stat-value"
              style={{
                color: theme.textColors?.highlight || "#0ea5e9"
              }}
            >
              {userStats.reviews}
            </div>
            <div 
              className="stat-label"
              style={{
                color: theme.textColors?.secondary || "#666666"
              }}
            >
              Reviews
            </div>
          </div>
        </div>

        {/* Action Buttons - Following HeroSection button patterns */}
        <div className="auth-buttons">
          <button
            onClick={() => handleNavigation("/userdashboard")}
            className="auth-btn dashboard-btn"
            style={{
              backgroundColor: theme.buttonColors?.secondaryButton?.background || 
                              (isDarkMode ? "rgba(255,255,255,0.1)" : "#f3f4f6"),
              color: theme.buttonColors?.secondaryButton?.textColor || 
                     theme.textColors?.primary || "#374151",
              border: `1px solid ${theme.border?.default || "rgba(156, 163, 175, 0.15)"}`,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.buttonColors?.secondaryButton?.hoverBackground || 
                                                      (isDarkMode ? "rgba(255,255,255,0.15)" : "#e5e7eb");
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.buttonColors?.secondaryButton?.background || 
                                                      (isDarkMode ? "rgba(255,255,255,0.1)" : "#f3f4f6");
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaTachometerAlt style={{ color: theme.iconColors?.default || "inherit" }} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigation("/bookwormranking")}
            className="auth-btn ranking-btn"
            style={{
              background: theme.buttonColors?.primaryButton?.background || 
                         "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: theme.buttonColors?.primaryButton?.textColor || "#ffffff",
              border: "none",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.buttonColors?.primaryButton?.hoverBackground || 
                                                 "linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.buttonColors?.primaryButton?.background || 
                                                 "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaBookReader />
            <span>Bookworm Ranking</span>
            {userStats.ranking > 0 && (
              <span 
                className="ranking-badge"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "11px",
                  marginLeft: "8px"
                }}
              >
                #{formatRankingNumber(userStats.ranking)}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="auth-btn logout-btn"
            style={{
              backgroundColor: "transparent",
              color: theme.textColors?.error || "#dc2626",
              border: `1px solid ${theme.border?.error || "rgba(220, 38, 38, 0.3)"}`,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Logged Out View - Show login button only (no dummy user)
  return (
    <div 
      className="auth-mobile-loggedout" 
      dir={direction}
      style={{
        ...themeStyles,
        backgroundColor: theme.background?.section || "#ffffff"
      }}
    >
      <div className={`login-prompt ${isRTL ? "rtl" : "ltr"}`}>
        <div 
          className="login-icon"
          style={{
            color: theme.iconColors?.starFilled || "#0ea5e9"
          }}
        >
          <FaUserCircle />
        </div>
        <div className="login-text">
          <div 
            className="login-title"
            style={{
              color: theme.textColors?.primary || "#1a1a2e"
            }}
          >
            Welcome to BookQubit
          </div>
          <div 
            className="login-subtitle"
            style={{
              color: theme.textColors?.secondary || "#666666"
            }}
          >
            Sign in to access your account
          </div>
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="login-button"
        style={{
          background: theme.buttonColors?.primaryButton?.background || 
                     "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: theme.buttonColors?.primaryButton?.textColor || "#ffffff",
          border: "none",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.buttonColors?.primaryButton?.hoverBackground || 
                                             "linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.buttonColors?.primaryButton?.background || 
                                             "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <FaUser />
        <span>Log In</span>
      </button>
    </div>
  );
};

export default Auth_Mobile;