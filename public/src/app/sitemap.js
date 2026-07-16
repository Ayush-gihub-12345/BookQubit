import { getBookSlugsPage, listAuthors, listPublications, listComics, getComparisonSuggestions } from "@/lib/repo";

// Without this, Next.js can statically freeze this route at build time
// (since nothing here uses fetch(), which is what its default caching
// heuristics look for) — meaning newly imported books would never appear
// in the sitemap until the next deploy, no matter how often the cron
// worker adds to the catalog. Forcing dynamic means every crawl gets a
// live query straight from D1 — getBookSlugsPage() itself isn't cached at
// all, so new books show up on the very next crawl, not on some fixed
// interval.
export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";

// Deliberately NOT using Next.js's generateSitemaps() multi-file sharding
// here — verified live that this deployment (OpenNext on Cloudflare
// Workers) serves the individual shards fine (/sitemap/0.xml -> 200) but
// 404s on the master /sitemap.xml index that Search Console and crawlers
// actually request. A single sitemap.js with a plain default export maps
// directly and reliably to /sitemap.xml instead. Google's 50k-URL-per-file
// cap only matters once the catalog is orders of magnitude bigger than it
// is now — worth revisiting sharding then, on whatever platform this is on
// by that point.
export default async function sitemap() {
  const [slugs, authors, pubs, comics, comparisons] = await Promise.all([
    getBookSlugsPage("en", { page: 1, perPage: 40000 }),
    listAuthors("en"),
    listPublications("en"),
    listComics("en"),
    getComparisonSuggestions("en", 8),
  ]).catch(() => [[], [], [], [], []]);

  const core = ["", "/books", "/authors", "/publications", "/comics", "/collections", "/categories", "/tags", "/compare"];
  const secondary = ["/community", "/leaderboard", "/about", "/contact", "/privacy", "/terms"];
  const staticPages = [
    ...core.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 })),
    ...secondary.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "monthly", priority: 0.4 })),
  ];

  return [
    ...staticPages,
    ...slugs.map((slug) => ({ url: `${BASE}/books/${slug}`, changeFrequency: "weekly", priority: 0.9 })),
    ...authors.map((a) => ({ url: `${BASE}/authors/${a.slug}`, changeFrequency: "monthly", priority: 0.7 })),
    ...pubs.map((p) => ({ url: `${BASE}/publications/${p.slug}`, changeFrequency: "monthly", priority: 0.6 })),
    ...comics.map((c) => ({ url: `${BASE}/comics/${c.slug}`, changeFrequency: "monthly", priority: 0.7 })),
    // Curated comparison pages ("X vs Y") — real long-tail queries people
    // type, submitted directly rather than relying only on internal links
    // from the /compare landing page to eventually get crawled.
    ...comparisons.map((c) => ({ url: `${BASE}/compare/${c.slug}`, changeFrequency: "monthly", priority: 0.6 })),
  ];
}
