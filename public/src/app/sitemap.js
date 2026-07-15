import { getBookSlugsPage, listAuthors, listPublications, listComics, getPlatformStats, getComparisonSuggestions } from "@/lib/repo";

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
// Google caps a single sitemap file at 50k URLs — this stays comfortably
// under that no matter how large the catalog gets, by splitting into
// multiple sitemap files (shard 0 also carries the static/author/publisher/
// comic pages, since those don't need their own shard at any realistic scale).
const PER_SHARD = 40000;

export async function generateSitemaps() {
  const stats = await getPlatformStats();
  const shardCount = Math.max(1, Math.ceil(stats.books / PER_SHARD));
  return Array.from({ length: shardCount }, (_, id) => ({ id }));
}

export default async function sitemap({ id }) {
  const slugs = await getBookSlugsPage("en", { page: id + 1, perPage: PER_SHARD });
  const bookUrls = slugs.map((slug) => ({ url: `${BASE}/books/${slug}`, changeFrequency: "weekly", priority: 0.9 }));

  if (id !== 0) return bookUrls;

  // Static + author/publisher/comic pages only need to appear once, in the
  // first shard — they don't scale with the book count.
  const [authors, pubs, comics, comparisons] = await Promise.all([
    listAuthors("en"), listPublications("en"), listComics("en"), getComparisonSuggestions("en", 8),
  ]).catch(() => [[], [], [], []]);

  const core = ["", "/books", "/authors", "/publications", "/comics", "/collections", "/categories", "/tags", "/compare"];
  const secondary = ["/community", "/leaderboard", "/about", "/contact", "/privacy", "/terms"];
  const staticPages = [
    ...core.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 })),
    ...secondary.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "monthly", priority: 0.4 })),
  ];

  return [
    ...staticPages,
    ...bookUrls,
    ...authors.map((a) => ({ url: `${BASE}/authors/${a.slug}`, changeFrequency: "monthly", priority: 0.7 })),
    ...pubs.map((p) => ({ url: `${BASE}/publications/${p.slug}`, changeFrequency: "monthly", priority: 0.6 })),
    ...comics.map((c) => ({ url: `${BASE}/comics/${c.slug}`, changeFrequency: "monthly", priority: 0.7 })),
    // Curated comparison pages ("X vs Y") — real long-tail queries people
    // type, submitted directly rather than relying only on internal links
    // from the /compare landing page to eventually get crawled.
    ...comparisons.map((c) => ({ url: `${BASE}/compare/${c.slug}`, changeFrequency: "monthly", priority: 0.6 })),
  ];
}
