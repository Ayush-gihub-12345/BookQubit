// The site's canonical origin — the single source of truth for every absolute
// URL the app emits: sitemap entries, RSS links, Open Graph tags, canonical
// tags and robots.txt.
//
// Centralized because it was previously repeated as a literal in seven files.
// A domain move meant finding and editing all of them, and missing one meant
// emitting URLs on the old domain into search results — which is exactly the
// kind of error nobody notices until rankings drop.
//
// NEXT_PUBLIC_BASE_URL still overrides it (useful for a staging deployment),
// but the default here is deliberately the real production domain so that a
// build with no environment configured is still correct rather than silently
// pointing somewhere stale.
//
// Note this is inlined at BUILD time, not read at runtime — changing it
// requires a rebuild and redeploy, not just a variable change.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.bookqubit.com"
).replace(/\/$/, "");

// Bare hostname, for anywhere that needs it without the scheme.
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
