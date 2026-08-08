"use client";

// Browser-side (localStorage) read-through cache for client-driven fetch()
// calls — search suggestions, filter/sort clicks — that Next's Router Cache
// doesn't cover (that one only caches whole-page navigations, not raw fetch
// calls a client component makes to an API route). Same idea, smaller scope:
// load once, serve from the browser instantly on a repeat, go stale after a
// while so real changes (new books, new discussions) still surface.
const PREFIX = "bq:cache:";

export function readLocalCache(key, maxAgeMs) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { value, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > maxAgeMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return value;
  } catch {
    return null; // corrupted entry or storage unavailable — just miss
  }
}

export function writeLocalCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    /* storage full/disabled (private browsing etc.) — never let caching
       itself break the page, just skip it silently */
  }
}
