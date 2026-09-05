import { getCloudflareContext } from "@opennextjs/cloudflare";

// Two D1 databases: `catalog` holds the large, mostly-static reference data
// (books/authors/publications/comics + the bulk-import pipeline tables), and
// `database` holds everything else (users, social, moderation). They're
// split so the catalog's growth toward D1's free per-database storage cap
// never competes with user data's own cap — see getCatalogDb() below.
//
// Neither schema uses real SQL FOREIGN KEY constraints, so tables in one DB
// that reference rows in the other (e.g. shelf.book_slug, quotes.book_slug)
// are just plain TEXT columns — there's nothing to break across databases.
// Anywhere that needs a book's title/cover alongside one of these rows has
// to do it as two queries (fetch the referencing rows, then batch-fetch the
// matching catalog rows by slug) instead of a SQL JOIN.

// Schema lives in code: applied automatically on first DB access after every
// deploy (CREATE TABLE IF NOT EXISTS is a no-op when tables already exist).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  photo_url TEXT,
  slug TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shelf (
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'want',
  rating INTEGER,
  review TEXT,
  progress INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_slug)
);
CREATE INDEX IF NOT EXISTS idx_shelf_user ON shelf(user_id);
CREATE INDEX IF NOT EXISTS idx_shelf_status ON shelf(status);

CREATE TABLE IF NOT EXISTS goals (
  user_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  target INTEGER NOT NULL DEFAULT 12,
  PRIMARY KEY (user_id, year)
);

CREATE TABLE IF NOT EXISTS discussions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  book_slug TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_disc_created ON discussions(created_at DESC);

CREATE TABLE IF NOT EXISTS discussion_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discussion_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dposts_disc ON discussion_posts(discussion_id);

