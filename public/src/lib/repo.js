import { getDb, getCatalogDb, cached, invalidate } from "./db";

const J = (v) => {
  try { return v ? JSON.parse(v) : []; } catch { return []; }
};

// `books`/`authors` live in a separate D1 database (catalog) from
// shelf/discussions/quotes/etc. (database), so anywhere that used to be a
// SQL JOIN across them is now: fetch the referencing rows, collect their
// slugs, batch-fetch the matching catalog rows here, and merge in JS.
// Chunked at 100 slugs/query (D1's max bound params per statement).
async function getCatalogRowsBySlug(table, slugs, lang, cols = "*") {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (!unique.length) return new Map();
  const db = await getCatalogDb();
  const chunks = [];
  for (let i = 0; i < unique.length; i += 100) chunks.push(unique.slice(i, i + 100));
  const results = await Promise.all(
    chunks.map((chunk) =>
      db.prepare(
        `SELECT ${cols} FROM ${table} WHERE lang=?1 AND slug IN (${chunk.map((_, i) => `?${i + 2}`).join(",")})`
      ).bind(lang, ...chunk).all()
    )
  );
  const map = new Map();
  for (const { results: rows } of results) for (const r of rows) map.set(r.slug, r);
  return map;
}
export const getBooksBySlug = (slugs, lang = "en", cols = "*") => getCatalogRowsBySlug("books", slugs, lang, cols);
export const getAuthorsBySlug = (slugs, lang = "en", cols = "*") => getCatalogRowsBySlug("authors", slugs, lang, cols);

function slugify(name) {
  const base = (name || "reader").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return base || "reader";
}

// Every authenticated write upserts the caller's user row through here —
// centralizes the pattern that used to be duplicated inline in ~7 API
// routes, and assigns a stable, readable public slug (name + a short id
// suffix for uniqueness) the first time a reader is ever seen. The slug is
// never overwritten once set, so /readers/[slug] links stay permanent even
// if the reader later renames their account; existing rows from before this
// column existed get backfilled with COALESCE on their next write.
export async function upsertUser(uid, name, photo) {
  const db = await getDb();
  const slug = `${slugify(name)}-${uid.slice(0, 6).toLowerCase()}`;
  await db.prepare(
    `INSERT INTO users (id, name, photo_url, slug) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(id) DO UPDATE SET name=?2, photo_url=?3, slug=COALESCE(slug, ?4)`
  ).bind(uid, name, photo || null, slug).run();
}

// `assocTag` comes from site_settings (admin-editable, takes effect
// immediately) rather than a build-time env var, so setting it once in the
// admin panel turns on affiliate tracking for every book without a redeploy.
// Books without a real Amazon ASIN/URL (e.g. bulk-imported ones) still get a
// working buy link via an Amazon search built from title+author — it just
// upgrades to a direct product link once a real amazon_asin is added later.
function mapBook(r, assocTag = "") {
  let buyUrl;
  if (r.amazon_asin) {
    buyUrl = `https://www.amazon.com/dp/${r.amazon_asin}${assocTag ? `?tag=${assocTag}` : ""}`;
  } else if (r.amazon_url) {
    buyUrl = assocTag ? `${r.amazon_url}${r.amazon_url.includes("?") ? "&" : "?"}tag=${assocTag}` : r.amazon_url;
  } else {
    const q = encodeURIComponent([r.title, r.author].filter(Boolean).join(" "));
    buyUrl = `https://www.amazon.com/s?k=${q}${assocTag ? `&tag=${assocTag}` : ""}`;
  }
  return {
    ...r,
    genres: J(r.genres),
    subjects: J(r.subjects),
    tags: J(r.tags),
    keyPoints: J(r.key_points),
    buyUrl,
  };
}

// Convenience wrapper around queryBooks() for callers that just want a plain
// array (not pagination metadata) — always SQL-bound via an explicit or
// default cap. Never loads more of the catalog than the caller asked for, no
// matter how large the books table gets.
export async function listBooks(lang, { category, collection, tag, q, sort, limit = 60 } = {}) {
  const { books } = await queryBooks(lang, { category, collection, tag, q, sort, perPage: limit, page: 1 });
  return books;
}

