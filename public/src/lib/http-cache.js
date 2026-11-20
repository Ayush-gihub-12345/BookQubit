// Shared-cache headers for public, read-only JSON (the same answer for every visitor). The Cloudflare edge keeps the
// response for `seconds`, then serves it stale for `swr` more seconds while one request refreshes it, so a burst of
// identical requests costs one origin hit (and at most one D1 read, behind the in-app cache) instead of one each.
// Never use this for anything that depends on who is asking.
export const publicCache = (seconds = 60, swr = 600) => ({ "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${swr}` });
export const PUBLIC_SHORT = publicCache(60, 600);
export const PUBLIC_LONG = publicCache(300, 3600);
