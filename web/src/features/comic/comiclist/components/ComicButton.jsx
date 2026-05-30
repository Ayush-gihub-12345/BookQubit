"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

const ComicButton = ({
  children,
  variant = "primary",
  size = "md",
  href,
  to,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  className = "",
  fullWidth = false,
  ...props
}) => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center font-semibold transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    ${theme.border?.button || 'border border-gray-300 dark:border-gray-600'}
    ${theme.shadow?.button || 'shadow-md'}
    ${fullWidth ? "w-full" : ""}
    rounded-lg
    hover:scale-105 active:scale-95
  `;

  // Focus ring offset based on theme
  const focusRingOffset = isDarkMode
    ? "focus:ring-offset-gray-900"
    : "focus:ring-offset-white";

  // Variant styles
  const variantStyles = {
    primary: `
      ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'}
      text-white
      ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-sky-700 hover:to-sky-600'}
      focus:ring-sky-500
    `,
    secondary: `
      ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent'}
      ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400'}
      ${theme.buttonColors?.secondaryButton?.hoverBackground || 'hover:bg-sky-50 dark:hover:bg-sky-900/20'}
      focus:ring-sky-500
    `,
    wishlist: `
      border-2 
      ${theme.buttonColors?.wishlistButton?.defaultBackground || 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
      ${theme.textColors?.wishlistDefault || 'text-gray-600 dark:text-gray-400'}
      hover:bg-rose-50 hover:border-rose-400 hover:text-rose-600
      dark:hover:bg-rose-900/20 dark:hover:border-rose-600 dark:hover:text-rose-400
      focus:ring-rose-500
    `,
    wishlistActive: `
      ${theme.buttonColors?.wishlistButton?.savedBackground || 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-600'}
      ${theme.textColors?.wishlistSaved || 'text-rose-600 dark:text-rose-400'}
      focus:ring-rose-500
    `,
    collector: `
      bg-gradient-to-r from-amber-500 to-amber-600 
      text-white border-amber-600
      hover:from-amber-600 hover:to-amber-700
      focus:ring-amber-500
    `,
    digital: `
      bg-gradient-to-r from-emerald-500 to-emerald-600 
      text-white border-emerald-600
      hover:from-emerald-600 hover:to-emerald-700
      focus:ring-emerald-500
    `,
    outline: `
      border-2 border-gray-300 dark:border-gray-600 
      ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
      hover:bg-gray-50 hover:border-gray-400
      dark:hover:bg-gray-800 dark:hover:border-gray-500
      focus:ring-gray-500
    `,
    ghost: `
      border-2 border-transparent 
      ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}
      hover:bg-gray-100 hover:${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
      dark:hover:bg-gray-800 dark:hover:text-white
      focus:ring-gray-500
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-3 text-sm min-h-[44px]",
    lg: "px-6 py-4 text-base min-h-[52px]",
    xl: "px-8 py-4 text-lg font-bold min-h-[60px]",
  };

  // Comic-specific variant icons
  const comicIcons = {
    read: "📖",
    digital: "💻",
    collect: "💎",
    wishlist: "❤️",
    share: "↗️",
    summary: "📝",
    guide: "🧭",
    buy: "🛒",
    preview: "👁️",
  };

  // Determine the actual icon to use
  const actualIcon = comicIcons[icon] || icon;

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${focusRingOffset}
    ${className}
  `.trim();

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  // Get translated text for children if it's a translation key
  const getDisplayText = (text) => {
    if (typeof text === 'string' && (text.startsWith('comic.') || text.startsWith('button.') || text.startsWith('book.'))) {
      return t(text) || text;
    }
    return text;
  };

  // Button content
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && actualIcon && iconPosition === "left" && (
        <span className="mr-2 text-lg">{actualIcon}</span>
      )}
      <span className="whitespace-nowrap">{getDisplayText(children)}</span>
      {!loading && actualIcon && iconPosition === "right" && (
        <span className="ml-2 text-lg">{actualIcon}</span>
      )}
    </>
  );

  // Render as Link if 'to' prop is provided (internal navigation)
  if (to) {
    return (
      <Link href={to} className={buttonStyles} {...props}>
        {buttonContent}
      </Link>
    );
  }

  // Render as anchor if 'href' prop is provided (external link)
  if (href) {
    return (
      <a
        href={href}
        className={buttonStyles}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  // Render as button
  return (
    <button
      type="button"
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

// Predefined comic-specific buttons for easy use
export const ComicActionButtons = {
  ViewDetails: ({ comicSlug, size = "md", className = "" }) => (
    <ComicButton
      to={`/comics/${comicSlug}`}
      variant="primary"
      size={size}
      icon="preview"
      className={`flex-1 ${className}`}
    >
      comic.view_details
    </ComicButton>
  ),

  ReadDigital: ({ comicSlug, size = "md", className = "" }) => (
    <ComicButton
      to={`/read/comic/${comicSlug}`}
      variant="digital"
      size={size}
      icon="digital"
      className={`flex-1 ${className}`}
    >
      comic.read_digital
    </ComicButton>
  ),

  CollectorGuide: ({ comicSlug, size = "md", className = "" }) => (
    <ComicButton
      to={`/comics/${comicSlug}/collectors-guide`}
      variant="collector"
      size={size}
      icon="guide"
      className={`flex-1 ${className}`}
    >
      comic.collectors_guide
    </ComicButton>
  ),

  AddWishlist: ({
    comicSlug,
    isWishlisted,
    onToggle,
    size = "md",
    className = "",
  }) => (
    <ComicButton
      variant={isWishlisted ? "wishlistActive" : "wishlist"}
      size={size}
      icon="wishlist"
      onClick={onToggle}
      className={`flex-1 ${className}`}
    >
      {isWishlisted ? "book.wishlisted" : "book.wishlist"}
    </ComicButton>
  ),

  QuickSummary: ({ comicSlug, size = "md", className = "" }) => (
    <ComicButton
      to={`/comics/${comicSlug}/summary`}
      variant="secondary"
      size={size}
      icon="summary"
      className={`flex-1 ${className}`}
    >
      comic.quick_summary
    </ComicButton>
  ),

  BuyPhysical: ({ url, size = "md", className = "" }) => (
    <ComicButton
      href={url}
      variant="primary"
      size={size}
      icon="buy"
      className={`flex-1 ${className}`}
    >
      comic.buy_physical
    </ComicButton>
  ),

  ShareComic: ({ comicSlug, size = "md", className = "" }) => (
    <ComicButton
      to={`/share/comic/${comicSlug}`}
      variant="outline"
      size={size}
      icon="share"
      className={`flex-1 ${className}`}
    >
      book.share
    </ComicButton>
  ),
};

// Button group component for perfect alignment
export const ComicButtonGroup = ({
  children,
  direction = "horizontal",
  className = "",
}) => {
  const directionStyles = {
    horizontal: "flex flex-row gap-3 items-stretch",
    vertical: "flex flex-col gap-3",
  };

  return (
    <div className={`${directionStyles[direction]} ${className}`}>
      {children}
    </div>
  );
};

// Default export
export default ComicButton;