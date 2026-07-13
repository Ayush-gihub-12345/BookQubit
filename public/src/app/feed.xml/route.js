import { getRecentlyAdded } from "@/lib/repo";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";

const escapeXml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// GET /feed.xml — RSS 2.0 feed of the most recently added books, for feed
// readers and other external integrations.
export async function GET() {
  const books = await getRecentlyAdded("en", 30);

  const items = books.map((b) => `
    <item>
      <title>${escapeXml(b.title)}</title>
      <link>${BASE}/books/${encodeURIComponent(b.slug)}</link>
      <guid>${BASE}/books/${encodeURIComponent(b.slug)}</guid>
      <description>${escapeXml(b.description?.slice(0, 300) || `${b.title} by ${b.author || "Unknown"}`)}</description>
      <pubDate>${new Date(b.created_at || Date.now()).toUTCString()}</pubDate>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BookQubit — New Releases</title>
    <link>${BASE}</link>
    <description>Freshly added books on BookQubit — summaries, key insights, and reader reviews.</description>
    <language>en</language>${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
