// Tag extraction logic
"use client";

export const extractDynamicTagsFromBook = (book) => {
  if (!book) return [];

  const tags = new Set();

  // From tags field
  if (book.tags?.length) {
    book.tags.forEach(tag => tag && tags.add(tag.trim()));
  }

  // From subjects field
  if (book.subjects?.length) {
    book.subjects.forEach(subject => subject && tags.add(subject.trim()));
  }

  // From genres field
  if (book.genres?.length) {
    book.genres.forEach(genre => genre && tags.add(genre.trim()));
  }

  // From keyPoints field
  if (book.keyPoints?.length) {
    book.keyPoints.forEach(point => point && tags.add(point.trim()));
  }

  // From category
  if (book.category) {
    tags.add(book.category.trim());
    if (book.category.includes(" & ")) {
      book.category.split(" & ").forEach(cat => tags.add(cat.trim()));
    }
    if (book.category.includes(" / ")) {
      book.category.split(" / ").forEach(cat => tags.add(cat.trim()));
    }
  }

  // From author
  if (book.author) {
    tags.add(book.author.trim());
    tags.add(`${book.author.trim()} Books`);
    const authorParts = book.author.split(" ");
    if (authorParts.length > 1) {
      tags.add(authorParts[authorParts.length - 1]);
    }
  }

  // From geography
  if (book.geography) {
    if (book.geography.country) tags.add(book.geography.country);
    if (book.geography.continent) tags.add(book.geography.continent);
    if (book.geography.subRegion) tags.add(book.geography.subRegion);
  }

  // From published year
  if (book.published) {
    const year = parseInt(book.published);
    if (!isNaN(year)) {
      tags.add(`${Math.floor(year / 10) * 10}s`);
      tags.add(`${Math.ceil(year / 100)}th Century`);
      if (year < 1900) tags.add("Classic");
      if (year >= 2000) tags.add("Modern");
    }
  }

  // From language
  if (book.language) {
    tags.add(book.language);
  }

  // From rating
  if (book.rating) {
    if (book.rating >= 4.5) tags.add("Highly Rated");
    else if (book.rating >= 4.0) tags.add("Popular");
  }

  // From page count
  if (book.pageCount) {
    if (book.pageCount < 100) tags.add("Short Read");
    else if (book.pageCount > 500) tags.add("Long Read");
  }

  return Array.from(tags).filter(tag => tag?.trim());
};