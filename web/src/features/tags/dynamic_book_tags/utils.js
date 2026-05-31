// Helper utilities
"use client";

import { extractDynamicTagsFromBook } from "./extractors";

export const getCategorizedBookTags = (book) => {
  if (!book) return {};
  
  const allTags = extractDynamicTagsFromBook(book);
  
  return {
    topics: allTags.filter(t => 
      !t.match(/India|Asia|Century|Published|Rated|Read|Length/) 
    ).slice(0, 15),
    geography: allTags.filter(t => 
      t === book.geography?.country || 
      t === book.geography?.continent ||
      t === book.geography?.subRegion
    ),
    timePeriod: allTags.filter(t => 
      t.includes("Century") || t.includes("s") || t === "Classic" || t === "Modern"
    ),
    format: allTags.filter(t => 
      t === "Short Read" || t === "Long Read" || t === "Medium Length" || t === "Epic Length"
    ),
    quality: allTags.filter(t => 
      t === "Highly Rated" || t === "Popular" || t === "Reader Favorite"
    )
  };
};

export const sortTagsByRelevance = (tags, currentBook, allBooks) => {
  if (!currentBook || !allBooks?.length) return tags;
  
  const currentTags = extractDynamicTagsFromBook(currentBook);
  const tagFrequency = new Map();
  
  allBooks.forEach(book => {
    if (book.id === currentBook.id) return;
    const bookTags = extractDynamicTagsFromBook(book);
    
    tags.forEach(tag => {
      if (bookTags.includes(tag)) {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      }
    });
  });
  
  return [...tags].sort((a, b) => {
    const freqA = tagFrequency.get(a) || 0;
    const freqB = tagFrequency.get(b) || 0;
    if (freqA !== freqB) return freqB - freqA;
    
    const indexA = currentTags.indexOf(a);
    const indexB = currentTags.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return a.localeCompare(b);
  });
};