-- Chat-style membership: who's in a discussion, whether they've archived it,
-- how many times they've left (capped at 2 — a third exit is blocked so
-- people can't join/leave repeatedly), and their read cursor for unread counts.
CREATE TABLE IF NOT EXISTS discussion_members (
  discussion_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  exit_count INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  last_read_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (discussion_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_discmembers_user ON discussion_members(user_id, active);

-- Preference-matched discussion alerts — created when a new discussion's
-- book/author genre overlaps a reader's saved preferences.
CREATE TABLE IF NOT EXISTS discussion_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  discussion_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_discnotif_user ON discussion_notifications(user_id, status);

CREATE TABLE IF NOT EXISTS follows (
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_target ON follows(target_type, target_id);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email TEXT PRIMARY KEY,
  lang TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Generic admin-editable key/value config (social links, site-wide toggles).
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_slug TEXT,
  user_id TEXT,
  message TEXT NOT NULL,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_resolved ON reports(resolved);

-- Reading preferences collected during onboarding (favorite genres) — also
-- editable later from the account page. Drives personalized recommendations
-- and the nav's "Favorite Genres" quick links.
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  genres TEXT,
  onboarded INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Reader-saved favorite passages — shown on the book page and the reader's
-- public profile, like a lightweight commonplace book.
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  text TEXT NOT NULL,
  page INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quotes_book ON quotes(book_slug);
CREATE INDEX IF NOT EXISTS idx_quotes_user ON quotes(user_id);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contact_resolved ON contact_messages(resolved);

-- Reader-submitted "please add this book" requests — how the catalog grows
-- from what people actually want, reviewed by an admin (pending/added/declined).
CREATE TABLE IF NOT EXISTS book_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  title TEXT NOT NULL,
  author TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON book_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user ON book_requests(user_id);

-- One row per outstanding 6-digit email verification code (sent right
-- after email/password sign-up — Google sign-in skips this entirely, since
-- Google has already verified that address). The code itself is never
-- stored in plain text: only its SHA-256 hash, so reading this table (a DB
-- export, a bug, a compromised admin session) never hands out a usable
-- code. attempts caps brute-forcing a 6-digit space before expiry.
CREATE TABLE IF NOT EXISTS email_verifications (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Durable backing store for cached() (see the cache section at the bottom of
-- this file). One row per cache key; a hit costs a single indexed row read,
-- versus re-running an aggregate that can scan the entire books table. This
-- replaced KV, whose free-tier 1,000-writes/day cap was being exhausted daily
-- and silently turning every cached() call back into an uncached D1 read.
CREATE TABLE IF NOT EXISTS app_cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_app_cache_expires ON app_cache(expires_at);
`;

// The large, mostly-static reference catalog — kept in its own D1 database
// (binding CATALOG_DB) so its growth toward D1's per-database storage cap
// never eats into user/social data's own cap. See getCatalogDb() below.
const CATALOG_SCHEMA = `
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  isbn TEXT,
  published TEXT,
  page_count INTEGER,
  format TEXT,
  description TEXT,
  summary TEXT,
  category TEXT,
  collection TEXT,
  genres TEXT,
  subjects TEXT,
  tags TEXT,
  key_points TEXT,
  rating REAL,
  cover_url TEXT,
  country TEXT,
  amazon_asin TEXT,
  amazon_url TEXT,
  featured INTEGER DEFAULT 0,
  bestseller INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_books_lang ON books(lang);
CREATE INDEX IF NOT EXISTS idx_books_cat ON books(lang, category);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(lang, rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_collection ON books(lang, collection);
CREATE INDEX IF NOT EXISTS idx_books_country ON books(lang, country);
CREATE INDEX IF NOT EXISTS idx_books_created ON books(lang, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(lang, featured);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(lang, author);
-- Composite (filter + sort) indexes for relatedBooks, which runs on every
-- book page view. Including the rating column lets SQLite satisfy both the
-- WHERE and the ORDER BY from one index and stop after LIMIT rows, instead
-- of scanning. Measured live: this took a niche-category lookup from 5,121
-- rows read to 0, and a common-category one from 95 to 4. See relatedBooks
-- in repo.js for the full before/after numbers.
CREATE INDEX IF NOT EXISTS idx_books_cat_rating ON books(lang, category, rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_author_rating ON books(lang, author, rating DESC);

CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  birth_year INTEGER,
  country TEXT,
  bio TEXT,
  famous_work TEXT,
  genres TEXT,
  image_url TEXT,
  wikipedia_url TEXT,
  website_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_authors_lang ON authors(lang);

CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  about TEXT,
  logo_url TEXT,
  founded TEXT,
  headquarters TEXT,
  website TEXT,
  type TEXT,
  notable_authors TEXT,
  imprints TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_pubs_lang ON publications(lang);

CREATE TABLE IF NOT EXISTS comics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  category TEXT,
  publisher TEXT,
  publication_date TEXT,
  cover_price TEXT,
  format TEXT,
  characters TEXT,
  creators TEXT,
  description TEXT,
  cover_url TEXT,
  value_today TEXT,
  fun_fact TEXT,
  rating REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_comics_lang ON comics(lang);

-- The bulk-import queue itself, staged entirely in D1 (no R2/external
-- storage needed) — each row is one small batch of pre-filtered, deduped
-- books as a JSON blob. Uploading the whole queue is a handful of row
-- writes (one per chunk), not one per book. The cron worker expands a few
-- unconsumed chunks into real 'books' rows on each run, at a controlled pace.
CREATE TABLE IF NOT EXISTS import_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chunk_data TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  consumed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_import_chunks_consumed ON import_chunks(consumed);

-- Cumulative counters + last-run bookkeeping for the bulk-import cron —
-- single row (id=1) since there's one active import stream at a time.
-- daily_cap/imported_today/today_date let both the scheduled cron and a
-- manual "Run now" trigger refuse to run once the day's write budget is
-- used up, regardless of who or what asked for another run.
CREATE TABLE IF NOT EXISTS import_progress (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_imported INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_authors_imported INTEGER DEFAULT 0,
  total_publishers_imported INTEGER DEFAULT 0,
  last_run_at TEXT,
  last_status TEXT,
  daily_cap INTEGER DEFAULT 50000,
  imported_today INTEGER DEFAULT 0,
  today_date TEXT
);

-- Rotation cursor for the cron worker's live Open Library search-API fetch
-- (no local download/prep needed) — remembers which subject query and page
-- offset to resume from next run, cycling through a fixed subject list
-- forever so coverage keeps growing instead of re-fetching the same page.
CREATE TABLE IF NOT EXISTS ol_fetch_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  query_index INTEGER DEFAULT 0,
  offset_val INTEGER DEFAULT 0
);

-- Running totals for the site's stat bar, maintained on write by the import
-- worker (see upsertBatch in bulk-import/cron-worker) instead of counted on
-- read. SQLite stores no row count, so COUNT(*) over books/authors/
-- publications scans every row every time — at catalog scale that was one
-- of the larger recurring read costs for three numbers that change slowly.
-- Single row (id=1). Safe to re-seed from the real tables at any time:
--   UPDATE catalog_counts SET books=(SELECT COUNT(*) FROM books), ...
CREATE TABLE IF NOT EXISTS catalog_counts (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  books INTEGER DEFAULT 0,
  authors INTEGER DEFAULT 0,
  publications INTEGER DEFAULT 0
);
`;

// Additive column migrations for tables that may pre-date these columns.
// Each runs independently and failures ("duplicate column") are expected noise.
const MIGRATIONS = [
  "ALTER TABLE shelf ADD COLUMN started_at TEXT",
  "ALTER TABLE shelf ADD COLUMN finished_at TEXT",
  "ALTER TABLE shelf ADD COLUMN moods TEXT",
  "ALTER TABLE shelf ADD COLUMN pace TEXT",
  "ALTER TABLE shelf ADD COLUMN spoiler INTEGER DEFAULT 0",
  "ALTER TABLE discussions ADD COLUMN author_slug TEXT",
  "ALTER TABLE discussions ADD COLUMN tags TEXT",
  "ALTER TABLE users ADD COLUMN slug TEXT",
  // Google sign-ins are seeded as already-verified (see upsertUser in
  // repo.js) — only email/password accounts start at 0 and go through
  // email_verifications.
  "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0",
];

const CATALOG_MIGRATIONS = [
  "ALTER TABLE authors ADD COLUMN verified INTEGER DEFAULT 0",
  "ALTER TABLE import_progress ADD COLUMN daily_cap INTEGER DEFAULT 50000",
  "ALTER TABLE import_progress ADD COLUMN imported_today INTEGER DEFAULT 0",
  "ALTER TABLE import_progress ADD COLUMN today_date TEXT",
  "ALTER TABLE import_progress ADD COLUMN total_authors_imported INTEGER DEFAULT 0",
  "ALTER TABLE import_progress ADD COLUMN total_publishers_imported INTEGER DEFAULT 0",
  "ALTER TABLE import_progress ADD COLUMN stop_requested INTEGER DEFAULT 0",
  "ALTER TABLE ol_fetch_state ADD COLUMN curated_index INTEGER DEFAULT 0",
  "ALTER TABLE import_progress ADD COLUMN auto_run_enabled INTEGER DEFAULT 0",
  // Tracks whether a continuous self-chaining import loop is currently
  // alive in bulk-import/cron-worker — the per-minute cron watchdog there
  // only starts a fresh chain when this is 0, so it doesn't stack multiple
  // overlapping chains on top of each other.
  "ALTER TABLE import_progress ADD COLUMN chain_running INTEGER DEFAULT 0",
];

let schemaReady;
let catalogSchemaReady;

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env?.DB) {
    throw new Error(
      "D1 binding 'DB' is missing. Add it: Cloudflare dashboard → your Worker → Settings → Bindings → D1 Database, name it exactly DB."
    );
  }
  if (!schemaReady) {
    const statements = SCHEMA.split(";").map((s) => s.trim()).filter(Boolean);
    schemaReady = env.DB
      .batch(statements.map((s) => env.DB.prepare(s)))
      .then(() =>
        Promise.all(MIGRATIONS.map((m) => env.DB.prepare(m).run().catch(() => {})))
      )
      .catch((err) => {
        schemaReady = undefined; // allow retry on next request
        throw err;
      });
  }
  await schemaReady;
  return env.DB;
}

// The catalog database — books/authors/publications/comics + the bulk-import
// pipeline tables. Split from getDb() so this data's growth toward D1's
// per-database storage cap is tracked and billed separately from user data.
export async function getCatalogDb() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env?.CATALOG_DB) {
    throw new Error(
      "D1 binding 'CATALOG_DB' is missing. Add it: Cloudflare dashboard → your Worker → Settings → Bindings → D1 Database, name it exactly CATALOG_DB."
    );
  }
  if (!catalogSchemaReady) {
    const statements = CATALOG_SCHEMA.split(";").map((s) => s.trim()).filter(Boolean);
    catalogSchemaReady = env.CATALOG_DB
      .batch(statements.map((s) => env.CATALOG_DB.prepare(s)))
      .then(() =>
        Promise.all(CATALOG_MIGRATIONS.map((m) => env.CATALOG_DB.prepare(m).run().catch(() => {})))
      )
      .catch((err) => {
        catalogSchemaReady = undefined; // allow retry on next request
        throw err;
      });
  }
  await catalogSchemaReady;
  return env.CATALOG_DB;
}

// ---------------------------------------------------------------------------
// Read-through cache — three tiers, no KV.
//
//   L1  in-isolate memory   free, instant, dies with the isolate
//   L2  Cloudflare Cache API  free, unmetered, per-colo, survives cold starts
//   L3  D1 `app_cache` table  global, durable, 1 indexed row read per hit
//
// KV used to be L2 and was removed deliberately. Verified from the D1
// dashboard's query analytics: the free tier's 1,000-puts/day KV write cap
// was being exhausted every day by the sheer number of distinct cache keys
// this site produces (per-lang, per-filter, per-sort, per-page, per-book).
// Once kv.put() starts failing, every cached() call silently degrades into
// an *uncached* D1 read — which is exactly how a handful of aggregate
// queries came to read millions of rows/day with almost no real visitors
// (`SELECT ... COUNT(*) ... json_each(books.tags)` alone: 2.83M rows across
// 297 calls, against a 3-hour TTL that should have allowed ~8), exhausting
// D1's daily row-read quota and taking the whole site down with
// "Something went wrong" until midnight UTC.
//
// The Cache API has no such write quota, so L2 no longer stops working
// partway through the day. L3 makes a cross-colo cold start cost one row
// read instead of a full-table aggregate.
//
// Two further properties matter as much as the tiering:
//
//  * Stale-while-revalidate. Entries are stored with a logical expiry and a
//    much longer hard retention. Past the logical expiry the stale value is
//    served immediately and refreshed in the background, so an expiring key
//    never lets a burst of traffic through to the expensive query at once —
//    and if the underlying query is failing (D1 over quota), the site keeps
//    serving the last known-good data instead of erroring.
//  * Single-flight. Concurrent misses on the same key share one computation
//    rather than each running the same full scan.
// ---------------------------------------------------------------------------

// Namespace for every cache key, prefixed on both read and write. BUMP THIS
// whenever a cached value's SHAPE changes, even if the key string itself is
// unchanged.
//
// This exists because of a real production incident: a cached value's shape
// changed (an object became an array) under the same key, and cache entries
// outlive a deploy — the newly-deployed code read back an old-shaped value
// from a still-warm entry and threw ("X.map is not a function"), surfacing
// as an unexplained Server Component error on pages visited before the
// deploy. A version bump makes every old entry unreachable instantly across
// all three tiers, instead of relying on remembering to pick a brand-new key
// string by hand every time a function here changes its return shape.
// (v2: storage layer moved off KV, so old KV-era entries are moot anyway.)
const CACHE_VERSION = "v2";

// How long an entry is physically retained beyond its logical TTL, to be
// available as a stale-while-revalidate fallback. A day means a query that
// starts failing (or a D1 quota wall) degrades to slightly-old data rather
// than an error page.
const STALE_GRACE_SECONDS = 86400;

// Size ceilings differ by tier. The Cache API stores large responses without
// trouble, so L2 takes anything up to a generous cap — this matters for the
// genuinely big entries (the sitemap's 40,000 book slugs is a couple of MB,
// and that's precisely the read worth not repeating). D1 keeps a tighter
// bound so one cache row can't dominate the database.
const MAX_EDGE_BYTES = 8_000_000;
const MAX_ROW_BYTES = 900_000;

const MEM_MAX = 400;
const memCache = new Map();
function memGet(key) {
  const entry = memCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.exp) {
    memCache.delete(key);
    return undefined;
  }
  // Re-insert so Map iteration order tracks recency — makes the eviction
  // below true LRU rather than "oldest inserted", which used to evict a
  // constantly-hit key just because it was written first.
  memCache.delete(key);
  memCache.set(key, entry);
  return entry.value;
}
function memSet(key, value, ttlSeconds) {
  if (memCache.has(key)) memCache.delete(key);
  else if (memCache.size >= MEM_MAX) memCache.delete(memCache.keys().next().value);
  memCache.set(key, { value, exp: Date.now() + ttlSeconds * 1000 });
}

// In-flight computations, keyed by cache key: concurrent misses await the
// same promise instead of each running the query.
const inflight = new Map();

// Envelope stored in L2/L3 — the logical expiry travels with the value so a
// stale entry can be recognized as stale (and served as such) rather than
// just vanishing when its TTL lapses.
const envelope = (value, ttl) => JSON.stringify({ v: value, e: Date.now() + ttl * 1000 });
const unwrap = (env) =>
  env && typeof env === "object" && "v" in env
    ? { value: env.v, stale: Date.now() > (env.e || 0) }
    : undefined;

const edgeCache = () => (typeof caches !== "undefined" ? caches.default : undefined);

// Cache API entries are keyed by URL, and Cloudflare only stores entries
// whose hostname is on this zone — a made-up hostname is silently dropped,
// which would leave L2 permanently empty and be very easy to mistake for
// "the cache is working". So keys live on the site's own origin under a
// path prefix that maps to no real route.
const CACHE_URL_BASE =
  (process.env.NEXT_PUBLIC_BASE_URL || "https://www.bookqubit.shop").replace(/\/$/, "") +
  "/__cache/";

// Anything keyed to a specific reader stays out of the edge tier: entries
// there live at a URL on the public zone, and a per-user recommendation set
// shouldn't be reachable by anyone who can construct that URL. Those keys
// still get L1 + the durable D1 tier, neither of which is addressable.
const USER_SCOPED = /^v\d+:(recommendations|shelf|user|notifications):/;

// Hashed so the path is fixed-length and opaque rather than echoing the
// internal key structure back out on a public URL.
async function edgeKey(vkey) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(vkey));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return new Request(CACHE_URL_BASE + hex);
}

async function edgeGet(vkey) {
  const c = edgeCache();
  if (!c || USER_SCOPED.test(vkey)) return undefined;
  try {
    const res = await c.match(await edgeKey(vkey));
    if (!res) return undefined;
    return unwrap(await res.json());
  } catch {
    return undefined;
  }
}

async function edgePut(vkey, body, ttl) {
  const c = edgeCache();
  if (!c || USER_SCOPED.test(vkey)) return;
  try {
    await c.put(
      await edgeKey(vkey),
      new Response(body, {
        headers: {
          "content-type": "application/json",
          "cache-control": `max-age=${ttl + STALE_GRACE_SECONDS}`,
        },
      })
    );
  } catch {
    /* edge cache unavailable — the other tiers still apply */
  }
}

async function rowGet(vkey) {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value, expires_at FROM app_cache WHERE key = ?1")
      .bind(vkey)
      .first();
    if (!row) return undefined;
    return { value: JSON.parse(row.value), stale: Date.now() > row.expires_at };
  } catch {
    // Includes the case that matters most: D1 itself is refusing reads
    // (quota). Returning undefined lets the caller fall through rather than
    // turning a cache lookup into a page-level failure.
    return undefined;
  }
}

async function rowPut(vkey, body, ttl) {
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO app_cache (key, value, expires_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at`
      )
      .bind(vkey, body, Date.now() + ttl * 1000)
      .run();
    // Occasional sweep so abandoned keys can't accumulate forever. Cheap at
    // 1-in-200 writes, and never on the request's critical path in practice.
    if (Math.random() < 0.005) {
      await db
        .prepare("DELETE FROM app_cache WHERE expires_at < ?1")
        .bind(Date.now() - STALE_GRACE_SECONDS * 1000)
        .run();
    }
  } catch {
    /* durable tier unavailable — L1/L2 still apply */
  }
}

// Run background work through waitUntil when a request context exists, so it
// isn't cancelled the moment the response is returned.
async function background(promise) {
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    if (ctx?.waitUntil) {
      ctx.waitUntil(promise);
      return;
    }
  } catch {
    /* no request context (build, local dev) */
  }
  promise.catch(() => {});
}

async function store(vkey, value, ttl) {
  const body = envelope(value, ttl);
  if (body.length <= MAX_EDGE_BYTES) await edgePut(vkey, body, ttl);
  if (body.length <= MAX_ROW_BYTES) await rowPut(vkey, body, ttl);
}

export async function cached(key, fn, ttl = 300) {
  const vkey = `${CACHE_VERSION}:${key}`;

  const memHit = memGet(vkey);
  if (memHit !== undefined) return memHit;

  const pending = inflight.get(vkey);
  if (pending) return pending;

  // Serve a stale value now, refresh it behind the response. Awaits the
  // waitUntil registration (not the refresh itself) — ctx.waitUntil has to
  // be called while the request is still open, and returning first would
  // race the refresh against the response being sent.
  const revalidate = async (stale) => {
    await background(
      (async () => {
        try {
          const fresh = await fn();
          memSet(vkey, fresh, ttl);
          await store(vkey, fresh, ttl);
        } catch {
          /* keep serving the stale value until the source recovers */
        }
      })()
    );
    // Short L1 TTL so the refreshed value is picked up promptly, while still
    // collapsing the burst of requests arriving right now.
    memSet(vkey, stale, Math.min(ttl, 60));
    return stale;
  };

  const work = (async () => {
    const edgeHit = await edgeGet(vkey);
    if (edgeHit) {
      if (!edgeHit.stale) {
        memSet(vkey, edgeHit.value, ttl);
        return edgeHit.value;
      }
      return revalidate(edgeHit.value);
    }

    const rowHit = await rowGet(vkey);
    if (rowHit) {
      if (!rowHit.stale) {
        memSet(vkey, rowHit.value, ttl);
        // Re-seed this colo's edge cache so the next hit here skips D1.
        await background(edgePut(vkey, envelope(rowHit.value, ttl), ttl));
        return rowHit.value;
      }
      return revalidate(rowHit.value);
    }

    const value = await fn();
    memSet(vkey, value, ttl);
    await background(store(vkey, value, ttl));
    return value;
  })();

  inflight.set(vkey, work);
  try {
    return await work;
  } finally {
    inflight.delete(vkey);
  }
}

// Force a cached() key to be recomputed on next read — used after admin
// writes so edits (e.g. site settings) show up immediately, not after TTL.
export async function invalidate(key) {
  // Must apply the same version prefix cached() writes under, or this
  // deletes a key that was never written and the stale value survives.
  const vkey = `${CACHE_VERSION}:${key}`;
  memCache.delete(vkey);
  inflight.delete(vkey);

  const c = edgeCache();
  if (c) {
    try {
      await c.delete(await edgeKey(vkey));
    } catch { /* nothing cached at the edge */ }
  }
  try {
    const db = await getDb();
    await db.prepare("DELETE FROM app_cache WHERE key = ?1").bind(vkey).run();
  } catch { /* no bindings available, nothing to invalidate */ }
}
