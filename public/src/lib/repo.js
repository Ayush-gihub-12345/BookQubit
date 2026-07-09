import { getDb, cached } from "./db";

const J = (v) => {
  try { return v ? JSON.parse(v) : []; } catch { return []; }
};

function mapBook(r) {
  const tag = process.env.AMAZON_ASSOC_TAG;
  return {
    ...r,
    genres: J(r.genres),
    subjects: J(r.subjects),
    tags: J(r.tags),
    keyPoints: J(r.key_points),
    buyUrl: r.amazon_asin && tag
      ? `https://www.amazon.com/dp/${r.amazon_asin}?tag=${tag}`
      : r.amazon_url || null,
  };
}

async function allBooks(lang) {
  return cached(`books:${lang}`, async () => {
    const db = await getDb();
    let { results } = await db
      .prepare("SELECT * FROM books WHERE lang=?1 ORDER BY id")
      .bind(lang).all();
    if (!results.length && lang !== "en") {
      ({ results } = await db
        .prepare("SELECT * FROM books WHERE lang='en' ORDER BY id").all());
    }
    return results;
  });
}

export async function listBooks(lang, { category, collection, tag, q, sort, limit } = {}) {
  let books = (await allBooks(lang)).map(mapBook);
  if (category) books = books.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
  if (collection) books = books.filter((b) => b.collection?.toLowerCase() === collection.toLowerCase());
  if (tag) books = books.filter((b) => b.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  if (q) {
    const s = q.toLowerCase();
    books = books.filter((b) =>
      [b.title, b.author, b.description, b.category].some((f) => f?.toLowerCase().includes(s)) ||
      b.tags.some((t) => t.toLowerCase().includes(s)));
  }
  if (sort === "rating") books = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sort === "new") books = [...books].sort((a, b) => String(b.published || "").localeCompare(String(a.published || "")));
  if (sort === "title") books = [...books].sort((a, b) => a.title.localeCompare(b.title));
  return limit ? books.slice(0, limit) : books;
}

// SQL-level catalog query with real pagination — scales to very large catalogs
// (never loads the full table). Used by the /books browser.
export async function queryBooks(lang, opts = {}) {
  const { q, category, collection, tag, format, country, minRating, sort, page = 1, perPage = 24 } = opts;
  const db = await getDb();

  const where = ["lang = ?"];
  const binds = [lang];
  if (category) { where.push("category = ?"); binds.push(category); }
  if (collection) { where.push("collection = ?"); binds.push(collection); }
  if (format) { where.push("format LIKE ?"); binds.push(`%${format}%`); }
  if (country) { where.push("country = ?"); binds.push(country); }
  if (minRating) { where.push("rating >= ?"); binds.push(Number(minRating)); }
  if (tag) { where.push("tags LIKE ?"); binds.push(`%"${tag}"%`); }
  if (q) {
    where.push("(title LIKE ? OR author LIKE ? OR description LIKE ?)");
    const like = `%${q}%`;
    binds.push(like, like, like);
  }

  const ORDER = {
    rating: "rating DESC NULLS LAST",
    new: "published DESC",
    title: "title COLLATE NOCASE ASC",
    default: "id ASC",
  };
  const orderBy = ORDER[sort] || ORDER.default;
  const wsql = where.join(" AND ");

  const [count, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM books WHERE ${wsql}`).bind(...binds).first(),
    db.prepare(`SELECT * FROM books WHERE ${wsql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...binds, perPage, (page - 1) * perPage).all(),
  ]);

  // Empty language falls back to English with the same filters
  if (!count.n && lang !== "en") return queryBooks("en", opts);

  return {
    books: rows.results.map(mapBook),
    total: count.n,
    page: Number(page),
    pages: Math.max(1, Math.ceil(count.n / perPage)),
  };
}

export async function getBook(slug, lang) {
  const decoded = decodeURIComponent(slug);
  const books = (await allBooks(lang)).map(mapBook);
  const hit = books.find((b) => b.slug === decoded);
  if (hit) return hit;
  // Localized-slug support: the slug may belong to another language's row
  // (e.g. a Devanagari slug opened while the UI language is English).
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM books WHERE slug=?1 LIMIT 1").bind(decoded).first();
  return row ? mapBook(row) : null;
}

// All language variants of a book (matched by ISBN prefix-insensitive title
// fallback) — used for hreflang alternates and the language-switch UX.
export async function getBookAlternates(book) {
  if (!book?.isbn && !book?.title) return [];
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT slug, lang FROM books WHERE (isbn=?1 AND isbn IS NOT NULL) OR title=?2")
    .bind(book.isbn || "", book.title)
    .all();
  return results;
}

export async function relatedBooks(book, lang, limit = 4) {
  const books = await listBooks(lang);
  return books
    .filter((b) => b.id !== book.id && (b.category === book.category || b.author === book.author))
    .slice(0, limit);
}

export async function facets(lang) {
  return cached(`facets:${lang}`, async () => {
    const books = (await allBooks(lang)).map(mapBook);
    const count = (arr) => {
      const m = new Map();
      arr.forEach((v) => v && m.set(v, (m.get(v) || 0) + 1));
      return [...m.entries()].map(([name, n]) => ({ name, count: n }))
        .sort((a, b) => b.count - a.count);
    };
    return {
      categories: count(books.map((b) => b.category)),
      collections: count(books.map((b) => b.collection)),
      countries: count(books.map((b) => b.country)),
      tags: count(books.flatMap((b) => b.tags)),
    };
  });
}

