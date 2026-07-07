"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useBooks = () => {
  const { language } = useLanguage();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/books?lang=${language}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setBooks(data.books || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  return { books, loading, language };
};

export const useBook = (slug) => {
  const { language } = useLanguage();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setBook(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/books/${encodeURIComponent(slug)}?lang=${language}`)
      .then((res) => (res.ok ? res.json() : { book: null }))
      .then((data) => {
        if (!cancelled) setBook(data.book || null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, language]);

  return { book, loading, language };
};
