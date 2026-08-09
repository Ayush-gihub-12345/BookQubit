const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://www.bookqubit.shop";

// Private/auth-only areas — never useful in a search index.
const PRIVATE = ["/account", "/login", "/admin", "/liked"];

// Commercial SEO-analytics crawlers (backlink/keyword databases). These are
// NOT search engines — blocking them costs zero Google/Bing ranking, they
// only feed third-party paid SEO tools. Verified live via `wrangler tail`
// that they were 100% of production traffic (8/8 requests in a 90s sample,
// zero human visitors), crawling every /books/[slug] and /authors/[slug]
// page in the catalog. With ~5,000 books each getting its own page, a single
// full crawl pass is thousands of dynamic renders — which is what was
// burning through D1's free-tier read quota (677k rows in 6 minutes) and
// tripping Cloudflare's Error 1102 resource limit mid-Lighthouse-audit.
const SEO_CRAWLERS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "Barkrowler",
  "SeekportBot",
  "ZoominfoBot",
  "magpie-crawler",
  "serpstatbot",
];

export default function robots() {
  return {
    rules: [
      // Real search engines — full access (minus private areas), since these
      // are the ones that actually drive discovery and rankings.
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Everything above gets shut out entirely.
      ...SEO_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
