import { listBooks, listAuthors, listPublications, listComics } from "@/lib/repo";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";

export default async function sitemap() {
  const [books, authors, pubs, comics] = await Promise.all([
    listBooks("en"), listAuthors("en"), listPublications("en"), listComics("en"),
  ]).catch(() => [[], [], [], []]);

  const core = ["", "/books", "/authors", "/publications", "/comics", "/collections", "/categories", "/tags"];
  const secondary = ["/community", "/leaderboard", "/about", "/contact", "/privacy", "/terms"];
  const staticPages = [
    ...core.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.8 })),
    ...secondary.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "monthly", priority: 0.4 })),
  ];

  return [
    ...staticPages,
    ...books.map((b) => ({ url: `${BASE}/books/${b.slug}`, changeFrequency: "weekly", priority: 0.9 })),
    ...authors.map((a) => ({ url: `${BASE}/authors/${a.slug}`, changeFrequency: "monthly", priority: 0.7 })),
    ...pubs.map((p) => ({ url: `${BASE}/publications/${p.slug}`, changeFrequency: "monthly", priority: 0.6 })),
    ...comics.map((c) => ({ url: `${BASE}/comics/${c.slug}`, changeFrequency: "monthly", priority: 0.7 })),
  ];
}