async function listEntity(table, lang, jsonCols) {
  return cached(`${table}:${lang}`, async () => {
    const db = await getDb();
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
  });
}

export const listAuthors = (lang) => listEntity("authors", lang, ["genres"]);
export const listPublications = (lang) => listEntity("publications", lang, ["notable_authors", "imprints"]);
export const listComics = (lang) => listEntity("comics", lang, ["characters", "creators"]);

export async function getAuthor(slug, lang) {
  return (await listAuthors(lang)).find((a) => a.slug === decodeURIComponent(slug)) || null;
}
export async function getPublication(slug, lang) {
  return (await listPublications(lang)).find((p) => p.slug === decodeURIComponent(slug)) || null;
}
export async function getComic(slug, lang) {
  return (await listComics(lang)).find((c) => c.slug === decodeURIComponent(slug)) || null;
}

export async function booksByAuthor(name, lang) {
  const books = await listBooks(lang);
  return books.filter((b) => b.author?.toLowerCase() === name?.toLowerCase());
}

export async function booksByPublisher(name, lang) {
  const books = await listBooks(lang);
  return books.filter((b) => b.publisher?.toLowerCase().includes(name?.toLowerCase()));
}

// ── Bookworm ranking ────────────────────────────────────────────────────────
export const LEVELS = [
  { min: 400, name: "Grand Librarian", icon: "🏛️" },
  { min: 150, name: "Bibliophile", icon: "📚" },
  { min: 50, name: "Bookworm", icon: "🐛" },
  { min: 10, name: "Page Turner", icon: "📖" },
  { min: 0, name: "New Reader", icon: "🌱" },
];
export const levelFor = (points) => LEVELS.find((l) => points >= l.min);
export const pointsFor = (r) =>
  (r.reads || 0) * 10 + (r.reviews || 0) * 5 + (r.ratings || 0) * 2 +
  (r.discussions || 0) * 3 + (r.posts || 0) * 1;

// Community stats + reviews for one book (drives the book-page social section)
export async function getBookCommunity(slug) {
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
      `SELECT s.rating, s.review, s.status, s.spoiler, s.updated_at, u.id AS user_id, u.name, u.photo_url
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
}

// Latest community activity — only public-worthy events (finished books,
// ratings, reviews). Private shelf intents like "want to read" stay private.
export async function getRecentActivity(limit = 12) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT s.book_slug, s.status, s.rating, s.review, s.updated_at,
            u.id AS user_id, u.name, u.photo_url,
            b.title, b.cover_url
     FROM shelf s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN books b ON b.slug = s.book_slug AND b.lang='en'
     WHERE s.status='read' OR s.rating IS NOT NULL OR s.review IS NOT NULL
     ORDER BY s.updated_at DESC LIMIT ?1`
  ).bind(limit).all();
  return results;
}

export async function listDiscussions(limit = 30) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT d.*, u.name, u.photo_url,
       (SELECT COUNT(*) FROM discussion_posts p WHERE p.discussion_id = d.id) AS replies,
       b.title AS book_title
     FROM discussions d
     JOIN users u ON u.id = d.user_id
     LEFT JOIN books b ON b.slug = d.book_slug AND b.lang='en'
     ORDER BY d.created_at DESC LIMIT ?1`
  ).bind(limit).all();
  return results;
}

export async function getDiscussion(id) {
  const db = await getDb();
  const [thread, posts] = await Promise.all([
    db.prepare(
      `SELECT d.*, u.name, u.photo_url FROM discussions d JOIN users u ON u.id=d.user_id WHERE d.id=?1`
    ).bind(id).first(),
    db.prepare(
      `SELECT p.*, u.name, u.photo_url FROM discussion_posts p JOIN users u ON u.id=p.user_id
       WHERE p.discussion_id=?1 ORDER BY p.created_at ASC`
    ).bind(id).all(),
  ]);
  return thread ? { ...thread, posts: posts.results } : null;
}

// Public profile: user info + full shelf with book data
export async function getUserProfile(uid) {
  const db = await getDb();
  const [user, shelf] = await Promise.all([
    db.prepare("SELECT * FROM users WHERE id=?1").bind(uid).first(),
    db.prepare(
      `SELECT s.*, b.title, b.author, b.cover_url
       FROM shelf s LEFT JOIN books b ON b.slug=s.book_slug AND b.lang='en'
       WHERE s.user_id=?1 ORDER BY s.updated_at DESC`
    ).bind(uid).all(),
  ]);
  if (!user) return null;
  return { user, shelf: shelf.results };
}

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT u.id, u.name, u.photo_url,
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
  ).all();
  return results
    .map((r) => ({ ...r, points: pointsFor(r), level: levelFor(pointsFor(r)) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

export async function createDiscussion(userId, { title, body, bookSlug }) {
  const db = await getDb();
  const res = await db.prepare(
    "INSERT INTO discussions (user_id, title, body, book_slug) VALUES (?1, ?2, ?3, ?4)"
  ).bind(userId, title, body, bookSlug || null).run();
  return res.meta.last_row_id;
}

export async function addDiscussionPost(discussionId, userId, body) {
  const db = await getDb();
  await db.prepare(
    "INSERT INTO discussion_posts (discussion_id, user_id, body) VALUES (?1, ?2, ?3)"
  ).bind(discussionId, userId, body).run();
}
