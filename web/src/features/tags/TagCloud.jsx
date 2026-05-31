// d:/Projects/done/bookqubit_done/web/src/features/tags/TagCloud.jsx
"use client";

import React, { useState } from "react";
import TagChip from "./TagChip";
import { useTheme } from "@/themes/useTheme";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const TagCloud = ({
  tags,
  title,
  limit = 10,
  showViewMore = true,
  onTagClick,
  size = "md",
}) => {
  const [showAll, setShowAll] = useState(false);
  const { theme, themeName } = useTheme();
  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const displayTags = showAll ? tags : tags.slice(0, limit);
  const hasMoreTags = tags.length > limit;

  return (
    <div
      className={`p-4 rounded-xl ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
      ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}`}
    >
      {title && (
        <h3
          className={`text-lg font-semibold mb-3 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
        >
          {title}
        </h3>
      )}

      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <TagChip
            key={typeof tag === "string" ? tag : tag.name}
            tag={typeof tag === "string" ? tag : tag.name}
            count={typeof tag === "object" ? tag.count : undefined}
            size={size}
            onTagClick={onTagClick}
          />
        ))}
      </div>

      {showViewMore && hasMoreTags && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`mt-3 text-sm ${theme.textColors?.highlight || "text-sky-500"} hover:underline flex items-center gap-1`}
        >
          {showAll ? (
            <>
              Show less <FaChevronUp size={12} />
            </>
          ) : (
            <>
              Show {tags.length - limit} more <FaChevronDown size={12} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TagCloud;
