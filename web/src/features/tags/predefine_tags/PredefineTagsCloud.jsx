// src/features/tags/predefine_tags/PredefineTagsCloud.jsx
"use client";

import React, { useState } from "react";
import PredefineTagsTagChip from "./predefine_tags_tagchip";
import {
  getTagsByCategory,
  getCategoryTitle,
  getCategoryIcon,
  TAG_CATEGORIES,
} from "./predefine_tags_data";
import { useTheme } from "@/themes/useTheme";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PredefineTagsCloud = ({
  categories = Object.values(TAG_CATEGORIES),
  limit = 8,
  showViewMore = true,
  variant = "default",
  size = "md",
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const { theme, themeName } = useTheme();
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const tags = getTagsByCategory(category);
        const isExpanded = expandedCategories[category];
        const displayTags = isExpanded ? tags : tags.slice(0, limit);
        const hasMoreTags = tags.length > limit;

        return (
          <div
            key={category}
            className={`p-4 rounded-xl ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
              ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-lg font-semibold flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                <span>{getCategoryIcon(category)}</span>
                <span>{getCategoryTitle(category)}</span>
              </h3>
              {hasMoreTags && showViewMore && (
                <button
                  onClick={() => toggleCategory(category)}
                  className={`text-sm ${theme.textColors?.highlight || "text-sky-500"} hover:underline flex items-center gap-1`}
                >
                  {isExpanded ? (
                    <>
                      Show Less <FaChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Show More <FaChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <PredefineTagsTagChip
                  key={tag.name}
                  tag={tag}
                  size={size}
                  variant={variant}
                  showIcon={true}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PredefineTagsCloud;
