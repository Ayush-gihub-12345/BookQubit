import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Makes env.DB / env.CACHE bindings available in plain `next dev` too.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    // Client-side Router Cache: once a page has been visited, the browser
    // reuses its rendered payload for this long instead of re-fetching.
    //
    // This was 6 HOURS (21600) and that was a mistake. The Router Cache has
    // no concept of "this render failed" — when a transient server error
    // produced an error-boundary payload, the browser pinned that broken
    // result for six hours and kept re-showing it long after the server had
    // recovered. That is exactly how a brief blip turned into "the site is
    // still broken for me" while every server-side check came back clean.
    //
    // Six hours also meant a reader couldn't see newly imported books for
    // six hours. 5 minutes keeps back/forward navigation instant (the real
    // benefit) while capping how long any bad or stale payload can survive.
    staleTimes: { dynamic: 300, static: 600 },
  },
};

export default nextConfig;



