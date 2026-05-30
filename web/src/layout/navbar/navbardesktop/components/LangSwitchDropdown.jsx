"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  FaLanguage,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaSearch,
} from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/themes/useTheme";

const LangSwitchDropdown = ({ mobile = false, onItemClick }) => {
  const {
    language,
    languages: originalLanguages,
    isLanguageMenuOpen,
    toggleLanguageMenu,
    setLanguage,
    t,
  } = useLanguage();
  const { theme, themeName } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({});
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Dynamic theme detection
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Dynamic theme-based styles
  const getThemeStyles = () => {
    // Cyberpunk theme
    if (themeName === 'cyberpunk') {
      return {
        background: '#0d0f1a',
        cardBackground: '#1a1d2e',
        highlightBackground: '#2d3050',
        textPrimary: '#00ff9d',
        textSecondary: '#ff00ff',
        textHighlight: '#00ff9d',
        borderColor: '#00ff9d',
        gradientBackground: 'linear-gradient(135deg, #00ff9d, #ff00ff)',
        shadow: '0 0 20px rgba(0, 255, 157, 0.2)',
      };
    }
    
    // Midnight theme
    if (themeName === 'midnight') {
      return {
        background: '#0f172a',
        cardBackground: '#1e293b',
        highlightBackground: '#334155',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        textHighlight: '#38bdf8',
        borderColor: '#334155',
        gradientBackground: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      };
    }
    
    // Dark theme
    if (themeName === 'dark') {
      return {
        background: '#1f2937',
        cardBackground: '#374151',
        highlightBackground: '#4b5563',
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
        textHighlight: '#60a5fa',
        borderColor: '#374151',
        gradientBackground: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      };
    }
    
    // Light theme (default)
    return {
      background: '#ffffff',
      cardBackground: '#f9fafb',
      highlightBackground: '#f3f4f6',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      textHighlight: '#3b82f6',
      borderColor: '#e5e7eb',
      gradientBackground: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    };
  };

  const themeStyles = getThemeStyles();

  // Check if current language is RTL
  const isRTL = useMemo(() => {
    const rtlLanguages = ['ur', 'ar', 'he', 'fa', 'ps', 'sd'];
    return rtlLanguages.includes(language);
  }, [language]);

  // Sort languages
  const languages = useMemo(() => {
    return [...originalLanguages].sort((a, b) => {
      if (a.code === "en") return -1;
      if (b.code === "en") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [originalLanguages]);

  // Filter languages
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return languages;
    
    const term = searchTerm.toLowerCase();
    return languages.filter(lang => 
      lang.name.toLowerCase().includes(term) ||
      lang.nativeName.toLowerCase().includes(term) ||
      lang.code.toLowerCase().includes(term)
    );
  }, [languages, searchTerm]);

  // Calculate dropdown position
  const calculatePosition = () => {
    if (!buttonRef.current || typeof window === "undefined") return {};
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 520;
    const margin = 10;
    
    let position = {};
    
    if (isRTL) {
      if (buttonRect.left - dropdownWidth < 0) {
        position.left = `${margin}px`;
        position.right = 'auto';
      } else {
        position.left = '0';
        position.right = 'auto';
      }
      
      if (buttonRect.left + dropdownWidth > viewportWidth) {
        position.right = `${margin}px`;
        position.left = 'auto';
      }
    } else {
      if (buttonRect.left + dropdownWidth > viewportWidth) {
        position.right = `${margin}px`;
        position.left = 'auto';
      } else if (buttonRect.left < 0) {
        position.left = `${margin}px`;
        position.right = 'auto';
      } else {
        position.left = '0';
        position.right = 'auto';
      }
    }
    
    return position;
  };

  // Update position when dropdown opens
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

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
    setSearchTerm("");
    if (onItemClick) onItemClick();
  };

  const toggleDropdown = () => {
    if (mobile) {
      toggleLanguageMenu();
    } else {
      setIsOpen(!isOpen);
      if (!isOpen) setSearchTerm("");
    }
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find((lang) => lang.code === language);
    return currentLang?.nativeName || "English";
  };

  // Dropdown menu styles
  const dropdownMenuStyles = {
    position: 'absolute',
    top: '100%',
    marginTop: '8px',
    minWidth: '520px',
    zIndex: 1000,
    backgroundColor: themeStyles.background,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: themeStyles.borderColor,
    boxShadow: themeStyles.shadow,
    borderRadius: '0px',
    ...dropdownPosition
  };

  // Language item styles
  const getLangItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: themeStyles.borderColor,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    borderRadius: '0px',
    backgroundColor: isActive ? undefined : themeStyles.cardBackground,
    color: isActive ? '#ffffff' : themeStyles.textPrimary,
    background: isActive ? themeStyles.gradientBackground : undefined,
  });

  // Button styles
  const buttonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px 12px',
    color: themeStyles.textPrimary,
    borderRadius: '0px',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  };

  // Mobile version
  if (mobile) {
    return (
      <div style={{ width: '100%' }}>
        <div
          onClick={toggleDropdown}
          style={buttonStyles}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <span style={{ color: themeStyles.textHighlight }}>
            <FaLanguage />
          </span>
          <span>{t("nav.language")}</span>
          <span style={{ color: themeStyles.textSecondary }}>
            {isLanguageMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>

        {isLanguageMenuOpen && (
          <div
            style={{
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: themeStyles.background,
              border: `1px solid ${themeStyles.borderColor}`,
              borderRadius: '0px',
              marginTop: '8px',
            }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Search Bar */}
            <div style={{ padding: '12px', borderBottom: `1px solid ${themeStyles.borderColor}` }}>
              <div style={{ position: 'relative' }}>
                <FaSearch 
                  style={{
                    position: 'absolute',
                    ...(isRTL ? { right: '12px' } : { left: '12px' }),
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: themeStyles.textSecondary,
                    fontSize: '14px',
                  }}
                />
                <input
                  type="text"
                  placeholder={t("nav.searchLanguages") || "Search languages..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    ...(isRTL ? { paddingRight: '36px', paddingLeft: '12px' } : { paddingLeft: '36px', paddingRight: '12px' }),
                    backgroundColor: themeStyles.cardBackground,
                    color: themeStyles.textPrimary,
                    border: `1px solid ${themeStyles.borderColor}`,
                    outline: 'none',
                    borderRadius: '0px',
                  }}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>
            
            {/* Languages Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '12px' }}>
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isActive = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      style={getLangItemStyles(isActive)}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = themeStyles.highlightBackground;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = themeStyles.cardBackground;
                        }
                      }}
                      dir={lang.code === 'ur' ? 'rtl' : 'ltr'}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{lang.flagEmoji || lang.flag}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ...(lang.code === 'ur' && { fontFamily: "'Noto Nastaliq Urdu', serif" })
                        }}>
                          {lang.nativeName}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lang.name}
                        </div>
                      </div>
                      {isActive && <FaCheck style={{ fontSize: '12px', flexShrink: 0 }} />}
                    </button>
                  );
                })
              ) : (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '32px', color: themeStyles.textSecondary }}>
                  {t("nav.noLanguagesFound") || "No languages found"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        ref={buttonRef}
        style={buttonStyles}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <span style={{ color: themeStyles.textHighlight }}>
          <FaLanguage />
        </span>
        <span>{getCurrentLanguageName()}</span>
        <span style={{ color: themeStyles.textSecondary }}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={dropdownMenuStyles}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Search Bar */}
          <div style={{ padding: '12px', borderBottom: `1px solid ${themeStyles.borderColor}` }}>
            <div style={{ position: 'relative' }}>
              <FaSearch 
                style={{
                  position: 'absolute',
                  ...(isRTL ? { right: '12px' } : { left: '12px' }),
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: themeStyles.textSecondary,
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                placeholder={t("nav.searchLanguages") || "Search languages..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  ...(isRTL ? { paddingRight: '36px', paddingLeft: '12px' } : { paddingLeft: '36px', paddingRight: '12px' }),
                  backgroundColor: themeStyles.cardBackground,
                  color: themeStyles.textPrimary,
                  border: `1px solid ${themeStyles.borderColor}`,
                  outline: 'none',
                  borderRadius: '0px',
                }}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>
          
          {/* Languages Grid */}
          <div style={{ padding: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => {
                  const isActive = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      style={getLangItemStyles(isActive)}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = themeStyles.highlightBackground;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = themeStyles.cardBackground;
                        }
                      }}
                      dir={lang.code === 'ur' ? 'rtl' : 'ltr'}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{lang.flagEmoji || lang.flag}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ...(lang.code === 'ur' && { fontFamily: "'Noto Nastaliq Urdu', serif" })
                        }}>
                          {lang.nativeName}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lang.name}
                        </div>
                      </div>
                      {isActive && <FaCheck style={{ fontSize: '12px', flexShrink: 0 }} />}
                    </button>
                  );
                })
              ) : (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '32px', color: themeStyles.textSecondary }}>
                  {t("nav.noLanguagesFound") || "No languages found"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LangSwitchDropdown;