"use client";

import { useEffect, useState } from "react";

export const useComicDetails = (slug, language) => {
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const decodedSlug = decodeURIComponent(slug || "");

    async function loadComic() {
      if (!decodedSlug) {
        setComic(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/comics?lang=${language || "en"}&slug=${encodeURIComponent(decodedSlug)}`);
        const payload = await response.json();
        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error || "Failed to load comic");
        }
        if (active) setComic(payload?.data || null);
      } catch (err) {
        if (active) {
          setError(err);
          setComic(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadComic();

    return () => {
      active = false;
    };
  }, [slug, language]);

  return { comic, loading, error };
};
