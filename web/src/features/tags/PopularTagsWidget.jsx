// d:/Projects/done/bookqubit_done/web/src/features/tags/PopularTagsWidget.jsx
"use client";

import React, { useEffect, useState } from "react";
import TagCloud from "./TagCloud";
import { getBooksByLanguage } from "@/data/books";
import { getPopularTags } from "./TagsData";
import { useLanguage } from "@/contexts/LanguageContext";

const PopularTagsWidget = ({
  limit = 10,
  title = "Popular Tags",
  size = "md",
}) => {
  const { language } = useLanguage();
  const [popularTags, setPopularTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const books = getBooksByLanguage(language);
    const tags = getPopularTags(books, limit);
    setPopularTags(tags);
    setIsLoading(false);
  }, [language, limit]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TagCloud tags={popularTags} title={title} limit={limit} size={size} />
  );
};

export default PopularTagsWidget;
