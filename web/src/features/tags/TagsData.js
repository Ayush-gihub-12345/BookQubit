// d:/Projects/done/bookqubit_done/web/src/features/tags/TagsData.js
"use client";

import { getBooksByLanguage } from "@/data/books";

// Get all tags from books
export const getAllTags = (books) => {
  const tagsMap = new Map();
  
  books.forEach(book => {
    if (book.tags && Array.isArray(book.tags)) {
      book.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        if (tagsMap.has(normalizedTag)) {
          tagsMap.set(normalizedTag, {
            name: tag,
            slug: generateTagSlug(tag),
            count: tagsMap.get(normalizedTag).count + 1,
            books: [...tagsMap.get(normalizedTag).books, book]
          });
        } else {
          tagsMap.set(normalizedTag, {
            name: tag,
            slug: generateTagSlug(tag),
            count: 1,
            books: [book]
          });
        }
      });
    }
  });
  
  return Array.from(tagsMap.values()).sort((a, b) => b.count - a.count);
};

// Get books by specific tag
export const getBooksByTag = (books, tagName) => {
  const normalizedSearchTag = tagName.toLowerCase().trim();
  return books.filter(book => 
    book.tags && book.tags.some(tag => 
      tag.toLowerCase().trim() === normalizedSearchTag
    )
  );
};

// Generate slug from tag name
export const generateTagSlug = (tagName) => {
  return tagName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get related tags (tags that appear together frequently)
export const getRelatedTags = (books, currentTag, limit = 8) => {
  const relatedTagsMap = new Map();
  const normalizedCurrentTag = currentTag.toLowerCase().trim();
  
  books.forEach(book => {
    if (book.tags && book.tags.some(tag => tag.toLowerCase().trim() === normalizedCurrentTag)) {
      book.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        if (normalizedTag !== normalizedCurrentTag) {
          if (relatedTagsMap.has(normalizedTag)) {
            relatedTagsMap.set(normalizedTag, {
              name: tag,
              slug: generateTagSlug(tag),
              count: relatedTagsMap.get(normalizedTag).count + 1
            });
          } else {
            relatedTagsMap.set(normalizedTag, {
              name: tag,
              slug: generateTagSlug(tag),
              count: 1
            });
          }
        }
      });
    }
  });
  
  return Array.from(relatedTagsMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Get popular tags
export const getPopularTags = (books, limit = 20) => {
  const allTags = getAllTags(books);
  return allTags.slice(0, limit);
};

// Search tags by query
export const searchTags = (books, query, limit = 10) => {
  if (!query || !query.trim()) return [];
  
  const searchLower = query.toLowerCase().trim();
  const allTags = getAllTags(books);
  
  return allTags
    .filter(tag => tag.name.toLowerCase().includes(searchLower))
    .slice(0, limit);
};

// Get tag count
export const getTagCount = (books, tagName) => {
  const normalizedTag = tagName.toLowerCase().trim();
  let count = 0;
  
  books.forEach(book => {
    if (book.tags && book.tags.some(tag => tag.toLowerCase().trim() === normalizedTag)) {
      count++;
    }
  });
  
  return count;
};

// Check if book has tag
export const bookHasTag = (book, tagName) => {
  if (!book.tags) return false;
  const normalizedTag = tagName.toLowerCase().trim();
  return book.tags.some(tag => tag.toLowerCase().trim() === normalizedTag);
};

// Get tags by first letter
export const getTagsByLetter = (books, letter) => {
  const allTags = getAllTags(books);
  if (letter === 'all') return allTags;
  
  return allTags.filter(tag => 
    tag.name.charAt(0).toLowerCase() === letter.toLowerCase()
  );
};

// Get tag suggestions for autocomplete
export const getTagSuggestions = (books, input, limit = 5) => {
  if (!input || !input.trim()) return [];
  
  const searchLower = input.toLowerCase().trim();
  const allTags = getAllTags(books);
  
  return allTags
    .filter(tag => tag.name.toLowerCase().includes(searchLower))
    .slice(0, limit)
    .map(tag => ({
      name: tag.name,
      slug: tag.slug,
      count: tag.count
    }));
};