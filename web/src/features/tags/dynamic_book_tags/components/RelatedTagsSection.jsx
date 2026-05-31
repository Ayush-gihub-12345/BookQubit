// src/features/tags/dynamic_book_tags/components/RelatedTagsSection.jsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DynamicTagChip from "./DynamicTagChip";
import DynamicTagCloud from "./DynamicTagCloud";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaTags } from "react-icons/fa";

const RelatedTagsSection = ({ 
  currentTags, 
  relatedTags, 
  categorizedTags,
  onTagClick 
}) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  const handleTagClick = (tag) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      // Navigate to tag page
      const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      router.push(`/tags/${tagSlug}`);
    }
  };

  if ((!currentTags?.length && !relatedTags?.length)) return null;

  return (
    <div className="space-y-6">
      {/* Current Book Tags */}
      {currentTags?.length > 0 && (
        <div className={`p-6 rounded-2xl ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
          ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}`}>
          
          <div className="flex items-center gap-2 mb-4">
            <FaTags className={`${theme.textColors?.highlight || "text-sky-500"}`} />
            <h3 className={`text-lg font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
              {t("book.tags") || "Tags"}
            </h3>
            <span className={`text-xs ${theme.textColors?.secondary || "text-gray-500"} ml-2`}>
              ({currentTags.length} tags)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <DynamicTagChip
                key={tag}
                tag={tag}
                size="md"
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Tags Recommendation */}
      {relatedTags?.length > 0 && (
        <DynamicTagCloud
          tags={relatedTags}
          title={t("book.related_tags") || "You Might Also Like"}
          limit={12}
          onTagClick={handleTagClick}
        />
      )}
    </div>
  );
};

export default RelatedTagsSection;