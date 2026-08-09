import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Makes env.DB / env.CACHE bindings available in plain `next dev` too.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    // Client-side Router Cache: once a page (book detail, author, listing,
    // etc.) has been visited, the browser holds onto its rendered payload
    // for this long — revisiting it (back button, a repeat link click,
    // browsing away and returning) shows the cached version instantly with
    // zero server round-trip, instead of re-fetching from D1 every time.
    // 6 hours, matching the "load once, stay cached while the visitor is
    // still around, then quietly go stale" behavior asked for — a visit
    // past that window (or a genuinely new page) fetches fresh again.
    staleTimes: { dynamic: 21600, static: 21600 },
  },
};

export default nextConfig;



