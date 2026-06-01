"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useBooks = () => {
  const { language } = useLanguage();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/books?lang=${language}&limit=200`);
        const payload = await response.json();
        if (active) setBooks(payload?.data || []);
      } catch (error) {
        console.error('Failed to load books from D1:', error);
        if (active) setBooks([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBooks();
    return () => {
      active = false;
    };
  }, [language]);

  return { books, loading, language };
};

export const useBook = (slug) => {
  const { language } = useLanguage();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBook = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/books?lang=${language}&slug=${encodeURIComponent(slug || '')}`);
        const payload = await response.json();
        if (active) setBook(payload?.data || null);
      } catch (error) {
        console.error('Failed to load book from D1:', error);
        if (active) setBook(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBook();
    return () => {
      active = false;
    };
  }, [slug, language]);

  return { book, loading, language };
};
