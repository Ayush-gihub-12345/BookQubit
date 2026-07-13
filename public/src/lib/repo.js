import { getDb, cached, invalidate } from "./db";

const J = (v) => {
  try { return v ? JSON.parse(v) : []; } catch { return []; }
};

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
  books = limit ? books.slice(0, limit) : books;
  return books;
}

// SQL-level catalog query with real pagination — scales to very large catalogs
// (never loads the full table). Used by the /books browser.
export async function queryBooks(lang, opts = {}) {
  const { q, category, collection, tag, format, country, minRating, mood, sort, page = 1, perPage = 32 } = opts;
  const db = await getDb();

  const where = ["lang = ?"];
  const binds = [lang];
  if (category) { where.push("category = ?"); binds.push(category); }
  if (collection) { where.push("collection = ?"); binds.push(collection); }
  if (format) { where.push("format LIKE ?"); binds.push(`%${format}%`); }
  if (country) { where.push("country = ?"); binds.push(country); }
  if (minRating) { where.push("rating >= ?"); binds.push(Number(minRating)); }
  if (tag) { where.push("tags LIKE ?"); binds.push(`%"${tag}"%`); }
  // Mood/pace come from what readers actually felt while reading (shelf.moods),
  // not book metadata — StoryGraph-style discovery instead of genre-only.
  if (mood) { where.push("slug IN (SELECT DISTINCT book_slug FROM shelf WHERE moods LIKE ?)"); binds.push(`%"${mood}"%`); }
  if (q) {
    where.push("(title LIKE ? OR author LIKE ? OR description LIKE ?)");
    const like = `%${q}%`;
    binds.push(like, like, like);
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

  let [count, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS n FROM books WHERE ${wsql}`).bind(...binds).first(),
    db.prepare(`SELECT * FROM books WHERE ${wsql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .bind(...binds, perPage, (page - 1) * perPage).all(),
  ]);

  // Empty language falls back to English rows with the same filters.
  if (!count.n && lang !== "en") {
    const enBinds = [...binds];
    enBinds[0] = "en";
    [count, rows] = await Promise.all([
      db.prepare(`SELECT COUNT(*) AS n FROM books WHERE ${wsql}`).bind(...enBinds).first(),
      db.prepare(`SELECT * FROM books WHERE ${wsql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
        .bind(...enBinds, perPage, (page - 1) * perPage).all(),
    ]);
  }

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
// "Recently added to BookQubit" — ordered by when the row was created, not
// by the book's publication year (that's the separate "New Releases" sort).
export async function getRecentlyAdded(lang, limit = 8) {
  const books = await cached(`recent-added:${lang}:${limit}`, async () => {
    const db = await getDb();
    let { results } = await db
      .prepare("SELECT * FROM books WHERE lang=?1 ORDER BY created_at DESC, id DESC LIMIT ?2")
      .bind(lang, limit).all();
    if (!results.length && lang !== "en") {
      ({ results } = await db
        .prepare("SELECT * FROM books WHERE lang='en' ORDER BY created_at DESC, id DESC LIMIT ?1")
        .bind(limit).all());
    }
    return results.map(mapBook);
  }, 300);
  return books;
}

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
  }, 600);
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
}

// Latest community activity — only public-worthy events (finished books,
// ratings, reviews). Private shelf intents like "want to read" stay private.
export async function getRecentActivity(limit = 12) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT s.book_slug, s.status, s.rating, s.review, s.updated_at,
            u.id AS user_id, u.name, u.photo_url, u.slug,
            b.title, b.cover_url
     FROM shelf s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN books b ON b.slug = s.book_slug AND b.lang='en'
     WHERE s.status='read' OR s.rating IS NOT NULL OR s.review IS NOT NULL
     ORDER BY s.updated_at DESC LIMIT ?1`
  ).bind(limit).all();
  return results;
}

export async function listDiscussions(limit = 30, { q } = {}) {
  const db = await getDb();
  const where = q ? "WHERE d.title LIKE ?2 OR d.tags LIKE ?2" : "";
  const binds = q ? [limit, `%${q}%`] : [limit];
  const { results } = await db.prepare(
    `SELECT d.*, u.name, u.photo_url, u.slug,
       (SELECT COUNT(*) FROM discussion_posts p WHERE p.discussion_id = d.id) AS replies,
       (SELECT COUNT(*) FROM discussion_members m WHERE m.discussion_id = d.id AND m.active = 1) AS members,
       b.title AS book_title, a.name AS author_name
     FROM discussions d
     JOIN users u ON u.id = d.user_id
     LEFT JOIN books b ON b.slug = d.book_slug AND b.lang = 'en'
     LEFT JOIN authors a ON a.slug = d.author_slug AND a.lang = 'en'
     ${where}
     ORDER BY d.created_at DESC LIMIT ?1`
  ).bind(...binds).all();
  return results.map((r) => ({ ...r, tags: J(r.tags) }));
}

// Discussions a specific reader can see joining/leaving/messaging on — includes
// their own membership row (null if they've never interacted with it) so the
// UI knows whether to show Join, Open, or "rejoin blocked".
export async function getDiscussion(id, uid) {
  const db = await getDb();
  const [thread, posts, member] = await Promise.all([
    db.prepare(
      `SELECT d.*, u.name, u.photo_url, u.slug, b.title AS book_title, a.name AS author_name
       FROM discussions d
       JOIN users u ON u.id=d.user_id
       LEFT JOIN books b ON b.slug=d.book_slug AND b.lang='en'
       LEFT JOIN authors a ON a.slug=d.author_slug AND a.lang='en'
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
  return { ...thread, tags: J(thread.tags), posts: posts.results, membership: member || null };
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
       b.title AS book_title, a.name AS author_name,
       (SELECT COUNT(*) FROM discussion_posts p WHERE p.discussion_id=d.id AND p.created_at > m.last_read_at AND p.user_id != ?1) AS unread,
       (SELECT p.body FROM discussion_posts p WHERE p.discussion_id=d.id ORDER BY p.created_at DESC LIMIT 1) AS last_message,
       (SELECT p.created_at FROM discussion_posts p WHERE p.discussion_id=d.id ORDER BY p.created_at DESC LIMIT 1) AS last_message_at
     FROM discussion_members m
     JOIN discussions d ON d.id = m.discussion_id
     LEFT JOIN books b ON b.slug=d.book_slug AND b.lang='en'
     LEFT JOIN authors a ON a.slug=d.author_slug AND a.lang='en'
     WHERE m.user_id=?1 AND m.active=1
     ORDER BY COALESCE(last_message_at, d.created_at) DESC`
  ).bind(uid).all();
  return results.map((r) => ({ ...r, tags: J(r.tags) }));
}

// Discovery/search for discussions to join — annotated with the viewer's own
// membership state so the UI can grey out threads they're locked out of.
export async function searchDiscussions(q, uid, limit = 30) {
  const db = await getDb();
  const like = `%${q || ""}%`;
  const { results } = await db.prepare(
    `SELECT d.*, u.name, u.photo_url, u.slug, b.title AS book_title, a.name AS author_name,
       (SELECT COUNT(*) FROM discussion_members m WHERE m.discussion_id=d.id AND m.active=1) AS members,
       mine.active AS my_active, mine.exit_count AS my_exit_count
     FROM discussions d
     JOIN users u ON u.id=d.user_id
     LEFT JOIN books b ON b.slug=d.book_slug AND b.lang='en'
     LEFT JOIN authors a ON a.slug=d.author_slug AND a.lang='en'
     LEFT JOIN discussion_members mine ON mine.discussion_id=d.id AND mine.user_id=?2
     WHERE d.title LIKE ?1 OR d.tags LIKE ?1
     ORDER BY d.created_at DESC LIMIT ?3`
  ).bind(like, uid || "", limit).all();
  return results.map((r) => ({ ...r, tags: J(r.tags) }));
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
    const b = await db.prepare("SELECT category FROM books WHERE slug=?1 AND lang='en'").bind(bookSlug).first();
    genre = b?.category || null;
  } else if (authorSlug) {
    const a = await db.prepare("SELECT genres FROM authors WHERE slug=?1 AND lang='en'").bind(authorSlug).first();
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
       b.title AS book_title, a.name AS author_name, u.name AS starter_name
     FROM discussion_notifications n
     JOIN discussions d ON d.id = n.discussion_id
     JOIN users u ON u.id = d.user_id
     LEFT JOIN books b ON b.slug=d.book_slug AND b.lang='en'
     LEFT JOIN authors a ON a.slug=d.author_slug AND a.lang='en'
     WHERE n.user_id=?1 AND n.status='pending'
     ORDER BY n.created_at DESC`
  ).bind(uid).all();
  return results.map((r) => ({ ...r, tags: J(r.tags) }));
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
  const { results: books } = await db.prepare(
    `SELECT s.*, b.title, b.author, b.cover_url, b.category, b.page_count
     FROM shelf s LEFT JOIN books b ON b.slug = s.book_slug AND b.lang = 'en'
     WHERE s.user_id=?1 AND s.status='read' AND strftime('%Y', COALESCE(s.finished_at, s.updated_at)) = ?2`
  ).bind(uid, String(year)).all();

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
    `SELECT s.*, b.title, b.author, b.cover_url
     FROM shelf s LEFT JOIN books b ON b.slug=s.book_slug AND b.lang='en'
     WHERE s.user_id=?1 ORDER BY s.updated_at DESC`
  ).bind(user.id).all();
  return { user, shelf: shelf.results };
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
    `SELECT q.*, b.title, b.author, b.cover_url FROM quotes q
     LEFT JOIN books b ON b.slug = q.book_slug AND b.lang = 'en'
     WHERE q.user_id = ?1 ORDER BY q.created_at DESC LIMIT ?2`
  ).bind(uid, limit).all();
  return results;
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
    db.prepare(
      `SELECT DISTINCT b.category FROM shelf s JOIN books b ON b.slug=s.book_slug AND b.lang='en'
       WHERE s.user_id=?1 AND s.status='read' AND b.category IS NOT NULL`
    ).bind(uid).all(),
    db.prepare("SELECT DISTINCT substr(updated_at,1,10) AS d FROM shelf WHERE user_id=?1 ORDER BY d DESC LIMIT 400").bind(uid).all(),
  ]);

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
    genres: genreRows.results.length,
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

export async function getLeaderboard({ limit = 20, year, minBooks, genre } = {}) {
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
    db.prepare(
      `SELECT s.user_id, s.finished_at, b.category
       FROM shelf s LEFT JOIN books b ON b.slug = s.book_slug AND b.lang = 'en'
       WHERE s.status = 'read'`
    ).all(),
  ]);

  const perUser = new Map();
  for (const row of shelfBooks.results) {
    const agg = perUser.get(row.user_id) || { years: {}, genres: {} };
    if (row.finished_at) {
      const y = new Date(row.finished_at).getFullYear();
      if (!Number.isNaN(y)) agg.years[y] = (agg.years[y] || 0) + 1;
    }
    if (row.category) agg.genres[row.category] = (agg.genres[row.category] || 0) + 1;
    perUser.set(row.user_id, agg);
  }

  let readers = base.results.map((r) => {
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

  if (minBooks) {
    const n = Number(minBooks);
    readers = readers.filter((r) => (year ? (r.yearCounts[year] || 0) : r.reads) >= n);
  }
  if (genre) readers = readers.filter((r) => (r.genreCounts[genre] || 0) > 0);

  return readers.sort((a, b) => b.points - a.points).slice(0, limit);
}

// Ranked by follower count, not activity — a separate "who the community
// looks up to" view alongside the activity-based Bookworm Ranking.
export async function getPopularReaders(limit = 20) {
  const db = await getDb();
  const { results } = await db.prepare(
    `SELECT u.id, u.name, u.photo_url, u.slug, COUNT(f.user_id) AS followers
     FROM users u JOIN follows f ON f.target_type = 'reader' AND f.target_id = u.id
     GROUP BY u.id ORDER BY followers DESC LIMIT ?1`
  ).bind(limit).all();
  return results;
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
};

export async function getSiteSettings() {
  return cached("site:settings", async () => {
    const db = await getDb();
    const { results } = await db.prepare("SELECT key, value FROM site_settings").all();
    const map = { ...SETTINGS_DEFAULTS };
    for (const r of results) map[r.key] = r.value;
    return map;
  }, 120);
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
export async function getPlatformStats() {
  return cached("platform:stats", async () => {
    const db = await getDb();
    const [books, authors, reviews, readers] = await Promise.all([
      db.prepare("SELECT COUNT(DISTINCT slug) AS n FROM books").first(),
      db.prepare("SELECT COUNT(*) AS n FROM authors").first(),
      db.prepare("SELECT COUNT(*) AS n FROM shelf WHERE review IS NOT NULL AND review != ''").first(),
      db.prepare("SELECT COUNT(*) AS n FROM users").first(),
    ]);
    return { books: books.n, authors: authors.n, reviews: reviews.n, readers: readers.n };
  }, 900);
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
