// d:/Projects/done/bookqubit_done/web/src/features/tags/TagChip.jsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { FaTag, FaTimes } from "react-icons/fa";
import { generateTagSlug } from "./TagsData";

const TagChip = ({
  tag,
  count,
  size = "md",
  clickable = true,
  removable = false,
  showIcon = true,
  showCount = false,
  onTagClick,
  onRemove,
  className = "",
}) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const sizes = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
    xl: "px-5 py-2 text-lg",
  };

  const handleClick = () => {
    if (onTagClick) {
      onTagClick(tag);
    } else if (clickable) {
      const slug = generateTagSlug(tag);
      router.push(`/tags/${slug}`);
    }
  };

  const TagContent = () => (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200
        ${sizes[size]}
        ${clickable ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95" : "cursor-default"}
        ${removable ? "pr-1.5" : ""}
        ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
        ${theme.textColors?.secondary || (isDarkMode ? "text-gray-300" : "text-gray-700")}
        border ${theme.border?.default || (isDarkMode ? "border-gray-700" : "border-gray-200")}
        ${className}
      `}
    >
      {showIcon && (
        <FaTag className={`${size === "xs" ? "text-[8px]" : "text-xs"}`} />
      )}
      <span className="capitalize">{tag}</span>
      {showCount && count !== undefined && (
        <span
          className={`ml-1 opacity-70 ${size === "xs" ? "text-[8px]" : "text-xs"}`}
        >
          ({count})
        </span>
      )}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
        >
          <FaTimes
            className={`${size === "xs" ? "text-[6px]" : "text-[10px]"}`}
          />
        </button>
      )}
    </div>
  );

  if (!clickable && !removable) {
    return <TagContent />;
  }

  if (onTagClick || removable) {
    return (
      <button onClick={handleClick}>
        <TagContent />
      </button>
    );
  }

  return (
    <Link href={`/tags/${generateTagSlug(tag)}`}>
      <TagContent />
    </Link>
  );
};

export default TagChip;
