// Dynamic tag cloud component
"use client";

import React, { useState } from "react";
import DynamicTagChip from "./DynamicTagChip";
import { useTheme } from "@/themes/useTheme";

const DynamicTagCloud = ({ 
  tags, 
  title, 
  limit = 15, 
  showViewMore = true,
  onTagClick 
}) => {
  const [showAll, setShowAll] = useState(false);
  const { theme, themeName } = useTheme();
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const displayTags = showAll ? tags : tags.slice(0, limit);
  const hasMoreTags = tags.length > limit;

  if (!tags?.length) return null;

  return (
    <div className={`p-4 rounded-xl ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')}
      ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'}`}>
      
      {title && (
        <h3 className={`text-lg font-semibold mb-3 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
          {title}
        </h3>
      )}
      
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <DynamicTagChip
            key={tag}
            tag={tag}
            size="md"
            onTagClick={onTagClick}
          />
        ))}
      </div>
      
      {showViewMore && hasMoreTags && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`mt-3 text-sm ${theme.textColors?.highlight || 'text-sky-500'} hover:underline`}
        >
          {showAll ? "Show Less" : `Show ${tags.length - limit} More`}
        </button>
      )}
    </div>
  );
};

export default DynamicTagCloud;