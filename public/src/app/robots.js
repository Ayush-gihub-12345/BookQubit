import { SITE_URL } from "@/lib/site";
const BASE = SITE_URL;

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
  // Amazon's crawler. Measured live via `wrangler tail`: 10 of 13 requests in
  // one 16-second window — roughly 48 requests/minute, on the order of 70,000
  // a day, against a catalog whose entire free-tier budget is 5 million row
  // reads. It was the single largest source of load on the site and the main
  // reason the daily quota kept being exhausted with no human visitors.
  // Blocking it does not affect Amazon affiliate links, which are ordinary
  // outbound links and involve no crawling of this site. Remove it from this
  // list if that trade ever stops making sense.
  "Amzn-SearchBot",
];

// Faceted/filtered URLs. Every combination of tag, category, sort and page is
// a distinct URL running its own filtered query, so the crawlable space is
// effectively unbounded — a crawler can walk it forever and never finish.
// Observed live: `/books?tag=Hercule%20Poirot%20(Fictitious...`,
// `/books?tag=Adoptees`, and so on, each one a fresh database query.
//
// Blocking these costs nothing in discoverability: every book, author,
// publisher and comic already has its own canonical URL listed individually
// in sitemap.xml, so search engines reach all the real content directly
// without needing to crawl filter permutations to find it.
const FACETED = ["/books?*", "/comics?*", "/authors?*", "/publications?*", "/collections?*"];

// Deliberate, temporary policy: organic crawling is limited to book pages
// for now. The core hub pages (/, /books, /about, etc.) are being submitted
// directly via Search Console instead of relying on crawl-discovery, so they
// stay allowed here — a disallowed URL can't be indexed even via manual
// submission, since Google still has to crawl it either way. What's blocked
// is the LONG-TAIL: individual author/publisher/collection/comic/reader
// pages, which don't carry the same buyer intent as a book page and are
// exactly what was driving the heaviest aggregate queries when crawled at
// volume (listAuthors' full-table scan, category/tag facet computation).
// Revisit once caching is proven to hold under sustained real crawl load —
// book pages are unrestricted precisely because that's the content worth
// showing up in search for.
const LONG_TAIL_DETAIL_PAGES = [
  "/authors/*", "/publications/*", "/collections/*", "/comics/*", "/readers/*",
];

export default function robots() {
  return {
    rules: [
      // Real search engines — full access (minus private areas), since these
      // are the ones that actually drive discovery and rankings.
      { userAgent: "*", allow: "/", disallow: [...PRIVATE, ...FACETED, ...LONG_TAIL_DETAIL_PAGES], crawlDelay: 10 },
      // Everything above gets shut out entirely.
      ...SEO_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
