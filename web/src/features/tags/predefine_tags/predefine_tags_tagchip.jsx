// src/features/tags/predefine_tags/predefine_tags_tagchip.jsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { getPredefinedTagByName, PREDEFINED_TAGS } from "./predefine_tags_data";
import { generateTagSlug } from "../TagsData";

const PredefineTagsTagChip = ({
  tag,
  size = "md",
  clickable = true,
  showIcon = true,
  showCategory = false,
  variant = "default", // "default", "outline", "filled", "gradient"
  onTagClick,
  className = "",
}) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Get tag data (could be string name or object)
  const tagData = typeof tag === "string" ? getPredefinedTagByName(tag) : tag;
  const tagName = tagData?.name || (typeof tag === "string" ? tag : tag?.name);
  const tagIcon = tagData?.icon || "🏷️";
  const tagColor = tagData?.color || (isDarkMode ? "#60A5FA" : "#3B82F6");
  const tagCategory = tagData?.category;

  const sizes = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1",
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
    xl: "px-5 py-2 text-lg gap-2",
  };

  // Variant styles
  const variantStyles = {
    default: `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700`,
    outline: `bg-transparent border-2 text-gray-700 dark:text-gray-300`,
    filled: `text-white`,
    gradient: `text-white bg-gradient-to-r`,
  };

  const getGradientColors = () => {
    switch (tagCategory) {
      case "genre":
        return "from-blue-500 to-purple-500";
      case "topic":
        return "from-green-500 to-teal-500";
      case "theme":
        return "from-orange-500 to-red-500";
      case "mood":
        return "from-pink-500 to-rose-500";
      case "award":
        return "from-yellow-500 to-amber-500";
      default:
        return "from-sky-500 to-blue-500";
    }
  };

  const handleClick = () => {
    if (onTagClick) {
      onTagClick(tagName);
    } else if (clickable) {
      const slug = generateTagSlug(tagName);
      router.push(`/tags/${slug}`);
    }
  };

  const TagContent = () => (
    <div
      className={`inline-flex items-center rounded-full font-medium transition-all duration-200
        ${sizes[size]}
        ${clickable ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95" : "cursor-default"}
        ${variant === "gradient" ? `${variantStyles[variant]} ${getGradientColors()}` : variantStyles[variant]}
        ${variant !== "gradient" && variant !== "filled" ? `border` : ""}
        ${variant === "filled" ? `bg-[${tagColor}]` : ""}
        ${className}
      `}
      style={variant === "filled" ? { backgroundColor: tagColor } : {}}
    >
      {showIcon && (
        <span className={`${size === "xs" ? "text-[10px]" : "text-sm"}`}>
          {tagIcon}
        </span>
      )}
      <span className="capitalize">{tagName}</span>
      {showCategory && tagCategory && (
        <span className={`ml-1 opacity-70 text-xs`}>• {tagCategory}</span>
      )}
    </div>
  );

  if (!clickable) {
    return <TagContent />;
  }

  if (onTagClick) {
    return (
      <button onClick={handleClick}>
        <TagContent />
      </button>
    );
  }

  return (
    <Link href={`/tags/${generateTagSlug(tagName)}`}>
      <TagContent />
    </Link>
  );
};

export default PredefineTagsTagChip;
