"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const Button = ({
  text,
  href,
  preset = "primaryButton",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Base classes with theme support
  const baseClasses = `
    px-5 py-2.5 
    rounded-lg 
    text-sm font-medium 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${theme.border?.button || ''}
    ${theme.shadow?.button || 'shadow-md'}
    hover:shadow-lg
    disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:opacity-50
  `;

  // Preset classes from theme
  const getPresetClasses = () => {
    switch (preset) {
      case "primaryButton":
        return `
          ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
          ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
          ${theme.buttonColors?.primaryButton?.textColor || 'text-white'}
          focus:ring-sky-500
        `;
      case "secondaryButton":
        return `
          ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'}
          ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
          ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
          focus:ring-sky-500
        `;
      case "wishlistButton":
        return `
          ${theme.buttonColors?.wishlistButton?.defaultBackground || 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
          hover:${theme.buttonColors?.wishlistButton?.savedBackground || 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-600'}
          focus:ring-rose-500
          text-gray-700 dark:text-gray-300
        `;
      case "greenButton":
        return `
          bg-gradient-to-r from-green-600 to-green-500
          hover:from-green-700 hover:to-green-600
          text-white
          focus:ring-green-500
        `;
      default:
        return "";
    }
  };

  // Focus ring offset based on theme
  const focusRingOffset = isDarkMode
    ? "focus:ring-offset-gray-900"
    : "focus:ring-offset-white";

  // Translate text if it's a translation key
  const displayText = text && (text.startsWith('button.') || text.startsWith('book.') || text.startsWith('filter.') || text.startsWith('search.')) 
    ? t(text) || text 
    : text;

  const buttonClass = `
    ${baseClasses} 
    ${getPresetClasses()} 
    ${focusRingOffset}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim();

  // Handle disabled state for links
  const handleLinkClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
  };

  // Use Next.js Link for internal navigation, regular a tag for external
  const isInternalLink = href && href.startsWith('/');
  const isExternalLink = href && (href.startsWith('http') || href.startsWith('https'));

  if (href) {
    if (isInternalLink) {
      return (
        <Link
          href={disabled ? "#" : href}
          className={buttonClass}
          onClick={handleLinkClick}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
        >
          {displayText}
        </Link>
      );
    }
    
    // External link (opens in new tab)
    return (
      <a
        href={disabled ? undefined : href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        onClick={handleLinkClick}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {displayText}
      </a>
    );
  }

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {displayText}
    </button>
  );
};

// Loading button variant
export const LoadingButton = ({ isLoading, text, disabled, ...props }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Translate loading text
  const loadingText = t("button.loading") || "Loading...";
  const displayText = isLoading ? loadingText : text;

  return (
    <Button
      {...props}
      text={displayText}
      disabled={disabled || isLoading}
      className={`relative ${isLoading ? "cursor-wait" : ""} ${props.className || ""}`}
    >
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg
            className={`animate-spin h-5 w-5 ${theme.buttonColors?.primaryButton?.textColor || 'text-white'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </Button>
  );
};

// Icon button variant
export const IconButton = ({ icon, text, ...props }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Translate text if it's a translation key
  const displayText = text && (text.startsWith('button.') || text.startsWith('book.') || text.startsWith('filter.')) 
    ? t(text) || text 
    : text;

  return (
    <Button
      {...props}
      className={`flex items-center justify-center gap-2 ${props.className || ""}`}
    >
      <span className={theme.textColors?.highlight || 'text-sky-600 dark:text-sky-400'}>
        {icon}
      </span>
      <span>{displayText}</span>
    </Button>
  );
};

export default Button;