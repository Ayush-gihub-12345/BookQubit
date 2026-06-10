"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBooksByLanguage, getBookBySlug } from '@/data/books';

export const useBooks = () => {
  const { language } = useLanguage();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = () => {
      const booksData = getBooksByLanguage(language);
      setBooks(booksData);
      setLoading(false);
    };

    loadBooks();
  }, [language]);

  return { books, loading, language };
};

export const useBook = (slug) => {
  const { language } = useLanguage();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = () => {
      const bookData = getBookBySlug(slug, language);
      setBook(bookData);
      setLoading(false);
    };

    loadBook();
  }, [slug, language]);

  return { book, loading, language };
};