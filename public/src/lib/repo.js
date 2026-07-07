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
export const pointsFor = (r) => (r.reads || 0) * 10 + (r.ratings || 0) * 2 + (r.reviews || 0) * 5;

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT u.id, u.name, u.photo_url,
       SUM(CASE WHEN s.status='read' THEN 1 ELSE 0 END) AS reads,
       SUM(CASE WHEN s.rating IS NOT NULL THEN 1 ELSE 0 END) AS ratings,
       SUM(CASE WHEN s.review IS NOT NULL THEN 1 ELSE 0 END) AS reviews
     FROM shelf s JOIN users u ON u.id = s.user_id
     GROUP BY u.id ORDER BY reads DESC, ratings DESC LIMIT ?1`
  ).bind(limit).all();
  return results
    .map((r) => ({ ...r, points: pointsFor(r), level: levelFor(pointsFor(r)) }))
    .sort((a, b) => b.points - a.points);
}
