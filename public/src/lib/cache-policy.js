// Cache policy: one place that says how long things live and what they belong to.
//
// Layers (see db.js): isolate memory -> edge Cache API (per colo) -> Workers KV (global) -> D1 `app_cache` -> source.
// The aim is moderate, predictable caching, not maximum caching:
//   * TTLs are short enough that new imports and edits show up within minutes, not hours;
//   * a stale copy is only served INSTANTLY for a short window past expiry (refreshing behind the response);
//     beyond that the page refreshes first, and the old copy is used only if the refresh fails (stale-if-error);
//   * related keys are grouped so one action (an admin edit, or "clear caches") invalidates a whole area
//     everywhere at once, instead of deleting keys one by one.

/** Named lifetimes in seconds. Call sites use these instead of bare numbers. */
export const TTL = {
  short: 60, // counters and anything that should feel live
  lists: 300, // home/browse shelves, featured, new releases, per-book rows
  static: 3600, // facets, author/publisher/tag indexes: slow-changing lookups (was 3 h)
};

/** The longest a failed refresh may fall back to an old copy (protects against D1 quota walls and outages). */
export const STALE_IF_ERROR_SECONDS = 86400;

/**
 * How far past expiry a copy may still be served immediately while a refresh runs in the background.
 * At least 10 minutes, at most twice the TTL: busy keys never visibly lag, idle keys don't serve day-old pages.
 */
export const swrWindowSeconds = (ttl) => Math.max(600, ttl * 2);

// Key prefix -> group. A group is invalidated as a unit (see cache-versions.js).
const GROUPS = [
  ["catalog", /^(book-row|book-row-fallback|book-bounds|book-slugs|alternates|recent-added|featured|featured-authors|author-profiles|coauthors|authors-page|author-countries|author-by-name|similar|editions|series-of|series-page|featured-publishers|collection-covers|bestsellers|facets|authors-with-books|author-book-index|publisher-book-index|tag-book-index|format-book-index|books-by-author|books-by-publisher|rows|platform):/],
  ["community", /^(community|popular-readers|leaderboard):/],
  ["feed", /^feed:/],
  ["search", /^search:/],
  ["settings", /^site:/],
  ["spaces", /^ms-public:/],
];
export const CACHE_GROUPS = GROUPS.map(([name]) => name);

/** Group of a cache key, or null when it isn't grouped (user-scoped keys never are). */
export function groupOf(key) {
  for (const [name, re] of GROUPS) if (re.test(key)) return name;
  return null;
}

/**
 * What to do with an entry found in a tier.
 *   "fresh"   within its lifetime: serve it.
 *   "swr"     expired recently: serve it now, refresh behind the response.
 *   "refresh" expired long ago: fetch first (fall back to the old copy only if that fails).
 * @param {{ exp: number }} hit   `exp` = logical expiry in ms
 */
export function freshness(hit, ttl, now = Date.now()) {
  if (now <= (hit.exp || 0)) return "fresh";
  const ageSeconds = (now - hit.exp) / 1000;
  return ageSeconds <= swrWindowSeconds(ttl) ? "swr" : "refresh";
}
