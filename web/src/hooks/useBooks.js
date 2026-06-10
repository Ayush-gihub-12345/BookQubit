"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchBookBySlug, fetchBooks } from '@/services/booksApi';

export const useBooks = () => {
  const { language } = useLanguage();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBooks = async () => {
      setLoading(true);

      try {
        const result = await fetchBooks({ lang: language, limit: 500 });
        if (isMounted) setBooks(result.books || []);
      } catch (error) {
        console.error('Failed to load books:', error);
        if (isMounted) setBooks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, [language]);

  return { books, loading, language };
};

export const useBook = (slug) => {
  const { language } = useLanguage();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBook = async () => {
      setLoading(true);

      try {
        const bookData = await fetchBookBySlug(slug, language);
        if (isMounted) setBook(bookData);
      } catch (error) {
        console.error('Failed to load book:', error);
        if (isMounted) setBook(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBook();

    return () => {
      isMounted = false;
    };
  }, [slug, language]);

  return { book, loading, language };
};
