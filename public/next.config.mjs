import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Makes env.DB / env.CACHE bindings available in plain `next dev` too.
//
// BQ_LOCAL_D1=1 swaps Cloudflare's local runtime (workerd, which will not
// start on a machine missing the Visual C++ runtime) for a Node-SQLite
// stand-in. Dev only — see scripts/local-d1.mjs. Unset, this is exactly the
// original behaviour.
if (process.env.BQ_LOCAL_D1 === "1") {
  const { installLocalCloudflareContext } = await import("./scripts/local-d1.mjs");
  installLocalCloudflareContext();
} else {
  initOpenNextCloudflareForDev();
}

// Response headers for every page and API response served by the Worker.
//
// They live here and not in public/_headers on purpose: _headers is applied
// by Workers Assets to *static asset* responses only, so it never touches the
// HTML and JSON the OpenNext Worker renders — which is everything that
// matters. (_headers keeps its one job: long-term caching of /_next/static.)
//
// Deliberately NOT included yet: a Content-Security-Policy that restricts
// scripts. This site loads Google Tag Manager, Firebase Auth (including its
// sign-in popup/iframe hosts) and Next's own inline bootstrap scripts, and
// a policy that is wrong breaks sign-in with nothing in the build to catch
// it. It needs to be introduced as Content-Security-Policy-Report-Only and
// tuned against a running app first. `frame-ancestors` has none of those
// dependencies, so it ships now.
const securityHeaders = [
  // Once a browser has seen the site over HTTPS it will refuse plain HTTP
  // for a year. No includeSubDomains/preload: those are one-way doors and
  // nothing here establishes that every subdomain is HTTPS-only.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Sends the origin only (no path/query) to other sites, so a reader's
  // profile or shelf URL is not leaked in Referer to outbound links such as
  // the Amazon buy button.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nobody may frame the site (clickjacking). frame-ancestors is the modern
  // control; X-Frame-Options is the fallback for older browsers.
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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