// SQL-level catalog query with real pagination — scales to very large catalogs
// (never loads the full table). Used by the /books browser.
export async function queryBooks(lang, opts = {}) {
  const { q, category, collection, tag, format, country, minRating, mood, sort, page = 1 } = opts;
  // Clamped regardless of caller — protects against an accidental (or
  // malicious) request for perPage=1000000 forcing a huge unbounded read.
  const perPage = Math.min(Math.max(1, Number(opts.perPage) || 32), 200);
  const db = await getCatalogDb();

  const where = ["lang = ?"];
  const binds = [lang];
  if (category) { where.push("category = ?"); binds.push(category); }
  if (collection) { where.push("collection = ?"); binds.push(collection); }
  if (format) { where.push("format LIKE ?"); binds.push(`%${format}%`); }
  if (country) { where.push("country = ?"); binds.push(country); }
  if (minRating) { where.push("rating >= ?"); binds.push(Number(minRating)); }
  if (tag) { where.push("tags LIKE ?"); binds.push(`%"${tag}"%`); }
  // Mood/pace come from what readers actually felt while reading (shelf.moods,
  // a different D1 database) — so this is resolved as two steps: find the
  // matching book_slugs there first, then filter the catalog query on them.
  if (mood) {
    const moodDb = await getDb();
    const { results: moodRows } = await moodDb
      .prepare("SELECT DISTINCT book_slug FROM shelf WHERE moods LIKE ?1 LIMIT 100")
      .bind(`%"${mood}"%`).all();
    const slugs = moodRows.map((r) => r.book_slug);
    if (!slugs.length) return { books: [], total: 0, page: Number(page), pages: 1 };
    where.push(`slug IN (${slugs.map((_, i) => `?${binds.length + i + 1}`).join(",")})`);
    binds.push(...slugs);
  }
  if (q) {
    where.push("(title LIKE ? OR author LIKE ? OR description LIKE ? OR category LIKE ? OR tags LIKE ?)");
    const like = `%${q}%`;
    binds.push(like, like, like, like, like);
  }

  const ORDER = {
    rating: "rating DESC NULLS LAST",
    // "Newest" reflects when a book was actually added to the catalog
    // (created_at), not its original publication year — a book published in
    // 1950 that we just added should still show up as new here.
    new: "created_at DESC, id DESC",
    title: "title COLLATE NOCASE ASC",
    default: "id ASC",
  };
  const orderBy = ORDER[sort] || ORDER.default;
  const wsql = where.join(" AND ");

  // This used to wrap everything in
  //   SELECT MIN(id) FROM books WHERE ... GROUP BY title, author
  // to collapse duplicate editions of the same work, and then used that
  // subquery TWICE per request (once for COUNT, once for `id IN (...)`).
  // A GROUP BY can't stop early, so both passes scanned every matching row.
  // Measured live on Cloudflare's D1 dashboard: this single query was 81%
  // of all database runtime — 24 calls reading 125,000 rows in two minutes,
  // from one person browsing.
  //
  // It was also unnecessary. The duplicates it defended against are a data
  // problem, and the data is now clean: import-time dedup (title+author vs
  // the titles DB) stops new ones, and the 23 stale rows that predated that
  // were deleted, verified 0 remaining out of 5,233. So the filtering is
  // now plain indexed WHERE clauses that stop at LIMIT.
  //
  // If duplicates ever reappear, fix them at the source (import dedup +
  // a cleanup pass) rather than reintroducing a full scan on every read.
  // No COUNT(*) anywhere in this path, by design. SQLite stores no row
  // count, so an exact total means walking every matching row — it was
  // measured at 81% of all D1 runtime, purely to print a number. The UI now
  // says "showing 32 of many" instead, and pagination is driven by the rows
  // themselves (below), so nothing here scales with catalog size.
  const rowsKey = JSON.stringify({ q, category, collection, tag, format, country, minRating, mood, sort });

  // Fetches ONE row more than the page needs. If that extra row comes back,
  // there's another page — which is all "Load more" ever needed to know.
  // Cost per view stays flat at perPage+1 rows (33) no matter how large the
  // catalog grows. `effLang` (not the requested `lang`) keys the cache so
  // the English fallback below can't collide with the original language's
  // entry — with a shared key the fallback would re-read the cached empty
  // result and the page would stay blank forever.
  const runRows = (effLang, b) =>
    cached(`rows:${effLang}:${rowsKey}:${page}:${perPage}`, async () => {
      const r = await db
        .prepare(`SELECT * FROM books WHERE ${wsql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
        .bind(...b, perPage + 1, (page - 1) * perPage).all();
      return r.results;
    }, 300);

  let rows = await runRows(lang, binds);

  // Empty language falls back to English rows with the same filters.
  if (!rows.length && lang !== "en") {
    const enBinds = [...binds];
    enBinds[0] = "en";
    rows = await runRows("en", enBinds);
  }

  const hasMore = rows.length > perPage;
  const pageRows = hasMore ? rows.slice(0, perPage) : rows;

  const { amazon_assoc_tag } = await getSiteSettings();
  return {
    books: pageRows.map((r) => mapBook(r, amazon_assoc_tag)),
    page: Number(page),
    hasMore,
    // `total` is intentionally absent — callers should render a count-free
    // label ("showing N of many") and use `hasMore` for pagination.
  };
}

// Direct indexed lookup (UNIQUE(slug, lang)) — never scans the catalog,
// so this stays fast whether there are dozens of books or millions.
export async function getBook(slug, lang) {
  const decoded = decodeURIComponent(slug);
  const db = await getCatalogDb();
  const [row, { amazon_assoc_tag }] = await Promise.all([
    db.prepare("SELECT * FROM books WHERE slug=?1 AND lang=?2 LIMIT 1").bind(decoded, lang).first(),
    getSiteSettings(),
  ]);
  if (row) return mapBook(row, amazon_assoc_tag);
  // Localized-slug support: the slug may belong to another language's row
  // (e.g. a Devanagari slug opened while the UI language is English).
  const fallback = await db.prepare("SELECT * FROM books WHERE slug=?1 LIMIT 1").bind(decoded).first();
  return fallback ? mapBook(fallback, amazon_assoc_tag) : null;
}

// All language variants of a book (matched by ISBN prefix-insensitive title
// fallback) — used for hreflang alternates and the language-switch UX.
// "Recently added to BookQubit" — ordered by when the row was created, not
// by the book's publication year (that's the separate "New Releases" sort).
// Note: caches the raw rows, not the mapped book (buyUrl is applied after
// the cache lookup) — so an admin changing the Amazon associate tag takes
// effect on the very next request instead of waiting out this cache's TTL.
export async function getRecentlyAdded(lang, limit = 8) {
  const [rows, { amazon_assoc_tag }] = await Promise.all([
    cached(`recent-added:${lang}:${limit}`, async () => {
      const db = await getCatalogDb();
      let { results } = await db
        .prepare("SELECT * FROM books WHERE lang=?1 ORDER BY created_at DESC, id DESC LIMIT ?2")
        .bind(lang, limit).all();
      if (!results.length && lang !== "en") {
        ({ results } = await db
          .prepare("SELECT * FROM books WHERE lang='en' ORDER BY created_at DESC, id DESC LIMIT ?1")
          .bind(limit).all());
      }
      return results;
    }, 300),
    getSiteSettings(),
  ]);
  return rows.map((r) => mapBook(r, amazon_assoc_tag));
}

// Admin-curated, not tied to import cadence — safe to cache far longer than
// the 5-min default. Same 3h TTL applied across the slow-changing lookups
// below: verified live via Cloudflare's D1 dashboard that even with very
// little real traffic, uncached/short-TTL full-table reads (facets,
// author/publisher lists, platform stats on every page's footer) were
// contributing heavily to blowing past the free tier's 5M-rows/day cap.
export async function getFeaturedBooks(lang, limit = 5) {
  const [rows, { amazon_assoc_tag }] = await Promise.all([
    cached(`featured:${lang}:${limit}`, async () => {
      const db = await getCatalogDb();
      let { results } = await db
        .prepare("SELECT * FROM books WHERE lang=?1 AND featured=1 ORDER BY id LIMIT ?2")
        .bind(lang, limit).all();
      if (!results.length && lang !== "en") {
        ({ results } = await db
          .prepare("SELECT * FROM books WHERE lang='en' AND featured=1 ORDER BY id LIMIT ?1")
          .bind(limit).all());
      }
      return results;
    }, 10800),
    getSiteSettings(),
  ]);
  return rows.map((r) => mapBook(r, amazon_assoc_tag));
}

// Picks a random id in range instead of ORDER BY RANDOM() — the latter forces
// a full-table scan+sort that gets slower as the catalog grows; this stays
// O(log n) via the primary key index no matter how many books there are.
export async function getRandomBook(lang) {
  const db = await getCatalogDb();
  const bounds = await cached(`book-bounds:${lang}`, () =>
    db.prepare("SELECT MIN(id) AS lo, MAX(id) AS hi FROM books WHERE lang=?1").bind(lang).first()
  , 10800);
  if (!bounds?.hi) return null;
  const randomId = bounds.lo + Math.floor(Math.random() * (bounds.hi - bounds.lo + 1));
  const [row, { amazon_assoc_tag }] = await Promise.all([
    db.prepare("SELECT * FROM books WHERE lang=?1 AND id >= ?2 ORDER BY id LIMIT 1").bind(lang, randomId).first(),
    getSiteSettings(),
  ]);
  return row ? mapBook(row, amazon_assoc_tag) : null;
}

// Real, non-random pairings — top-rated books sharing a category, so each
// "X vs Y" reflects an actual choice a reader might be weighing. Shared by
// the /compare landing page (as suggested pairings/internal links) and the
// sitemap (so crawlers can discover these pages directly, not just via
// clicks) — a comparison page nobody links to won't get indexed no matter
// how well-optimized it is.
export async function getComparisonSuggestions(lang, limit = 8) {
  const topRated = await listBooks(lang, { sort: "rating", limit: 40 });
  const byCategory = new Map();
  for (const b of topRated) {
    if (!b.category) continue;
    const list = byCategory.get(b.category) || [];
    if (list.length < 2) list.push(b);
    byCategory.set(b.category, list);
  }
  return [...byCategory.values()]
    .filter((pair) => pair.length === 2)
    .slice(0, limit)
    .map(([a, b]) => ({ slug: `${a.slug}-vs-${b.slug}`, title: `${a.title} vs ${b.title}` }));
}

// Slugs only, uncapped by design — used exclusively by the (server-only,
// never publicly exposed) sitemap generator, which needs to enumerate the
// entire catalog a shard at a time rather than a UI-sized page.
// Returns { slug, created_at } so the sitemap can emit a real <lastmod>.
// Cached (1h): measured live that /sitemap.xml was reading ~11,000 rows on
// EVERY crawler request and was completely uncached — with SEO bots being
// effectively 100% of this site's traffic, that made the sitemap itself one
// of the largest single consumers of D1's read quota. An hour of staleness
// costs nothing here (crawlers revisit far less often than that), and new
// books still appear on the very next hourly regeneration.
export async function getBookSlugsPage(lang, { page = 1, perPage = 40000 } = {}) {
  return cached(`book-slugs:${lang}:${page}:${perPage}`, async () => {
    const db = await getCatalogDb();
    const { results } = await db.prepare(
      "SELECT slug, created_at FROM books WHERE lang=?1 ORDER BY id LIMIT ?2 OFFSET ?3"
    ).bind(lang, perPage, (page - 1) * perPage).all();
    return results;
  }, 3600);
}

export async function getBookAlternates(book) {
  if (!book?.isbn && !book?.title) return [];
  // Only changes when a new language edition of this exact book is
  // imported — the current pipeline only ever imports lang='en', so in
  // practice this never changes. Called on every book page view.
  return cached(`alternates:${book.isbn || ""}:${book.title}`, async () => {
    const db = await getCatalogDb();
    const { results } = await db
      .prepare("SELECT slug, lang FROM books WHERE (isbn=?1 AND isbn IS NOT NULL) OR title=?2 LIMIT 25")
      .bind(book.isbn || "", book.title)
      .all();
    return results;
  }, 10800);
}

// Direct SQL query, bounded by `limit` — matches on the same category or
// author, ranked by rating. Never loads the catalog to find these.
// Called on every book page view, so cached — an OR across two differently
// indexed columns (category, author) can't use either index cleanly and was
// showing up as one of the largest uncached read contributors on the D1
// dashboard despite very little real traffic.
// Split into two separately-indexed queries instead of one `(category=?
// OR author=?)`, backed by the composite (lang, category, rating DESC) /
// (lang, author, rating DESC) indexes in CATALOG_SCHEMA.
//
// This runs on EVERY book page view and was the single biggest source of
// D1 reads. Measured live on the real catalog (rows_read per call):
//
//                        OR form   composite index
//   common category         95          4
//   niche category       5,121          0
//   author match             3          2
//
// The OR form could only use `lang` from an index, then walked the rating
// index until it found enough matches — cheap for a handful of very common
// categories, but a full ~5,000-row scan for the long tail of niche ones,
// which is most books. Caching can't rescue this either: a crawler walking
// all 5,000 book pages hits a distinct cache key every time, so a one-pass
// crawl misses on every single page.
//
// The composite indexes let SQLite satisfy the filter AND the ordering from
// one index, so it stops after `limit` rows instead of sorting a category.
// It picks them on its own — no INDEXED BY hint (an earlier attempt used
// hints against the plain single-column indexes and made the common case
// worse, 1,257 rows, by forcing a sort over every book in the category).
export async function relatedBooks(book, lang, limit = 4) {
  const cacheKey = `related:${lang}:${book.id}:${limit}`;
  const [rows, { amazon_assoc_tag }] = await Promise.all([
    cached(cacheKey, async () => {
      const db = await getCatalogDb();
      const build = (column, value) =>
        db.prepare(
          `SELECT * FROM books WHERE lang=?1 AND ${column}=?2 AND id != ?3
           ORDER BY rating DESC NULLS LAST LIMIT ?4`
        ).bind(lang, value, book.id, limit);

      const queries = [];
      if (book.category) queries.push(build("category", book.category));
      if (book.author) queries.push(build("author", book.author));
      if (!queries.length) return [];

      const batched = await db.batch(queries);
      // Same-author and same-category results can overlap — dedupe by id,
      // then re-rank across both sets so the best `limit` win overall.
      const seen = new Map();
      for (const part of batched) {
        for (const row of part.results) if (!seen.has(row.id)) seen.set(row.id, row);
      }
      return [...seen.values()]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
    }, 3600),
    getSiteSettings(),
  ]);
  return rows.map((r) => mapBook(r, amazon_assoc_tag));
}

// Facet counts computed entirely in SQL (GROUP BY / json_each) — no matter
// how large the catalog gets, this only ever returns the top N per facet,
// never touches every row in application memory.
export async function facets(lang) {
  return cached(`facets:${lang}`, async () => {
    const db = await getCatalogDb();
    const [categories, collections, countries, tags] = await Promise.all([
      db.prepare(
        `SELECT category AS name, COUNT(*) AS count FROM books
         WHERE lang=?1 AND category IS NOT NULL AND category != ''
         GROUP BY category ORDER BY count DESC LIMIT 60`
      ).bind(lang).all(),
      db.prepare(
        `SELECT collection AS name, COUNT(*) AS count FROM books
         WHERE lang=?1 AND collection IS NOT NULL AND collection != ''
         GROUP BY collection ORDER BY count DESC LIMIT 40`
      ).bind(lang).all(),
      db.prepare(
        `SELECT country AS name, COUNT(*) AS count FROM books
         WHERE lang=?1 AND country IS NOT NULL AND country != ''
         GROUP BY country ORDER BY count DESC LIMIT 40`
      ).bind(lang).all(),
      db.prepare(
        `SELECT value AS name, COUNT(*) AS count FROM books, json_each(books.tags)
         WHERE books.lang=?1 GROUP BY value ORDER BY count DESC LIMIT 60`
      ).bind(lang).all(),
    ]);
    return {
      categories: categories.results,
      collections: collections.results,
      countries: countries.results,
      tags: tags.results,
    };
  }, 10800);
}

// How readers actually felt about books, aggregated across every shelf entry
// — powers "Browse by Mood" discovery, distinct from genre/category facets.
export async function getMoodCounts() {
  return cached("facets:moods", async () => {
    const db = await getDb();
    const { results } = await db.prepare("SELECT moods FROM shelf WHERE moods IS NOT NULL").all();
    const counts = new Map();
    for (const row of results) {
      for (const m of J(row.moods)) counts.set(m, (counts.get(m) || 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, 10800);
}

async function listEntity(table, lang, jsonCols) {
  return cached(`${table}:${lang}`, async () => {
    const db = await getCatalogDb();
    let { results } = await db
      .prepare(`SELECT * FROM ${table} WHERE lang=?1 ORDER BY id`)
      .bind(lang).all();
    if (!results.length && lang !== "en") {
      ({ results } = await db
        .prepare(`SELECT * FROM ${table} WHERE lang='en' ORDER BY id`).all());
    }
    return results.map((r) => {
      const out = { ...r };
      jsonCols.forEach((c) => (out[c] = J(r[c])));
      return out;
    });
  }, 10800);
}

// listEntity("authors", ...) returns every row in the authors table, including
// stub profiles created during import for an author whose book didn't end up
// staying in the catalog (or was later removed) — so the /authors page was
// showing authors with zero actual books. Filter to only authors that have at
// least one matching book.
//
// Two earlier attempts at this both blew the Worker's CPU budget in
// production (verified live via wrangler tail — genuine "exceeded CPU time
// limit" kills, not a one-off): a per-author x per-book-line nested loop
// (~3,000 x 3,700 checks), then a "joined corpus + indexOf per author"
// version that was still borderline/intermittent. Root cause both times was
// treating this as fuzzy substring matching. It doesn't need to be — the
// import always writes books.author as an exact ", "-joined list of
// individual names (see cron-worker's `authorLine`), so splitting on ", "
// gives exact names, which turns this into a Set built once (O(total book
// rows)) and O(1) lookups per author — not scans. Whole result still cached
// on top of that, so the split/Set-build cost is paid once per TTL window.
export async function listAuthors(lang) {
  return cached(`authors-with-books:${lang}`, async () => {
    const [authors, bookAuthorNames] = await Promise.all([
      listEntity("authors", lang, ["genres"]),
      (async () => {
        const db = await getCatalogDb();
        const { results } = await db
          .prepare("SELECT DISTINCT author FROM books WHERE lang=?1 AND author IS NOT NULL AND author != ''")
          .bind(lang).all();
        const set = new Set();
        for (const { author } of results) {
          for (const name of author.split(",")) {
            const trimmed = name.trim().toLowerCase();
            if (trimmed) set.add(trimmed);
          }
        }
        return set;
      })(),
    ]);
    return authors.filter((a) => bookAuthorNames.has(a.name.trim().toLowerCase()));
  }, 10800);
}
export const listPublications = (lang) => listEntity("publications", lang, ["notable_authors", "imprints"]);
export const listComics = (lang) => listEntity("comics", lang, ["characters", "creators"]);

export async function getAuthor(slug, lang) {
  return (await listAuthors(lang)).find((a) => a.slug === decodeURIComponent(slug)) || null;
}
export async function getPublication(slug, lang) {
  return (await listPublications(lang)).find((p) => p.slug === decodeURIComponent(slug)) || null;
}

// Cross-linking helpers: a book's `author`/`publisher` columns are plain
// text (a book can list multiple authors as "A, B, C"), so pages that want
// to link straight to the real profile — instead of a search query for the
// name — need to resolve name -> slug. Cheap: reuses listAuthors/
// listPublications' own cached full list, no extra query.
export async function getAuthorByName(name, lang) {
  if (!name) return null;
  const first = name.split(",")[0].trim().toLowerCase();
  return (await listAuthors(lang)).find((a) => a.name.trim().toLowerCase() === first) || null;
}
export async function getPublicationByName(name, lang) {
  if (!name) return null;
  const target = name.trim().toLowerCase();
  return (await listPublications(lang)).find((p) => p.name.trim().toLowerCase() === target) || null;
}
export async function getComic(slug, lang) {
  return (await listComics(lang)).find((c) => c.slug === decodeURIComponent(slug)) || null;
}

// One shared "individual author name -> their book slugs" index for the
// whole catalog, built once per TTL and reused by every author page.
//
// This exists because `books.author` is a single TEXT column holding a
// ", "-joined list ("Ken Follett, John Lee"), not a relation. The old
// booksByAuthor did `author = ? COLLATE NOCASE`, which only ever matched
// books where that person is the SOLE author — so every co-authored book
// was invisible and authors who only ever co-write (verified live: John
// Lee, on "Edge of Eternity" and "House of Suns") got a completely empty
// page despite having books in the catalog.
//
// Matching co-authors in SQL would need `LIKE '%, name'`, whose leading
// wildcard can't use an index — a full table scan per author page, and
// with thousands of author pages that's exactly the read blowup we just
// spent this session fixing. Splitting once into a map instead costs ONE
// scan per TTL window shared across every author, then turns each author
// page into an indexed by-slug fetch. Same trick listAuthors() already
// uses to decide which authors have books at all.
async function getAuthorBookIndex(lang) {
  return cached(`author-book-index:${lang}`, async () => {
    const db = await getCatalogDb();
    const { results } = await db
      .prepare("SELECT slug, author FROM books WHERE lang=?1 AND author IS NOT NULL AND author != ''")
      .bind(lang).all();
    // Plain object, not a Map — this goes through JSON in the KV cache.
    const index = {};
    for (const { slug, author } of results) {
      for (const part of author.split(",")) {
        const key = part.trim().toLowerCase();
        if (!key) continue;
        (index[key] ||= []).push(slug);
      }
    }
    return index;
  }, 10800);
}

// Every book an author worked on, whether they're the sole author or one
// of several. Bounded so a prolific/ambiguous name can't render a
// thousand-card page.
export async function booksByAuthor(name, lang) {
  const key = (name || "").trim().toLowerCase();
  if (!key) return [];
  const [index, { amazon_assoc_tag }] = await Promise.all([
    getAuthorBookIndex(lang),
    getSiteSettings(),
  ]);
  const slugs = (index[key] || []).slice(0, 200);
  if (!slugs.length) return [];
  const bySlug = await getBooksBySlug(slugs, lang, "*");
  return slugs
    .map((s) => bySlug.get(s))
    .filter(Boolean)
    .map((r) => mapBook(r, amazon_assoc_tag));
}

// Resolves each individual name in a book's ", "-joined author line to its
// profile (or null if that person has no author row yet), so a book page
// can link every co-author separately instead of treating the whole string
// as one person. Reuses listAuthors()' cached list — no extra query.
export async function getAuthorLineProfiles(authorLine, lang) {
  if (!authorLine) return [];
  const names = authorLine.split(",").map((s) => s.trim()).filter(Boolean);
  if (!names.length) return [];
  const all = await listAuthors(lang);
  const byName = new Map(all.map((a) => [a.name.trim().toLowerCase(), a]));
  return names.map((name) => ({ name, profile: byName.get(name.toLowerCase()) || null }));
}

// Distinct publisher string -> the slugs published under it, built once per
// TTL window and shared by every publisher page.
//
// Publisher pages match loosely on purpose: books store the raw imprint
// string, so "Penguin Books" legitimately has to match "Penguin Books,
// Limited" too — measured live, exact matching returns 24 books where the
// loose match returns 80. That means a leading-wildcard LIKE, which can
// never use an index and scanned all 5,331 books PER PAGE. With 2,347
// publisher pages, one crawl pass over them was ~12 million rows read.
//
// Caching the old query didn't help, because each publisher was its own
// cache key — a single pass over all of them missed every time. Grouping
// once and matching in JS turns that into ONE scan per TTL shared across
// every publisher, then an indexed by-slug fetch per page. Same approach as
// getAuthorBookIndex above.
async function getPublisherBookIndex(lang) {
  return cached(`publisher-book-index:${lang}`, async () => {
    const db = await getCatalogDb();
    const { results } = await db
      .prepare("SELECT slug, publisher FROM books WHERE lang=?1 AND publisher IS NOT NULL AND publisher != ''")
      .bind(lang).all();
    // Keyed by the distinct publisher string (~2,600) rather than one entry
    // per book (~5,300) — smaller to cache, and the substring match below
    // then runs over distinct names instead of every row.
    const index = {};
    for (const { slug, publisher } of results) {
      const key = publisher.trim().toLowerCase();
      if (!key) continue;
      (index[key] ||= []).push(slug);
    }
    return index;
  }, 10800);
}

export async function booksByPublisher(name, lang) {
  const needle = (name || "").trim().toLowerCase();
  if (!needle) return [];
  const [index, { amazon_assoc_tag }] = await Promise.all([
    getPublisherBookIndex(lang),
    getSiteSettings(),
  ]);
  const slugs = [];
  for (const key of Object.keys(index)) {
    // Same substring semantics the old LIKE had, so results don't change.
    if (key.includes(needle)) slugs.push(...index[key]);
    if (slugs.length >= 200) break; // bounded page, as before
  }
  if (!slugs.length) return [];
  const bySlug = await getBooksBySlug(slugs.slice(0, 200), lang, "*");
  return slugs
    .slice(0, 200)
    .map((s) => bySlug.get(s))
    .filter(Boolean)
    .map((r) => mapBook(r, amazon_assoc_tag));
}

// ── Bookworm ranking ────────────────────────────────────────────────────────
export const LEVELS = [
  { min: 400, name: "Grand Librarian", icon: "award" },
  { min: 150, name: "Bibliophile", icon: "layers" },
  { min: 50, name: "Bookworm", icon: "book" },
  { min: 10, name: "Page Turner", icon: "bookOpen" },
  { min: 0, name: "New Reader", icon: "compass" },
];
export const levelFor = (points) => LEVELS.find((l) => points >= l.min);
export const pointsFor = (r) =>
  (r.reads || 0) * 10 + (r.reviews || 0) * 5 + (r.ratings || 0) * 2 +
  (r.discussions || 0) * 3 + (r.posts || 0) * 1;

// Community stats + reviews for one book (drives the book-page social section).
// Runs on every book page view — a 4-way `shelf` scan per visit was another
// uncached hot spot. Short TTL: new ratings/reviews should still surface
// quickly, but a bot re-hitting the same book seconds apart shouldn't repeat
// the full aggregation.
export async function getBookCommunity(slug) {
  return cached(`community:${slug}`, async () => {
    const db = await getDb();
    const [agg, dist, vibes, reviews] = await Promise.all([
      db.prepare(
        `SELECT COUNT(*) AS total,
           SUM(CASE WHEN status='want' THEN 1 ELSE 0 END) AS want,
           SUM(CASE WHEN status='reading' THEN 1 ELSE 0 END) AS reading,
           SUM(CASE WHEN status='read' THEN 1 ELSE 0 END) AS read,
           AVG(rating) AS avg_rating,
           COUNT(rating) AS rating_count
         FROM shelf WHERE book_slug=?1`
      ).bind(slug).first(),
      db.prepare(
        `SELECT rating, COUNT(*) AS n FROM shelf
         WHERE book_slug=?1 AND rating IS NOT NULL GROUP BY rating`
      ).bind(slug).all(),
      db.prepare(
        `SELECT moods, pace FROM shelf
         WHERE book_slug=?1 AND (moods IS NOT NULL OR pace IS NOT NULL)`
      ).bind(slug).all(),
      db.prepare(
        `SELECT s.rating, s.review, s.status, s.spoiler, s.updated_at, u.id AS user_id, u.name, u.photo_url, u.slug
         FROM shelf s JOIN users u ON u.id=s.user_id
         WHERE s.book_slug=?1 AND s.review IS NOT NULL AND s.review != ''
         ORDER BY s.updated_at DESC LIMIT 20`
      ).bind(slug).all(),
    ]);
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      n: dist.results.find((d) => d.rating === star)?.n || 0,
    }));
    const moodCounts = new Map();
    const paceCounts = new Map();
    for (const v of vibes.results) {
      for (const m of J(v.moods)) moodCounts.set(m, (moodCounts.get(m) || 0) + 1);
      if (v.pace) paceCounts.set(v.pace, (paceCounts.get(v.pace) || 0) + 1);
    }
    const moods = [...moodCounts.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
    const pace = [...paceCounts.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n);
    return { ...agg, avg_rating: agg.avg_rating ? Number(agg.avg_rating.toFixed(1)) : null, distribution, moods, pace, reviews: reviews.results };
  }, 60);
}

// Latest community activity — only public-worthy events (finished books,
// ratings, reviews). Private shelf intents like "want to read" stay private.
export async function getRecentActivity(limit = 12) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT s.book_slug, s.status, s.rating, s.review, s.updated_at,
            u.id AS user_id, u.name, u.photo_url, u.slug
     FROM shelf s
     JOIN users u ON u.id = s.user_id
     WHERE s.status='read' OR s.rating IS NOT NULL OR s.review IS NOT NULL
     ORDER BY s.updated_at DESC LIMIT ?1`
  ).bind(limit).all();
  const books = await getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title, cover_url");
  return results.map((r) => ({ ...r, title: books.get(r.book_slug)?.title || null, cover_url: books.get(r.book_slug)?.cover_url || null }));
}

export async function listDiscussions(limit = 30, { q } = {}) {
  const db = await getDb();
  const where = q ? "WHERE d.title LIKE ?2 OR d.tags LIKE ?2" : "";
  const binds = q ? [limit, `%${q}%`] : [limit];
  const { results } = await db.prepare(
    `SELECT d.*, u.name, u.photo_url, u.slug,
       (SELECT COUNT(*) FROM discussion_posts p WHERE p.discussion_id = d.id) AS replies,
       (SELECT COUNT(*) FROM discussion_members m WHERE m.discussion_id = d.id AND m.active = 1) AS members
     FROM discussions d
     JOIN users u ON u.id = d.user_id
     ${where}
     ORDER BY d.created_at DESC LIMIT ?1`
  ).bind(...binds).all();
  const [books, authors] = await Promise.all([
    getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title"),
    getAuthorsBySlug(results.map((r) => r.author_slug), "en", "slug, name"),
  ]);
  return results.map((r) => ({
    ...r, tags: J(r.tags),
    book_title: books.get(r.book_slug)?.title || null,
    author_name: authors.get(r.author_slug)?.name || null,
  }));
}

// Discussions a specific reader can see joining/leaving/messaging on — includes
// their own membership row (null if they've never interacted with it) so the
// UI knows whether to show Join, Open, or "rejoin blocked".
export async function getDiscussion(id, uid) {
  const db = await getDb();
  const [thread, posts, member] = await Promise.all([
    db.prepare(
      `SELECT d.*, u.name, u.photo_url, u.slug
       FROM discussions d
       JOIN users u ON u.id=d.user_id
       WHERE d.id=?1`
    ).bind(id).first(),
    db.prepare(
      `SELECT p.*, u.name, u.photo_url, u.slug FROM discussion_posts p JOIN users u ON u.id=p.user_id
       WHERE p.discussion_id=?1 ORDER BY p.created_at ASC`
    ).bind(id).all(),
    uid
      ? db.prepare("SELECT * FROM discussion_members WHERE discussion_id=?1 AND user_id=?2").bind(id, uid).first()
      : Promise.resolve(null),
  ]);
  if (!thread) return null;
  const [books, authors] = await Promise.all([
    getBooksBySlug([thread.book_slug], "en", "slug, title"),
    getAuthorsBySlug([thread.author_slug], "en", "slug, name"),
  ]);
  return {
    ...thread, tags: J(thread.tags),
    book_title: books.get(thread.book_slug)?.title || null,
    author_name: authors.get(thread.author_slug)?.name || null,
    posts: posts.results, membership: member || null,
  };
}

export async function isActiveDiscussionMember(uid, discussionId) {
  const db = await getDb();
  const row = await db.prepare(
    "SELECT active FROM discussion_members WHERE discussion_id=?1 AND user_id=?2"
  ).bind(discussionId, uid).first();
  return Boolean(row?.active);
}

export async function getDiscussionMessagesSince(discussionId, sinceId = 0) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT p.*, u.name, u.photo_url, u.slug FROM discussion_posts p JOIN users u ON u.id=p.user_id
     WHERE p.discussion_id=?1 AND p.id > ?2 ORDER BY p.created_at ASC`
  ).bind(discussionId, sinceId).all();
  return results;
}

// A reader can leave a given discussion at most twice — after that, joining
// it again is blocked outright (prevents join/leave spam on the same thread).
const EXIT_LIMIT = 2;

export async function joinDiscussion(uid, discussionId) {
  const db = await getDb();
  const existing = await db.prepare(
    "SELECT * FROM discussion_members WHERE discussion_id=?1 AND user_id=?2"
  ).bind(discussionId, uid).first();

  if (existing?.active) return { ok: true };
  if (existing && existing.exit_count >= EXIT_LIMIT) {
    return { ok: false, error: "You've left this discussion twice already and can't rejoin." };
  }
  if (existing) {
    await db.prepare(
      "UPDATE discussion_members SET active=1, last_read_at=CURRENT_TIMESTAMP WHERE discussion_id=?1 AND user_id=?2"
    ).bind(discussionId, uid).run();
  } else {
    await db.prepare(
      "INSERT INTO discussion_members (discussion_id, user_id) VALUES (?1, ?2)"
    ).bind(discussionId, uid).run();
  }
  return { ok: true };
}

export async function leaveDiscussion(uid, discussionId) {
  const db = await getDb();
  const existing = await db.prepare(
    "SELECT * FROM discussion_members WHERE discussion_id=?1 AND user_id=?2"
  ).bind(discussionId, uid).first();
  if (!existing?.active) return { ok: true };
  if (existing.exit_count >= EXIT_LIMIT) {
    return { ok: false, error: "You've already used both exits for this discussion." };
  }
  await db.prepare(
    "UPDATE discussion_members SET active=0, exit_count=exit_count+1, archived=0 WHERE discussion_id=?1 AND user_id=?2"
  ).bind(discussionId, uid).run();
  return { ok: true };
}

export async function setDiscussionArchived(uid, discussionId, archived) {
  const db = await getDb();
  await db.prepare(
    "UPDATE discussion_members SET archived=?3 WHERE discussion_id=?1 AND user_id=?2 AND active=1"
  ).bind(discussionId, uid, archived ? 1 : 0).run();
}

export async function markDiscussionRead(uid, discussionId) {
  const db = await getDb();
  await db.prepare(
    "UPDATE discussion_members SET last_read_at=CURRENT_TIMESTAMP WHERE discussion_id=?1 AND user_id=?2"
  ).bind(discussionId, uid).run();
}

// The reader's WhatsApp-style chat list: every discussion they're currently
// a member of, with unread counts and a last-message preview.
export async function getMyDiscussions(uid) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT d.id, d.title, d.book_slug, d.author_slug, d.tags, m.archived, m.last_read_at,
       (SELECT COUNT(*) FROM discussion_posts p WHERE p.discussion_id=d.id AND p.created_at > m.last_read_at AND p.user_id != ?1) AS unread,
       (SELECT p.body FROM discussion_posts p WHERE p.discussion_id=d.id ORDER BY p.created_at DESC LIMIT 1) AS last_message,
       (SELECT p.created_at FROM discussion_posts p WHERE p.discussion_id=d.id ORDER BY p.created_at DESC LIMIT 1) AS last_message_at
     FROM discussion_members m
     JOIN discussions d ON d.id = m.discussion_id
     WHERE m.user_id=?1 AND m.active=1
     ORDER BY COALESCE(last_message_at, d.created_at) DESC`
  ).bind(uid).all();
  const [books, authors] = await Promise.all([
    getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title"),
    getAuthorsBySlug(results.map((r) => r.author_slug), "en", "slug, name"),
  ]);
  return results.map((r) => ({
    ...r, tags: J(r.tags),
    book_title: books.get(r.book_slug)?.title || null,
    author_name: authors.get(r.author_slug)?.name || null,
  }));
}

// Discovery/search for discussions to join — annotated with the viewer's own
// membership state so the UI can grey out threads they're locked out of.
export async function searchDiscussions(q, uid, limit = 30) {
  const db = await getDb();
  const like = `%${q || ""}%`;
  const { results } = await db.prepare(
    `SELECT d.*, u.name, u.photo_url, u.slug,
       (SELECT COUNT(*) FROM discussion_members m WHERE m.discussion_id=d.id AND m.active=1) AS members,
       mine.active AS my_active, mine.exit_count AS my_exit_count
     FROM discussions d
     JOIN users u ON u.id=d.user_id
     LEFT JOIN discussion_members mine ON mine.discussion_id=d.id AND mine.user_id=?2
     WHERE d.title LIKE ?1 OR d.tags LIKE ?1
     ORDER BY d.created_at DESC LIMIT ?3`
  ).bind(like, uid || "", limit).all();
  const [books, authors] = await Promise.all([
    getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title"),
    getAuthorsBySlug(results.map((r) => r.author_slug), "en", "slug, name"),
  ]);
  return results.map((r) => ({
    ...r, tags: J(r.tags),
    book_title: books.get(r.book_slug)?.title || null,
    author_name: authors.get(r.author_slug)?.name || null,
  }));
}

// Surfaced on a book's page (and for books on a reader's "want to read"
// shelf) so readers can find the conversation instead of starting a duplicate.
export async function getDiscussionsForBook(bookSlug, limit = 5) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT d.id, d.title, d.created_at,
       (SELECT COUNT(*) FROM discussion_members m WHERE m.discussion_id=d.id AND m.active=1) AS members
     FROM discussions d WHERE d.book_slug=?1 ORDER BY d.created_at DESC LIMIT ?2`
  ).bind(bookSlug, limit).all();
  return results;
}

// Notifies readers whose saved genre preferences overlap the new
// discussion's book/author — they see it in their Notifications tab with a
// simple Join/Pass choice, never an unsolicited auto-join.
async function notifyMatchingReaders(discussionId, { bookSlug, authorSlug, creatorId }) {
  const db = await getDb();
  let genre = null;
  if (bookSlug) {
    const catalogDb = await getCatalogDb();
    const b = await catalogDb.prepare("SELECT category FROM books WHERE slug=?1 AND lang='en'").bind(bookSlug).first();
    genre = b?.category || null;
  } else if (authorSlug) {
    const catalogDb = await getCatalogDb();
    const a = await catalogDb.prepare("SELECT genres FROM authors WHERE slug=?1 AND lang='en'").bind(authorSlug).first();
    genre = J(a?.genres)[0] || null;
  }
  if (!genre) return;

  const { results } = await db.prepare("SELECT user_id, genres FROM user_preferences").all();
  const matches = results.filter((r) => r.user_id !== creatorId && J(r.genres).includes(genre));
  if (!matches.length) return;
  await db.batch(
    matches.map((m) =>
      db.prepare("INSERT INTO discussion_notifications (user_id, discussion_id) VALUES (?1, ?2)").bind(m.user_id, discussionId)
    )
  );
}

export async function getNotifications(uid) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT n.id, n.status, n.created_at, d.id AS discussion_id, d.title, d.body, d.tags,
       d.book_slug, d.author_slug, u.name AS starter_name
     FROM discussion_notifications n
     JOIN discussions d ON d.id = n.discussion_id
     JOIN users u ON u.id = d.user_id
     WHERE n.user_id=?1 AND n.status='pending'
     ORDER BY n.created_at DESC`
  ).bind(uid).all();
  const [books, authors] = await Promise.all([
    getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title"),
    getAuthorsBySlug(results.map((r) => r.author_slug), "en", "slug, name"),
  ]);
  return results.map((r) => ({
    ...r, tags: J(r.tags),
    book_title: books.get(r.book_slug)?.title || null,
    author_name: authors.get(r.author_slug)?.name || null,
  }));
}

export async function respondNotification(uid, notifId, action) {
  const db = await getDb();
  const notif = await db.prepare("SELECT * FROM discussion_notifications WHERE id=?1 AND user_id=?2").bind(notifId, uid).first();
  if (!notif) return { ok: false, error: "not found" };
  await db.prepare("UPDATE discussion_notifications SET status=?1 WHERE id=?2")
    .bind(action === "join" ? "joined" : "passed", notifId).run();
  if (action === "join") return joinDiscussion(uid, notif.discussion_id);
  return { ok: true };
}

// Public profile: user info + full shelf with book data
// Accepts either the friendly slug (used in new links) or the raw Firebase
// uid (older links, or readers who haven't triggered a slug backfill yet).
// A shareable annual recap — everything computed from books the reader
// actually finished that year, nothing else.
export async function getYearInBooks(uid, year) {
  const db = await getDb();
  const { results: shelfRows } = await db.prepare(
    `SELECT * FROM shelf
     WHERE user_id=?1 AND status='read' AND strftime('%Y', COALESCE(finished_at, updated_at)) = ?2`
  ).bind(uid, String(year)).all();
  const bookInfo = await getBooksBySlug(shelfRows.map((r) => r.book_slug), "en", "slug, title, author, cover_url, category, page_count");
  const books = shelfRows.map((r) => ({ ...r, ...bookInfo.get(r.book_slug) }));

  const totalBooks = books.length;
  const totalPages = books.reduce((n, b) => n + (b.page_count || 0), 0);
  const rated = books.filter((b) => b.rating);
  const avgRating = rated.length ? rated.reduce((n, b) => n + b.rating, 0) / rated.length : null;

  const genreCounts = new Map();
  const authorCounts = new Map();
  for (const b of books) {
    if (b.category) genreCounts.set(b.category, (genreCounts.get(b.category) || 0) + 1);
    if (b.author) authorCounts.set(b.author, (authorCounts.get(b.author) || 0) + 1);
  }
  const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topAuthor = [...authorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const longestBook = books.reduce((max, b) => ((b.page_count || 0) > (max?.page_count || 0) ? b : max), null);
  const topRatedBook = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] || null;
  const reviewsWritten = books.filter((b) => b.review && b.review.trim()).length;

  const months = Array.from({ length: 12 }, (_, i) => ({ month: i, count: 0 }));
  for (const b of books) {
    const d = new Date(b.finished_at || b.updated_at);
    if (!Number.isNaN(d.getTime())) months[d.getMonth()].count += 1;
  }

  return { year, totalBooks, totalPages, avgRating: avgRating ? Number(avgRating.toFixed(1)) : null, topGenre, topAuthor, longestBook, topRatedBook, reviewsWritten, months };
}

export async function getUserProfile(idOrSlug) {
  const db = await getDb();
  const user = await db.prepare("SELECT * FROM users WHERE slug=?1 OR id=?1").bind(idOrSlug).first();
  if (!user) return null;
  const shelf = await db.prepare(
    `SELECT * FROM shelf WHERE user_id=?1 ORDER BY updated_at DESC`
  ).bind(user.id).all();
  const bookInfo = await getBooksBySlug(shelf.results.map((r) => r.book_slug), "en", "slug, title, author, cover_url");
  return { user, shelf: shelf.results.map((r) => ({ ...r, ...bookInfo.get(r.book_slug) })) };
}

// A reader's social graph — who they follow and who follows them (readers
// only, via the generic `follows` table's target_type='reader' rows) — plus
// total counts, since the returned lists are capped for display.
export async function getReaderNetwork(uid, limit = 12) {
  const db = await getDb();
  const [following, followers, followingCount, followerCount] = await Promise.all([
    db.prepare(
      `SELECT u.id, u.name, u.photo_url, u.slug FROM follows f JOIN users u ON u.id = f.target_id
       WHERE f.user_id=?1 AND f.target_type='reader' ORDER BY f.created_at DESC LIMIT ?2`
    ).bind(uid, limit).all(),
    db.prepare(
      `SELECT u.id, u.name, u.photo_url, u.slug FROM follows f JOIN users u ON u.id = f.user_id
       WHERE f.target_id=?1 AND f.target_type='reader' ORDER BY f.created_at DESC LIMIT ?2`
    ).bind(uid, limit).all(),
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE user_id=?1 AND target_type='reader'").bind(uid).first(),
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE target_id=?1 AND target_type='reader'").bind(uid).first(),
  ]);
  return {
    following: following.results, followers: followers.results,
    followingCount: followingCount.n, followerCount: followerCount.n,
  };
}

export async function addQuote(userId, { bookSlug, text, page }) {
  const db = await getDb();
  const res = await db.prepare(
    "INSERT INTO quotes (user_id, book_slug, text, page) VALUES (?1, ?2, ?3, ?4)"
  ).bind(userId, bookSlug, text, page || null).run();
  return res.meta.last_row_id;
}

export async function getQuotesForBook(bookSlug, limit = 20) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT q.*, u.name, u.photo_url, u.slug FROM quotes q JOIN users u ON u.id = q.user_id
     WHERE q.book_slug = ?1 ORDER BY q.created_at DESC LIMIT ?2`
  ).bind(bookSlug, limit).all();
  return results;
}

export async function getQuotesByUser(uid, limit = 100) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT * FROM quotes WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2`
  ).bind(uid, limit).all();
  const books = await getBooksBySlug(results.map((r) => r.book_slug), "en", "slug, title, author, cover_url");
  return results.map((r) => ({ ...r, ...books.get(r.book_slug) }));
}

export async function deleteQuote(uid, quoteId) {
  const db = await getDb();
  await db.prepare("DELETE FROM quotes WHERE id=?1 AND user_id=?2").bind(quoteId, uid).run();
}

// The full achievement catalog — every reader is scored against all of
// these; `getAchievements` fills in progress/unlocked per reader.
export const ACHIEVEMENTS = [
  { id: "first-book", name: "First Page", desc: "Finish your first book", icon: "book", target: 1, stat: "reads" },
  { id: "bookworm-10", name: "Bookworm", desc: "Finish 10 books", icon: "bookOpen", target: 10, stat: "reads" },
  { id: "bookworm-50", name: "50 Books Club", desc: "Finish 50 books", icon: "layers", target: 50, stat: "reads" },
  { id: "century", name: "Century Club", desc: "Finish 100 books", icon: "award", target: 100, stat: "reads" },
  { id: "first-review", name: "First Review", desc: "Write your first review", icon: "feather", target: 1, stat: "reviews" },
  { id: "top-reviewer", name: "Top Reviewer", desc: "Write 20 reviews", icon: "star", target: 20, stat: "reviews" },
  { id: "rater", name: "Prolific Rater", desc: "Rate 30 books", icon: "star", target: 30, stat: "ratings" },
  { id: "discussion-starter", name: "Discussion Starter", desc: "Start 5 discussions", icon: "users", target: 5, stat: "discussions" },
  { id: "conversationalist", name: "Conversationalist", desc: "Post 25 discussion messages", icon: "feather", target: 25, stat: "posts" },
  { id: "genre-explorer", name: "Genre Explorer", desc: "Read across 5 different genres", icon: "compass", target: 5, stat: "genres" },
  { id: "quote-collector", name: "Quote Collector", desc: "Save 10 favorite quotes", icon: "feather", target: 10, stat: "quotes" },
  { id: "social-reader", name: "Social Reader", desc: "Follow 5 fellow readers", icon: "heart", target: 5, stat: "following" },
  { id: "well-followed", name: "Well Followed", desc: "Get 5 followers", icon: "users", target: 5, stat: "followers" },
  { id: "week-streak", name: "Week Streak", desc: "Reach a 7-day reading streak", icon: "flame", target: 7, stat: "streak" },
  { id: "month-streak", name: "Month Streak", desc: "Reach a 30-day reading streak", icon: "flame", target: 30, stat: "streak" },
];

export async function getAchievements(uid) {
  const db = await getDb();
  const [shelfAgg, discCount, postCount, quoteCount, followingCount, followerCount, genreRows, activeDays] = await Promise.all([
    db.prepare(
      `SELECT SUM(CASE WHEN status='read' THEN 1 ELSE 0 END) AS reads,
         SUM(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) AS ratings,
         SUM(CASE WHEN review IS NOT NULL AND review != '' THEN 1 ELSE 0 END) AS reviews
       FROM shelf WHERE user_id=?1`
    ).bind(uid).first(),
    db.prepare("SELECT COUNT(*) AS n FROM discussions WHERE user_id=?1").bind(uid).first(),
    db.prepare("SELECT COUNT(*) AS n FROM discussion_posts WHERE user_id=?1").bind(uid).first(),
    db.prepare("SELECT COUNT(*) AS n FROM quotes WHERE user_id=?1").bind(uid).first(),
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE user_id=?1 AND target_type='reader'").bind(uid).first(),
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE target_type='reader' AND target_id=?1").bind(uid).first(),
    db.prepare("SELECT DISTINCT book_slug FROM shelf WHERE user_id=?1 AND status='read'").bind(uid).all(),
    db.prepare("SELECT DISTINCT substr(updated_at,1,10) AS d FROM shelf WHERE user_id=?1 ORDER BY d DESC LIMIT 400").bind(uid).all(),
  ]);
  const readCategories = await getBooksBySlug(genreRows.results.map((r) => r.book_slug), "en", "slug, category");
  const genreSet = new Set([...readCategories.values()].map((b) => b.category).filter(Boolean));

  // Consecutive-day streak ending today or yesterday — same logic as /api/goal.
  let streak = 0;
  const dates = new Set(activeDays.results.map((r) => r.d));
  const cursor = new Date();
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }

  const stats = {
    reads: shelfAgg.reads || 0,
    ratings: shelfAgg.ratings || 0,
    reviews: shelfAgg.reviews || 0,
    discussions: discCount.n || 0,
    posts: postCount.n || 0,
    quotes: quoteCount.n || 0,
    following: followingCount.n || 0,
    followers: followerCount.n || 0,
    genres: genreSet.size,
    streak,
  };

  return ACHIEVEMENTS.map((a) => ({
    ...a,
    current: stats[a.stat] || 0,
    progress: Math.min(stats[a.stat] || 0, a.target),
    unlocked: (stats[a.stat] || 0) >= a.target,
  }));
}

// Badges are book-accomplishment based (never personal info) — the whole
// point of the ranking is to celebrate reading, not identity.
function badgesFor(r) {
  const badges = [];
  if (r.reads >= 100) badges.push("Century Club");
  else if (r.reads >= 50) badges.push("50 Books Club");
  else if (r.reads >= 10) badges.push("Page Turner");
  if (r.reviews >= 20) badges.push("Top Reviewer");
  if (r.discussions >= 10) badges.push("Discussion Starter");
  if (r.ratings >= 30) badges.push("Prolific Rater");
  return badges;
}

// The heavy part (two full `shelf`/`users` scans + per-user aggregation) is
// independent of the caller's limit/year/minBooks/genre — those are just
// filters applied after. Cached as one shared "all ranked readers" list so
// every leaderboard view/filter combo reuses the same computed data instead
// of re-scanning `shelf` per request.
async function getRankedReaders() {
  return cached("leaderboard:ranked", async () => {
    const db = await getDb();
    const [base, shelfBooks] = await Promise.all([
      db.prepare(
        `SELECT u.id, u.name, u.photo_url, u.slug,
           COALESCE(sh.reads, 0) AS reads,
           COALESCE(sh.ratings, 0) AS ratings,
           COALESCE(sh.reviews, 0) AS reviews,
           COALESCE(d.n, 0) AS discussions,
           COALESCE(p.n, 0) AS posts
         FROM users u
         LEFT JOIN (
           SELECT user_id,
             SUM(CASE WHEN status='read' THEN 1 ELSE 0 END) AS reads,
             SUM(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) AS ratings,
             SUM(CASE WHEN review IS NOT NULL AND review != '' THEN 1 ELSE 0 END) AS reviews
           FROM shelf GROUP BY user_id
         ) sh ON sh.user_id = u.id
         LEFT JOIN (SELECT user_id, COUNT(*) AS n FROM discussions GROUP BY user_id) d ON d.user_id = u.id
         LEFT JOIN (SELECT user_id, COUNT(*) AS n FROM discussion_posts GROUP BY user_id) p ON p.user_id = u.id
         WHERE COALESCE(sh.reads,0)+COALESCE(sh.ratings,0)+COALESCE(sh.reviews,0)+COALESCE(d.n,0)+COALESCE(p.n,0) > 0
         LIMIT 500`
      ).all(),
      // Per-book read history (for "favorite genre" + "books read in year Y") —
      // aggregated in JS below since the dataset is small enough that a second
      // SQL pass per stat would be more complex than it's worth.
      db.prepare(`SELECT user_id, finished_at, book_slug FROM shelf WHERE status = 'read'`).all(),
    ]);
    const categoryBySlug = await getBooksBySlug(shelfBooks.results.map((r) => r.book_slug), "en", "slug, category");

    const perUser = new Map();
    for (const row of shelfBooks.results) {
      const agg = perUser.get(row.user_id) || { years: {}, genres: {} };
      if (row.finished_at) {
        const y = new Date(row.finished_at).getFullYear();
        if (!Number.isNaN(y)) agg.years[y] = (agg.years[y] || 0) + 1;
      }
      const category = categoryBySlug.get(row.book_slug)?.category;
      if (category) agg.genres[category] = (agg.genres[category] || 0) + 1;
      perUser.set(row.user_id, agg);
    }

    const readers = base.results.map((r) => {
      const agg = perUser.get(r.id) || { years: {}, genres: {} };
      const favoriteGenre = Object.entries(agg.genres).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      const points = pointsFor(r);
      return {
        ...r, points, level: levelFor(points), favoriteGenre,
        yearCounts: agg.years,
        genreCounts: agg.genres,
        badges: badgesFor(r),
      };
    });
    return readers.sort((a, b) => b.points - a.points);
  }, 300);
}

export async function getLeaderboard({ limit = 20, year, minBooks, genre } = {}) {
  let readers = await getRankedReaders();

  if (minBooks) {
    const n = Number(minBooks);
    readers = readers.filter((r) => (year ? (r.yearCounts[year] || 0) : r.reads) >= n);
  }
  if (genre) readers = readers.filter((r) => (r.genreCounts[genre] || 0) > 0);

  return readers.slice(0, limit);
}

// Ranked by follower count, not activity — a separate "who the community
// looks up to" view alongside the activity-based Bookworm Ranking.
export async function getPopularReaders(limit = 20) {
  return cached(`popular-readers:${limit}`, async () => {
    const db = await getDb();
    const { results } = await db.prepare(
      `SELECT u.id, u.name, u.photo_url, u.slug, COUNT(f.user_id) AS followers
       FROM users u JOIN follows f ON f.target_type = 'reader' AND f.target_id = u.id
       GROUP BY u.id ORDER BY followers DESC LIMIT ?1`
    ).bind(limit).all();
    return results;
  }, 300);
}

export async function getUserPreferences(uid) {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM user_preferences WHERE user_id=?1").bind(uid).first();
  return row ? { genres: J(row.genres), onboarded: Boolean(row.onboarded) } : { genres: [], onboarded: false };
}

export async function upsertUserPreferences(uid, { genres, onboarded } = {}) {
  const db = await getDb();
  await db.prepare(
    `INSERT INTO user_preferences (user_id, genres, onboarded, updated_at) VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id) DO UPDATE SET
       genres = COALESCE(?2, genres),
       onboarded = COALESCE(?3, onboarded),
       updated_at = CURRENT_TIMESTAMP`
  ).bind(
    uid,
    genres !== undefined ? JSON.stringify(genres) : null,
    onboarded === undefined ? null : onboarded ? 1 : 0
  ).run();
}

// Admin-editable site config (social links etc.) — cached briefly since it
// rarely changes but should reflect admin edits without a redeploy.
const SETTINGS_DEFAULTS = {
  social_twitter: "", social_instagram: "", social_facebook: "", social_youtube: "", social_goodreads_style: "",
  amazon_assoc_tag: "",
};

export async function getSiteSettings() {
  // Already invalidate()'d on every admin write (see updateSiteSettings
  // below), so a long TTL costs nothing on real freshness — an admin change
  // still shows up on the very next request either way. This is one of the
  // most-called cached functions in the whole app (every book/author/
  // publisher fetch pulls the Amazon associate tag from it), so a short
  // default TTL here meant near-constant re-reads.
  return cached("site:settings", async () => {
    const db = await getDb();
    const { results } = await db.prepare("SELECT key, value FROM site_settings").all();
    const map = { ...SETTINGS_DEFAULTS };
    for (const r of results) map[r.key] = r.value;
    return map;
  }, 10800);
}

export async function updateSiteSettings(patch) {
  const db = await getDb();
  const entries = Object.entries(patch);
  await db.batch(
    entries.map(([key, value]) =>
      db.prepare("INSERT INTO site_settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value=?2")
        .bind(key, value ?? "")
    )
  );
  await invalidate("site:settings");
}

// Platform-wide trust stats for the footer trust bar.
// Books/authors come from `catalog_counts` — a single maintained row, read
// in ONE row lookup instead of three full-table COUNT(*) scans. The import
// worker increments it as rows land (see upsertBatch in the cron worker),
// so the number stays live without anything ever counting on read.
//
// Reviews/readers still count: they live in the small user database (a few
// rows today, and they grow only when a real person acts), so a scan there
// costs almost nothing — not worth maintaining a counter for.
export async function getPlatformStats() {
  // Key is versioned (":v2") deliberately. The previous version of this
  // function cached under "platform:stats" with a 3-hour TTL, and a KV entry
  // keeps its original expiry no matter what TTL a later caller passes — so
  // on deploy the new 60-second logic would have kept serving that stale
  // 3-hour entry for up to 3 more hours, and the stat bar would have looked
  // frozen (confirmed live: KV held books:5240 while the real counter was
  // already at 5336). A new key sidesteps the old entry entirely instead of
  // needing a manual KV purge. Bump the suffix again if the shape changes.
  return cached("platform:stats:v2", async () => {
    const [db, catalogDb] = await Promise.all([getDb(), getCatalogDb()]);
    const [counts, reviews, readers] = await Promise.all([
      catalogDb.prepare("SELECT books, authors FROM catalog_counts WHERE id = 1").first(),
      db.prepare("SELECT COUNT(*) AS n FROM shelf WHERE review IS NOT NULL AND review != ''").first(),
      db.prepare("SELECT COUNT(*) AS n FROM users").first(),
    ]);

    // Falls back to real counts if the row hasn't been seeded yet (fresh
    // environment, or the table was just created) — better a one-off scan
    // than a stat bar reading zero.
    let books = counts?.books ?? 0;
    let authors = counts?.authors ?? 0;
    if (!books && !authors) {
      const [b, a] = await Promise.all([
        catalogDb.prepare("SELECT COUNT(*) AS n FROM books").first(),
        catalogDb.prepare("SELECT COUNT(*) AS n FROM authors").first(),
      ]);
      books = b?.n || 0;
      authors = a?.n || 0;
      await catalogDb.prepare(
        `INSERT INTO catalog_counts (id, books, authors, publications)
         VALUES (1, ?1, ?2, (SELECT COUNT(*) FROM publications))
         ON CONFLICT(id) DO UPDATE SET books = ?1, authors = ?2`
      ).bind(books, authors).run().catch(() => {});
    }
    return { books, authors, reviews: reviews.n, readers: readers.n };
    // Short TTL on purpose. This used to sit at 3 hours because getting these
    // numbers meant COUNT(*) scans over the whole catalog — expensive enough
    // that a stale figure was the lesser evil. Now books/authors are a single
    // maintained row and the other two are tiny user-database lookups, so the
    // whole call is a handful of rows and the stat bar can track the import in
    // near-real time instead of lagging hours behind.
    //
    // Not left completely uncached: the footer renders this on EVERY page, and
    // crawlers are effectively all of this site's traffic — a minute of
    // caching collapses a whole crawl pass into one read while still looking
    // live to a person watching books land.
  }, 60);
}

// Starting a discussion requires a book or author to be picked first — the
// title/tags/description come after, and there is deliberately no
// attachment/image support.
export async function createDiscussion(userId, { title, body, bookSlug, authorSlug, tags }) {
  const db = await getDb();
  const res = await db.prepare(
    "INSERT INTO discussions (user_id, title, body, book_slug, author_slug, tags) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
  ).bind(userId, title, body || null, bookSlug || null, authorSlug || null, tags?.length ? JSON.stringify(tags) : null).run();
  const id = res.meta.last_row_id;
  await db.prepare("INSERT INTO discussion_members (discussion_id, user_id) VALUES (?1, ?2)").bind(id, userId).run();
  await notifyMatchingReaders(id, { bookSlug, authorSlug, creatorId: userId });
  return id;
}

export async function addDiscussionPost(discussionId, userId, body) {
  const db = await getDb();
  await db.prepare(
    "INSERT INTO discussion_posts (discussion_id, user_id, body) VALUES (?1, ?2, ?3)"
  ).bind(discussionId, userId, body).run();
  await db.prepare(
    "UPDATE discussion_members SET last_read_at=CURRENT_TIMESTAMP WHERE discussion_id=?1 AND user_id=?2"
  ).bind(discussionId, userId).run();
}

// Real personalization, computed server-side from a reader's actual
// history — not a single random "seed" book (the old client-side ForYou
// logic) and not limited to whatever page of the catalog happened to load.
// Signals, weighted:
//   - category/genre overlap with everything on the shelf (read counts 3x,
//     reading 2x, want-to-read 1x — a finished book is a stronger signal
//     than something merely bookmarked)
//   - the genres picked during onboarding (user_preferences) — an explicit
//     signal that's otherwise never used anywhere after onboarding
//   - repeat-author matches, weighted highest (someone who's read 2 James
//     Clear books is very likely to want a 3rd)
// Every returned book carries a `reason` so the UI can show *why* it was
// picked, not just present it as an opaque black box.
export async function getRecommendations(uid, lang, limit = 12) {
  const db = await getDb();
  const catalogDb = await getCatalogDb();

  const [{ results: shelfRows }, prefs] = await Promise.all([
    db.prepare("SELECT book_slug, status FROM shelf WHERE user_id=?1").bind(uid).all(),
    getUserPreferences(uid),
  ]);
  if (!shelfRows.length && !prefs.genres.length) return { picks: [], basis: null };

  const shelfBooks = await getBooksBySlug(shelfRows.map((r) => r.book_slug), lang, "slug, category, genres, author, rating");
  const STATUS_WEIGHT = { read: 3, reading: 2, want: 1 };

  const categoryScores = new Map();
  const genreScores = new Map();
  const authorScores = new Map();
  const bump = (map, key, n) => { if (key) map.set(key, (map.get(key) || 0) + n); };

  for (const row of shelfRows) {
    const b = shelfBooks.get(row.book_slug);
    if (!b) continue;
    const weight = STATUS_WEIGHT[row.status] || 1;
    bump(categoryScores, b.category, weight);
    bump(authorScores, b.author, weight);
    for (const g of J(b.genres)) bump(genreScores, g, weight);
  }
  // Onboarding picks are an explicit signal, not inferred — worth as much
  // as having finished a book in that genre.
  for (const g of prefs.genres) bump(genreScores, g, 3);

  const owned = new Set(shelfRows.map((r) => r.book_slug));
  const { results: candidates } = await catalogDb.prepare(
    "SELECT slug, title, author, category, genres, rating, cover_url FROM books WHERE lang=?1 ORDER BY rating DESC LIMIT 500"
  ).bind(lang).all();

  const scored = candidates
    .filter((b) => !owned.has(b.slug))
    .map((b) => {
      const authorScore = (authorScores.get(b.author) || 0) * 2; // repeat-author is the strongest signal
      const categoryScore = categoryScores.get(b.category) || 0;
      const genres = J(b.genres);
      const genreScore = genres.reduce((sum, g) => sum + (genreScores.get(g) || 0), 0);
      const score = authorScore + categoryScore + genreScore + (b.rating || 0) / 10; // rating only breaks ties
      let reason = null;
      if (authorScore > 0) reason = `More by ${b.author}`;
      else if (genreScore >= categoryScore && genreScore > 0) {
        const topGenre = genres.find((g) => genreScores.has(g));
        reason = topGenre ? `Because you like ${topGenre}` : null;
      } else if (categoryScore > 0) reason = `Because you read ${b.category}`;
      return { ...b, genres, score, reason };
    })
    .filter((b) => b.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const topCategory = [...categoryScores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return { picks: scored, basis: topCategory };
}
