// Generates a STATIC sitemap.xml into public/, served as a plain file.
//
// This replaces a dynamic app/sitemap.js route. That route was declared
// `force-dynamic`, which meant every crawler fetch of /sitemap.xml re-ran a
// 40,000-row scan of the books table plus full reads of authors, publications
// and comics — against a free-tier budget of 5,000,000 row reads per day.
// Nothing on the site triggered it; crawlers did, on their own schedule.
// Serving a static file costs zero queries, zero rows and zero worker CPU no
// matter how often it is fetched.
//
// Run it before deploying, whenever the catalog has grown enough to matter:
//
//   npm run sitemap        (then commit the generated public/sitemap.xml)
//
// It reads the catalog through `wrangler d1 execute --remote`, so it needs
// wrangler auth — the same credentials a deploy already uses. It runs on your
// machine at deploy time rather than in the Worker at request time, which is
// the whole point: the cost is paid once by you, not repeatedly by every bot.

import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.bookqubit.com").replace(/\/$/, "");
const OUT = join(ROOT, "public", "sitemap.xml");

// One query per table rather than one per row. Only the columns that actually
// appear in the output are selected, so this stays cheap even as the catalog
// grows: the whole generation reads each table once.
const QUERIES = {
  books: "SELECT slug, created_at FROM books WHERE lang='en' ORDER BY id",
  authors: "SELECT slug FROM authors WHERE lang='en' ORDER BY id",
  publications: "SELECT slug FROM publications WHERE lang='en' ORDER BY id",
  comics: "SELECT slug FROM comics WHERE lang='en' ORDER BY id",
};

function query(sql) {
  // --command, not --file: --file reports a summary ("Total queries executed",
  // "Rows read") instead of returning the selected rows, so it silently yields
  // one meaningless row per query rather than the catalog.
  //
  // The statement is wrapped in double quotes for the shell. Every query here
  // quotes its literals with single quotes, so there is nothing inside needing
  // escaping — asserted below rather than left as an assumption, because an
  // unnoticed quote would truncate the SQL and produce a partial sitemap.
  if (sql.includes('"')) throw new Error(`Query must not contain double quotes: ${sql}`);
  const raw = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "catalog", "--remote", "--json", "--command", `"${sql}"`],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, shell: true }
  );
  // Strip ANSI colour codes first: their escape sequences contain "[", which
  // otherwise anchors the JSON search to the wrong place.
  const clean = raw.replace(/\x1b\[[0-9;]*m/g, "");
  const start = clean.indexOf("[");
  if (start === -1) throw new Error(`Unexpected wrangler output:\n${clean.slice(-800)}`);
  const parsed = JSON.parse(clean.slice(start));
  const rows = parsed[0]?.results;
  if (!Array.isArray(rows)) throw new Error(`No result rows returned for: ${sql}`);
  return rows;
}

// XML text escaping. Slugs are generated from titles and do contain
// ampersands and quotes in practice; an unescaped one makes the entire
// sitemap unparseable, which fails silently in search consoles.
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]
  );

const url = (loc, { lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

// D1 stores "YYYY-MM-DD HH:MM:SS" (implicitly UTC, no zone marker).
// <lastmod> wants a valid W3C date; the date part alone is valid and is what
// tells a crawler whether a page is worth re-fetching.
const lastmodOf = (createdAt) =>
  typeof createdAt === "string" && createdAt.length >= 10 ? createdAt.slice(0, 10) : undefined;

const CORE = ["", "/books", "/authors", "/publications", "/comics", "/collections", "/categories", "/tags", "/compare"];
const SECONDARY = ["/community", "/leaderboard", "/about", "/contact", "/privacy", "/terms"];

function main() {
  const data = Object.fromEntries(
    Object.entries(QUERIES).map(([name, sql]) => {
      const rows = query(sql);
      console.log(`  ${name}: ${rows.length}`);
      return [name, rows];
    })
  );

  const entries = [
    ...CORE.map((p) => url(`${BASE}${p}`, { changefreq: "weekly", priority: p === "" ? "1.0" : "0.8" })),
    ...SECONDARY.map((p) => url(`${BASE}${p}`, { changefreq: "monthly", priority: "0.4" })),
    ...data.books.map((b) =>
      url(`${BASE}/books/${b.slug}`, {
        lastmod: lastmodOf(b.created_at),
        changefreq: "weekly",
        priority: "0.9",
      })
    ),
    ...data.authors.map((a) => url(`${BASE}/authors/${a.slug}`, { changefreq: "monthly", priority: "0.7" })),
    ...data.publications.map((p) => url(`${BASE}/publications/${p.slug}`, { changefreq: "monthly", priority: "0.6" })),
    ...data.comics.map((c) => url(`${BASE}/comics/${c.slug}`, { changefreq: "monthly", priority: "0.7" })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  // Refuse to write a suspiciously small sitemap. A partial one is worse than
  // none at all: it doesn't just omit pages, it actively tells search engines
  // the site consists of only those URLs, and they drop the rest from the
  // index. This guard exists because an earlier run of this script silently
  // produced 19 URLs instead of ~14,000 — the query returned a summary rather
  // than rows, and nothing about the output looked wrong.
  const MIN_BOOKS = 100;
  if (data.books.length < MIN_BOOKS) {
    console.error(
      `\nREFUSING TO WRITE: only ${data.books.length} books returned (expected >= ${MIN_BOOKS}).\n` +
        "The catalog query failed or was truncated — check the D1 output above.\n" +
        "The existing sitemap.xml has been left untouched."
    );
    process.exit(1);
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, xml, "utf8");

  // Google's per-file limits are 50,000 URLs and 50MB uncompressed. Warn
  // rather than fail: an oversized sitemap is still partially honoured, but
  // it needs splitting into an index before it silently truncates.
  const bytes = Buffer.byteLength(xml);
  console.log(`\nWrote ${OUT}`);
  console.log(`  ${entries.length} URLs, ${(bytes / 1024 / 1024).toFixed(2)} MB, base ${BASE}`);
  if (entries.length > 45000 || bytes > 45 * 1024 * 1024) {
    console.warn("  WARNING: approaching Google's 50,000-URL / 50MB limit — time to shard into a sitemap index.");
  }
}

main();
