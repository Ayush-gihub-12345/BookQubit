// Hook for book tags
"use client";

import { useState, useEffect } from "react";
import { extractDynamicTagsFromBook, getCategorizedBookTags } from "../index";

const useBookTags = (book) => {
  const [tags, setTags] = useState([]);
  const [categorizedTags, setCategorizedTags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book) {
      const extractedTags = extractDynamicTagsFromBook(book);
      const categorized = getCategorizedBookTags(book);
      
      setTags(extractedTags);
      setCategorizedTags(categorized);
      setLoading(false);
    }
  }, [book]);

  return { tags, categorizedTags, loading };
};

export default useBookTags;