// Related tags logic
"use client";

import { extractDynamicTagsFromBook } from "./extractors";

export const getRelatedTagsForBook = (currentBook, allBooks, limit = 10) => {
  if (!currentBook || !allBooks?.length) return [];
  
  const currentTags = extractDynamicTagsFromBook(currentBook);
  const tagScores = new Map();
  
  allBooks.forEach(book => {
    if (book.id === currentBook.id) return;
    
    const bookTags = extractDynamicTagsFromBook(book);
    let similarity = 0;
    
    currentTags.forEach(currentTag => {
      if (bookTags.some(bookTag => 
        bookTag.toLowerCase().includes(currentTag.toLowerCase()) ||
        currentTag.toLowerCase().includes(bookTag.toLowerCase())
      )) {
        similarity++;
      }
    });
    
    if (similarity > 0) {
      bookTags.forEach(tag => {
        if (!currentTags.includes(tag)) {
          tagScores.set(tag, (tagScores.get(tag) || 0) + similarity);
        }
      });
    }
  });
  
  return Array.from(tagScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};

export const getSimilarBooksByTags = (currentBook, allBooks, limit = 6) => {
  if (!currentBook || !allBooks?.length) return [];
  
  const currentTags = extractDynamicTagsFromBook(currentBook);
  const scoredBooks = [];
  
  allBooks.forEach(book => {
    if (book.id === currentBook.id) return;
    
    const bookTags = extractDynamicTagsFromBook(book);
    let score = 0;
    
    currentTags.forEach(currentTag => {
      if (bookTags.some(bookTag => 
        bookTag.toLowerCase().includes(currentTag.toLowerCase()) ||
        currentTag.toLowerCase().includes(bookTag.toLowerCase())
      )) {
        score++;
      }
    });
    
    if (score > 0) {
      scoredBooks.push({ book, score });
    }
  });
  
  return scoredBooks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.book);
};