"use client";

import { useMemo } from "react";
import { getComicsByLanguage } from "@/data/comics/index";

export const useComicDetails = (slug, language) => {
  const comicsData = useMemo(() => {
    return getComicsByLanguage(language);
  }, [language]);

  const comic = useMemo(() => {
    if (!slug || !comicsData?.length) return null;
    const decodedSlug = decodeURIComponent(slug);
    return comicsData.find((c) => c.slug === decodedSlug);
  }, [slug, comicsData]);

  const loading = false; // Implement actual loading state if needed
  const error = null; // Implement error handling if needed

  return { comic, loading, error };
};