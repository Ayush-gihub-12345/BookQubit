// Hook for related tags
"use client";

import { useState, useEffect } from "react";
import { getRelatedTagsForBook, getSimilarBooksByTags } from "../index";

const useRelatedTags = (currentBook, allBooks) => {
  const [relatedTags, setRelatedTags] = useState([]);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBook && allBooks?.length) {
      const tags = getRelatedTagsForBook(currentBook, allBooks, 12);
      const books = getSimilarBooksByTags(currentBook, allBooks, 6);
      
      setRelatedTags(tags);
      setSimilarBooks(books);
      setLoading(false);
    }
  }, [currentBook, allBooks]);

  return { relatedTags, similarBooks, loading };
};

export default useRelatedTags;