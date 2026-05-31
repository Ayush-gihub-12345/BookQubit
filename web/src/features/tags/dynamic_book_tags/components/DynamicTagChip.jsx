// src/features/tags/dynamic_book_tags/components/DynamicTagChip.jsx
"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaTag } from "react-icons/fa";

const DynamicTagChip = ({ 
  tag, 
  size = "md", 
  clickable = true,
  showIcon = true,
  onTagClick,
  className = ""
}) => {
  const { theme, themeName } = useTheme();
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  // Generate slug from tag name
  const generateTagSlug = (tagName) => {
    return tagName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const tagSlug = generateTagSlug(tag);

  const TagContent = () => (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200
      ${sizes[size]}
      ${clickable ? 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-95' : 'cursor-default'}
      ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}
      ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-300' : 'text-gray-700')}
      border ${theme.border?.default || (isDarkMode ? 'border-gray-700' : 'border-gray-200')}
      ${className}
    `}>
      {showIcon && <FaTag className="text-xs" />}
      <span className="capitalize">{tag}</span>
    </div>
  );

  if (!clickable) return <TagContent />;
  
  if (onTagClick) {
    return (
      <button onClick={() => onTagClick(tag)}>
        <TagContent />
      </button>
    );
  }
  
  // Navigate to tag page
  return (
    <Link href={`/tags/${tagSlug}`}>
      <TagContent />
    </Link>
  );
};

export default DynamicTagChip;