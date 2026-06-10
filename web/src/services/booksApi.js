const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

const buildUrl = (path, params = {}) => {
  const url = new URL(`${getBaseUrl()}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const fetchBooks = async (params = {}) => {
  const response = await fetch(buildUrl("/api/books", params), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to load books");
  }

  const payload = await response.json();
  return {
    books: payload.books || [],
    pagination: payload.pagination || { page: 1, limit: 0, total: 0 },
  };
};

export const fetchBookBySlug = async (slug, lang = "en") => {
  if (!slug) return null;

  const response = await fetch(buildUrl(`/api/books/${slug}`, { lang }), {
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Unable to load book");
  }

  const payload = await response.json();
  return payload.book || null;
};
