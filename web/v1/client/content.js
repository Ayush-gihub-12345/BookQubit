"use client";

import { useEffect, useState } from "react";

const EMPTY = [];

async function fetchContent(path, params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  const response = await fetch(`${path}${query ? `?${query}` : ""}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || `Failed to load ${path}`);
  }

  return payload?.data ?? EMPTY;
}

export function useD1List(path, params = {}) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    fetchContent(path, params)
      .then((items) => {
        if (active) setData(Array.isArray(items) ? items : items ? [items] : EMPTY);
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setData(EMPTY);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path, JSON.stringify(params)]);

  return { data, loading, error };
}

export function useD1Books(language, params = {}) {
  return useD1List("/api/v1/books", { lang: language || "en", ...params });
}

export function useD1Authors(params = {}) {
  return useD1List("/api/v1/authors", params);
}

export function useD1Publications(params = {}) {
  return useD1List("/api/v1/publications", params);
}

export function useD1Comics(language, params = {}) {
  return useD1List("/api/v1/comics", { lang: language || "en", ...params });
}
