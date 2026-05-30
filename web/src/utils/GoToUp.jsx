"use client";

import { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaEye, FaEyeSlash, FaTimes, FaCheck } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";

const GoToUp = ({ showAfter = 300, smooth = true, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempHidden, setTempHidden] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pressTimer, setPressTimer] = useState(null);
  const { theme, themeName } = useTheme();
  const { direction, isRTL } = useRTL();

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";
  const longPressTimeout = useRef(null);
  const hideTimeout = useRef(null);

  // Load saved preference
  useEffect(() => {
    const savedHidden = localStorage.getItem("goToUpHidden");
    if (savedHidden === "true") {
      setIsHidden(true);
    }
  }, []);

  // Show button when page is scrolled down (only if not hidden)
  useEffect(() => {
    const toggleVisibility = () => {
      if (!isHidden && window.scrollY > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [showAfter, isHidden]);

  // Countdown timer for temporary hide
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && tempHidden) {
      // Restore button after countdown
      setTempHidden(false);
      setIsHidden(false);
      localStorage.setItem("goToUpHidden", "false");
      setShowSettings(false);
    }
  }, [countdown, tempHidden]);

  // Scroll to top function
  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  // Double click to open settings
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setShowSettings(true);
  };

  // Hide button permanently
  const handleHidePermanently = () => {
    setIsHidden(true);
    localStorage.setItem("goToUpHidden", "true");
    setShowSettings(false);
    setIsVisible(false);
  };

  // Hide button temporarily for 5 seconds
  const handleHideTemporarily = () => {
    setTempHidden(true);
    setIsVisible(false);
    setCountdown(5);
    setShowSettings(false);
  };

  // Restore button
  const handleRestore = () => {
    setIsHidden(false);
    setTempHidden(false);
    localStorage.setItem("goToUpHidden", "false");
    setShowSettings(false);
    setCountdown(0);
  };

  // Long press anywhere on screen (5 seconds) to restore
  useEffect(() => {
    const handleLongPressStart = () => {
      longPressTimeout.current = setTimeout(() => {
        if (isHidden || tempHidden) {
          handleRestore();
          // Show notification
          const notification = document.createElement("div");
          notification.textContent = "✓ Go to Up button restored!";
          notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${isDarkMode ? "#1f2937" : "#ffffff"};
            color: ${isDarkMode ? "#ffffff" : "#111827"};
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            animation: fadeInUp 0.3s ease;
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => notification.remove(), 300);
          }, 2000);
        }
      }, 5000);
    };

    const handleLongPressEnd = () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
    };

    document.addEventListener("mousedown", handleLongPressStart);
    document.addEventListener("mouseup", handleLongPressEnd);
    document.addEventListener("touchstart", handleLongPressStart);
    document.addEventListener("touchend", handleLongPressEnd);

    return () => {
      document.removeEventListener("mousedown", handleLongPressStart);
      document.removeEventListener("mouseup", handleLongPressEnd);
      document.removeEventListener("touchstart", handleLongPressStart);
      document.removeEventListener("touchend", handleLongPressEnd);
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, [isHidden, tempHidden, isDarkMode]);

  // Close settings on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettings && !e.target.closest(".go-to-up-settings-box")) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  // Styles based on theme
  const getButtonStyles = () => {
    const baseStyles = {
      position: "fixed",
      bottom: "2rem",
      [isRTL ? "left" : "right"]: "1.5rem",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    };

    if (theme?.button?.primary) {
      return {
        ...baseStyles,
        background: theme.button.primary,
        color: theme.button?.text || "#ffffff",
      };
    }

    if (isDarkMode) {
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
        color: "#ffffff",
      };
    }

    return {
      ...baseStyles,
      background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
      color: "#ffffff",
    };
  };

  const buttonStyles = getButtonStyles();

  // Don't show if temporarily hidden
  if (tempHidden) {
    return (
      <>
        {countdown > 0 && (
          <div
            style={{
              position: "fixed",
              bottom: "2rem",
              [isRTL ? "left" : "right"]: "1.5rem",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              color: "white",
              fontSize: "1.25rem",
              fontWeight: "bold",
            }}
          >
            {countdown}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div
          className="go-to-up-settings-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="go-to-up-settings-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDarkMode ? "#1f2937" : "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              width: "280px",
              maxWidth: "90%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              textAlign: "center",
              animation: "fadeInUp 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: 0,
                  color: isDarkMode ? "#ffffff" : "#111827",
                }}
              >
                Go to Up Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                  padding: "4px",
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleHideTemporarily}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: isDarkMode ? "#374151" : "#f3f4f6",
                  color: isDarkMode ? "#ffffff" : "#111827",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <FaEyeSlash size={16} />
                Hide for 5 seconds
              </button>

              <button
                onClick={handleHidePermanently}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: isDarkMode ? "#374151" : "#f3f4f6",
                  color: isDarkMode ? "#ffffff" : "#111827",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <FaEyeSlash size={16} />
                Hide Permanently
              </button>

              {isHidden && (
                <button
                  onClick={handleRestore}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: "#0ea5e9",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <FaEye size={16} />
                  Restore Button
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                fontSize: "12px",
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              <p style={{ margin: 0 }}>💡 Tip: Press anywhere on screen for 5 seconds to restore</p>
            </div>
          </div>
        </div>
      )}

      {/* Go to Up Button */}
      {isVisible && !isHidden && !tempHidden && (
        <button
          onClick={scrollToTop}
          onDoubleClick={handleDoubleClick}
          style={buttonStyles}
          className={`go-to-up-btn ${className}`}
          aria-label="Go to top (double click for settings)"
          title="Double click for settings"
          dir={direction}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = buttonStyles.boxShadow;
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
        >
          <FaArrowUp
            style={{
              fontSize: "1.25rem",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      )}

      <style jsx>{`
        .go-to-up-btn {
          animation: fadeInUp 0.3s ease;
        }

        .go-to-up-btn:hover svg {
          transform: translateY(-2px);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .go-to-up-btn {
            width: 44px !important;
            height: 44px !important;
            bottom: 1.5rem !important;
            ${isRTL ? "left" : "right"}: 1rem !important;
          }
          
          .go-to-up-btn svg {
            font-size: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .go-to-up-btn {
            width: 40px !important;
            height: 40px !important;
            bottom: 1rem !important;
            ${isRTL ? "left" : "right"}: 0.75rem !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .go-to-up-btn {
            animation: none;
            transition: none;
          }
          
          .go-to-up-btn:hover svg {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default GoToUp;