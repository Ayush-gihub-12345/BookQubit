// Daily (well, every-3-hours) bulk import cron. Two sources feed the same
// pipeline:
//   1. import_chunks — an optional pre-staged queue (JSON blobs written by
//      the local prepare_import.py script from Open Library bulk dumps).
//   2. A live fetch straight from Open Library's search API (openlibrary.org
//      /search.json), which actually carries per-book ratings_average/
//      ratings_count — no download, no local script, runs entirely here.
//      This is the primary path now; (1) still works if you ever load a
//      queue, but nothing requires it.
//
// Every inserted book also gets author + publisher stub profiles (name +
// slug at minimum) instead of just plain text, deduped against what's
// already in the catalog and against each other within a run.
//
// Two independent safeguards protect the daily D1 write quota:
//   1. daily_cap/imported_today/today_date on import_progress — enforced
//      here regardless of who or what triggered the run (scheduled cron OR
//      a manual "Run now" click), so a manual trigger can never blow past
//      the day's budget even if clicked repeatedly. Counts ALL rows written
//      (books + author/publisher stubs), not just books.
//   2. The /run HTTP route requires a shared secret header, known only to
//      the main app's server (never sent to the browser) — the raw worker
//      URL is not something "anyone" can use to trigger a run.
//
// maxChunks, when set (the admin dashboard's per-click "Run Now" loop uses
// this), bounds a single call to a small amount of work — one queued chunk
// and one Open Library page — so the dashboard can show live incremental
// progress instead of one silent multi-thousand-book batch. The scheduled
// (unbounded) run does a bigger sweep per the *_PER_RUN env vars.

// Rotated across runs so coverage keeps growing across genres over time
// instead of only ever re-fetching the same subject's first page.
const SUBJECTS = [
  "fiction", "mystery", "romance", "fantasy", "science_fiction", "biography",
  "business", "self_help", "history", "philosophy", "psychology", "health",
  "science", "technology", "travel", "poetry", "drama", "humor", "true_crime",
  "cooking", "art", "religion", "politics", "economics", "education", "sports",
];

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(name, suffixSource = "") {
  const base = (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const cleanSuffix = (suffixSource || "").replace(/[^a-zA-Z0-9]/g, "").slice(-6);
  return (cleanSuffix ? `${base}-${cleanSuffix}` : base).toLowerCase();
}

const UA = { "User-Agent": "BookQubit/1.0 (+https://bookqubit.com; bulk catalog import)" };

// sort=readinglog orders results by readinglog_count (how many readers have
// this book on any shelf — want-to-read + reading + already-read combined),
// Open Library's actual "most read/most popular" signal. Sorting by rating
// alone (the old approach) surfaced obscure books with a perfect score from
// a single vote; this instead front-loads books real readers have engaged with.
async function fetchOpenLibraryPage(subject, offset, limit) {
  const fields = "key,title,author_name,author_key,isbn,cover_i,first_publish_year,number_of_pages_median,ratings_average,ratings_count,readinglog_count,publisher,subject";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(`subject:${subject}`)}&offset=${offset}&limit=${limit}&fields=${fields}&sort=readinglog`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);
  return res.json();
}

async function fetchAuthorDetails(authorKey) {
  if (!authorKey) return null;
  try {
    const res = await fetch(`https://openlibrary.org/authors/${authorKey}.json`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    const bio = data.bio ? (typeof data.bio === "string" ? data.bio : data.bio.value || null) : null;
    let birthYear = null;
    if (data.birth_date) {
      const yearMatch = data.birth_date.match(/\b(\d{4})\b/);
      if (yearMatch) birthYear = Number(yearMatch[1]);
    }
    const photoId = (data.photos || []).find((id) => typeof id === "number" && id > 0);
    const imageUrl = photoId ? `https://covers.openlibrary.org/a/id/${photoId}-L.jpg` : null;
    const wikipedia = data.wikipedia || null;
    let websiteUrl = null;
    if (data.links && data.links.length) {
      const site = data.links.find((l) => l.type === "website" || l.title?.toLowerCase().includes("site"));
      if (site) websiteUrl = site.url;
    }
    return { bio, birthYear, imageUrl, wikipedia, websiteUrl };
  } catch {
    return null;
  }
}

async function fetchWorkDescription(workKey) {
  if (!workKey) return null;
  try {
    const res = await fetch(`https://openlibrary.org${workKey}.json`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    const desc = data.description;
    if (!desc) return null;
    return typeof desc === "string" ? desc : desc.value || null;
  } catch {
    return null;
  }
}

// A short blurb (first sentence, capped) derived from the full synopsis —
// `description` is the short version shown in listings, `summary` is the
// full text shown on the book page.
function splitDescription(full) {
  const cleaned = full.trim().replace(/\s+/g, " ");
  const firstSentence = cleaned.match(/^.{0,280}?[.!?](?=\s|$)/);
  const short = firstSentence ? firstSentence[0].trim() : `${cleaned.slice(0, 200).trim()}…`;
  return { short, full: cleaned };
}

// Open Library's subject list mixes real genre words with library
// classification codes (e.g. "Pr5819 .a1 1998b") — drop anything with a
// digit or that's implausibly long/short before using it for category/tags.
function isCleanSubject(s) {
  return typeof s === "string" && s.length >= 3 && s.length <= 40 && !/\d/.test(s);
}

// key_points is the one field genuinely no metadata source (Open Library or
// otherwise) can supply — it's written takeaways, not data. Generated once,
// right here at insert time, from the real fetched synopsis — never
// regenerated later, never called per page-view. Returns null (not a
// fabricated guess) on any failure, so a book without a usable summary or a
// flaky AI call just keeps key_points blank rather than getting junk data.
//
// Deliberately NOT asking the model to also guess `collection` (series
// name) here — tested it live and this small model hallucinates badly:
// across repeated identical calls it repeated the book's own title back as
// the "series name" 3 times out of 4, and once leaked its own JSON schema
// field names ("collection", "keyPoints") into the key_points array as if
// they were content. key_points is low-stakes interpretive summarization;
// collection is a factual claim a small model isn't reliable enough to
// make. Leave `collection` for manual/editorial curation instead.
async function generateEnrichment(ai, title, author, summary) {
  if (!ai || !summary) return { keyPoints: null };
  try {
    const response = await ai.run("@cf/meta/llama-3.2-1b-instruct", {
      messages: [
        {
          role: "user",
          content:
            `Book: "${title}" by ${author}.\nSynopsis: ${summary.slice(0, 800)}\n\n` +
            `Write exactly 3 short key takeaways/highlights for this book, each under 15 words. ` +
            `Respond with ONLY a JSON array of strings, no other text. Example: ["First point","Second point","Third point"]`,
        },
      ],
      max_tokens: 300,
    });
    const text = response?.response || "";

    // This small/cheap model frequently cuts off before closing the array
    // (observed ~1 in 3 calls) — try strict JSON first, but fall back to
    // pulling out whatever complete quoted strings exist even if the array
    // itself never got closed, rather than discarding an otherwise-good
    // response over a missing bracket.
    const bracketMatch = text.match(/\[[\s\S]*\]/);
    if (bracketMatch) {
      try {
        const parsed = JSON.parse(bracketMatch[0]);
        if (Array.isArray(parsed) && parsed.length) {
          return { keyPoints: parsed.filter((p) => typeof p === "string" && p.trim()).slice(0, 5) };
        }
      } catch {
        /* fall through to lenient extraction below */
      }
    }
    const quoted = [...text.matchAll(/"([^"]{5,150})"/g)].map((m) => m[1].trim());
    return { keyPoints: quoted.length ? quoted.slice(0, 3) : null };
  } catch {
    return { keyPoints: null };
  }
}

// Pulls up to `pages` pages from Open Library's live search API, filtering
// for rating and basic completeness, and returns book/author/publisher
// stubs ready to upsert — advancing (and persisting) the rotation cursor as
// it goes so the next run continues from here instead of restarting.
async function fetchFromOpenLibrary(db, ai, { pages, pageSize, minRating, minReaders, maxBooks }) {
  let state = await db.prepare("SELECT * FROM ol_fetch_state WHERE id=1").first();
  if (!state) {
    await db.prepare("INSERT INTO ol_fetch_state (id, query_index, offset_val) VALUES (1, 0, 0) ON CONFLICT(id) DO NOTHING").run();
    state = { query_index: 0, offset_val: 0 };
  }

  let queryIndex = state.query_index;
  let offset = state.offset_val;

  const books = [];
  const authors = [];
  const publications = [];
  const seenAuthorNames = new Set();
  const seenPublisherNames = new Set();
  let subjectFetched = null;

  for (let page = 0; page < pages && books.length < maxBooks; page++) {
    const subject = SUBJECTS[queryIndex % SUBJECTS.length];
    subjectFetched = subject;

    let data;
    try {
      data = await fetchOpenLibraryPage(subject, offset, pageSize);
    } catch {
      break; // network hiccup — stop for this run, cursor is unchanged so next run retries the same page
    }
    const docs = data.docs || [];

    for (const doc of docs) {
      const isbn = (doc.isbn || [])[0];
      const title = doc.title;
      const authorNames = doc.author_name || [];
      if (!isbn || !title || !authorNames.length) continue;
      // Popularity gate: a high average rating alone lets through obscure
      // books with one perfect vote — readinglog_count (readers who've put
      // this on any shelf: want-to-read + reading + already-read) is what
      // actually distinguishes "widely read" from "technically rated".
      if ((doc.ratings_average || 0) < minRating || (doc.readinglog_count || 0) < minReaders) continue;
      if (books.length >= maxBooks) break;

      // A real synopsis is one more fetch() per book — skip (don't import
      // with a blank) rather than count against the day's budget with thin
      // data, since a description-less row is exactly what we're avoiding.
      const rawDescription = await fetchWorkDescription(doc.key);
      if (!rawDescription) continue;
      const { short, full } = splitDescription(rawDescription);
      const authorLine = authorNames.slice(0, 3).join(", ");
      const { keyPoints } = await generateEnrichment(ai, title, authorLine, full);

      const subjects = (doc.subject || []).filter(isCleanSubject).slice(0, 12);
      books.push({
        slug: slugify(title, isbn),
        lang: "en",
        title,
        author: authorLine,
        publisher: (doc.publisher || [])[0] || null,
        isbn,
        published: doc.first_publish_year ? String(doc.first_publish_year) : null,
        page_count: doc.number_of_pages_median || null,
        key_points: keyPoints,
        category: subjects[0] || null,
        subjects: subjects.slice(0, 8),
        genres: subjects.slice(0, 2),
        tags: subjects.slice(2, 6),
        description: short,
        summary: full,
        rating: doc.ratings_average || null,
        cover_url: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      });

      const authorKeys = doc.author_key || [];
      for (let idx = 0; idx < authorNames.length; idx++) {
        const name = authorNames[idx];
        const olKey = authorKeys[idx];
        const dedupeKey = olKey || name.trim().toLowerCase();
        if (seenAuthorNames.has(dedupeKey)) continue;
        seenAuthorNames.add(dedupeKey);
        const details = await fetchAuthorDetails(olKey);
        const subjects = (doc.subject || []).filter(isCleanSubject).slice(0, 4);
        authors.push({
          slug: slugify(name, olKey),
          lang: "en",
          name: name.trim(),
          birth_year: details?.birthYear || null,
          bio: details?.bio || null,
          image_url: details?.imageUrl || null,
          wikipedia_url: details?.wikipedia || null,
          website_url: details?.websiteUrl || null,
          genres: subjects.length ? subjects : null,
          famous_work: title,
        });
      }
      const publisherName = (doc.publisher || [])[0];
      if (publisherName) {
        const key = publisherName.trim().toLowerCase();
        if (!seenPublisherNames.has(key)) {
          seenPublisherNames.add(key);
          publications.push({ slug: slugify(publisherName), lang: "en", name: publisherName.trim() });
        }
      }
    }

    // Fewer results than asked for means we're at (or near) the end of this
    // subject's results — move on to the next one rather than re-querying
    // ever-larger offsets that return nothing.
    if (docs.length < pageSize) {
      queryIndex += 1;
      offset = 0;
    } else {
      offset += docs.length;
    }
  }

  await db.prepare("UPDATE ol_fetch_state SET query_index=?1, offset_val=?2 WHERE id=1")
    .bind(queryIndex % SUBJECTS.length, offset).run();

  return { books, authors, publications, subject: subjectFetched };
}

async function runImport(env, { maxChunks } = {}) {
  const db = env.DB;
  const perRunChunks = maxChunks || Number(env.PER_RUN_CHUNKS) || 13;
  const batchSize = Number(env.D1_BATCH_SIZE) || 100;
  const olPages = maxChunks ? 1 : (Number(env.OL_PAGES_PER_RUN) || 3);
  const olPageSize = Number(env.OL_PAGE_SIZE) || 100;
  const olMinRating = Number(env.OL_MIN_RATING) || 4.0;
  // readinglog_count = readers who've put this on any shelf (want-to-read +
  // reading + already-read) — the actual "popular / most readers" signal,
  // not just a rating floor a barely-read book could clear with one vote.
  const olMinReaders = Number(env.OL_MIN_READERS) || 200;
  // Every imported book gets a real fetched synopsis (one extra fetch() call
  // each) — capped well under Cloudflare's 50-subrequest-per-invocation free
  // plan limit (search pages + this cap must stay under that, with margin).
  const olMaxEnrich = Number(env.OL_MAX_ENRICH_PER_RUN) || 30;

  await db.prepare(
    "INSERT INTO import_progress (id, total_imported, total_skipped) VALUES (1, 0, 0) ON CONFLICT(id) DO NOTHING"
  ).run();

  let progress = await db.prepare("SELECT * FROM import_progress WHERE id=1").first();

  // Roll the daily counter over at UTC midnight.
  if (progress.today_date !== todayUTC()) {
    await db.prepare("UPDATE import_progress SET today_date=?1, imported_today=0 WHERE id=1").bind(todayUTC()).run();
    progress = { ...progress, today_date: todayUTC(), imported_today: 0 };
  }

  if (progress.imported_today >= progress.daily_cap) {
    return {
      imported: 0, skipped: 0, authorsImported: 0, publishersImported: 0,
      chunksProcessed: 0, remainingChunks: null, capped: true, source: null,
      dailyCap: progress.daily_cap, importedToday: progress.imported_today, insertedTitles: [],
    };
  }

  let imported = 0;
  let skipped = 0;
  let authorsImported = 0;
  let publishersImported = 0;
  const insertedTitles = [];

  // Runs one batch of INSERT ... ON CONFLICT DO NOTHING statements against
  // `db`, returning how many actually inserted a new row (vs. already existed).
  async function upsertBatch(table, columns, rows, toValues, updateCols) {
    let insertedCount = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const slice = rows.slice(i, i + batchSize);
      const placeholders = columns.map((_, idx) => `?${idx + 1}`).join(", ");
      let conflictClause = "ON CONFLICT(slug, lang) DO NOTHING";
      if (updateCols && updateCols.length) {
        const sets = updateCols.map((c) => `${c} = COALESCE(excluded.${c}, ${table}.${c})`).join(", ");
        conflictClause = `ON CONFLICT(slug, lang) DO UPDATE SET ${sets}`;
      }
      const stmts = slice.map((r) =>
        db.prepare(
          `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) ${conflictClause}`
        ).bind(...toValues(r))
      );
      const results = await db.batch(stmts);
      results.forEach((res, idx) => {
        if (res.meta.changes > 0) insertedCount += 1;
        else if (table === "books") skipped += 1;
        if (table === "books" && res.meta.changes > 0) insertedTitles.push(slice[idx].title);
      });
    }
    return insertedCount;
  }

  const bookColumns = [
    "slug", "lang", "title", "author", "publisher", "isbn", "published", "page_count", "format",
    "category", "subjects", "genres", "tags", "key_points", "description", "summary", "cover_url", "rating",
  ];
  const toBookValues = (r) => [
    r.slug, r.lang || "en", r.title, r.author || null, r.publisher || null, r.isbn || null,
    r.published || null, r.page_count || null, r.format || null, r.category || null,
    JSON.stringify(r.subjects || []), JSON.stringify(r.genres || []), JSON.stringify(r.tags || []),
    r.key_points ? JSON.stringify(r.key_points) : null,
    r.description || null, r.summary || null, r.cover_url || null, r.rating || null,
  ];
  const authorColumns = ["slug", "lang", "name", "birth_year", "bio", "image_url", "wikipedia_url", "website_url", "genres", "famous_work"];
  const toAuthorValues = (r) => [
    r.slug, r.lang || "en", r.name, r.birth_year || null, r.bio || null,
    r.image_url || null, r.wikipedia_url || null, r.website_url || null,
    r.genres ? JSON.stringify(r.genres) : null, r.famous_work || null,
  ];
  const authorUpdateCols = ["birth_year", "bio", "image_url", "wikipedia_url", "website_url", "genres", "famous_work"];
  const pubColumns = ["slug", "lang", "name", "type"];
  const toPubValues = (r) => [r.slug, r.lang || "en", r.name, r.type || "Publisher"];
  const pubUpdateCols = ["type"];

  // 1. Any pre-staged queue rows (from a locally-run prepare_import.py, if
  // you've ever loaded one) — optional, not required for this to work.
  const { results: chunks } = await db.prepare(
    "SELECT id, chunk_data FROM import_chunks WHERE consumed = 0 ORDER BY id LIMIT ?1"
  ).bind(perRunChunks).all();

  for (const chunkRow of chunks) {
    if (progress.imported_today + imported + authorsImported + publishersImported >= progress.daily_cap) break;
    const payload = JSON.parse(chunkRow.chunk_data);
    imported += await upsertBatch("books", bookColumns, payload.books || [], toBookValues);
    authorsImported += await upsertBatch("authors", authorColumns, payload.authors || [], toAuthorValues, authorUpdateCols);
    publishersImported += await upsertBatch("publications", pubColumns, payload.publications || [], toPubValues, pubUpdateCols);
    await db.prepare("UPDATE import_chunks SET consumed = 1 WHERE id = ?1").bind(chunkRow.id).run();
  }

  // 2. Live fetch straight from Open Library — the primary, always-on path.
  let source = null;
  const budgetRemaining = progress.daily_cap - (progress.imported_today + imported + authorsImported + publishersImported);
  if (budgetRemaining > 0) {
    const ol = await fetchFromOpenLibrary(db, env.AI, {
      pages: olPages, pageSize: olPageSize, minRating: olMinRating, minReaders: olMinReaders,
      maxBooks: Math.min(budgetRemaining, olMaxEnrich),
    });
    source = ol.subject;
    imported += await upsertBatch("books", bookColumns, ol.books, toBookValues);
    authorsImported += await upsertBatch("authors", authorColumns, ol.authors, toAuthorValues, authorUpdateCols);
    publishersImported += await upsertBatch("publications", pubColumns, ol.publications, toPubValues, pubUpdateCols);
  }

  // 3. Backfill existing authors that have NULL bios — search OL for their
  // author key by name, then fetch details. Capped at 3/run (2 fetches each
  // = 6 subrequests) to stay within Cloudflare's limit.
  const { results: sparseAuthors } = await db.prepare(
    "SELECT id, name FROM authors WHERE bio IS NULL LIMIT 3"
  ).all();
  for (const row of sparseAuthors) {
    try {
      const searchRes = await fetch(
        `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(row.name)}&limit=1`,
        { headers: UA }
      );
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const authorKey = searchData.docs?.[0]?.key;
      if (!authorKey) continue;
      const details = await fetchAuthorDetails(authorKey);
      if (!details) continue;
      await db.prepare(
        `UPDATE authors SET
          birth_year = COALESCE(?1, birth_year),
          bio = COALESCE(?2, bio),
          image_url = COALESCE(?3, image_url),
          wikipedia_url = COALESCE(?4, wikipedia_url),
          website_url = COALESCE(?5, website_url)
        WHERE id = ?6`
      ).bind(
        details.birthYear || null, details.bio || null,
        details.imageUrl || null, details.wikipedia || null,
        details.websiteUrl || null, row.id
      ).run();
      authorsImported += 1;
    } catch { /* skip this author, try next run */ }
  }

  const remaining = await db.prepare("SELECT COUNT(*) AS n FROM import_chunks WHERE consumed = 0").first();
  const totalWrittenThisRun = imported + authorsImported + publishersImported;

  await db.prepare(
    `UPDATE import_progress SET total_imported = total_imported + ?1, total_skipped = total_skipped + ?2,
       total_authors_imported = total_authors_imported + ?3, total_publishers_imported = total_publishers_imported + ?4,
       imported_today = imported_today + ?5, last_run_at = CURRENT_TIMESTAMP, last_status = ?6 WHERE id = 1`
  ).bind(imported, skipped, authorsImported, publishersImported, totalWrittenThisRun, "ok").run();

  return {
    imported, skipped, authorsImported, publishersImported,
    chunksProcessed: chunks.length, remainingChunks: remaining.n, capped: false, source, insertedTitles,
  };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runImport(env));
  },
  // Manual trigger, called only by the main app's server (never the
  // browser directly) — requires the shared secret set via
  // `wrangler secret put IMPORT_TRIGGER_SECRET`.
  //
  // `burst=N` runs N chunks back-to-back WITHOUT the caller (the admin's
  // browser) needing to stay connected: after each chunk, the worker calls
  // *itself* for the next one via a self-referencing Service Binding (SELF
  // in wrangler.jsonc), wrapped in ctx.waitUntil so the chain keeps going
  // in Cloudflare's infrastructure even if the admin closes the tab that
  // started it — each hop is a fresh Worker invocation with its own
  // subrequest budget, so this sidesteps the 50-subrequest-per-invocation
  // cap that would otherwise block doing hundreds of enriched books in one
  // shot. `x-import-chain` marks a hop as part of an existing chain (as
  // opposed to a fresh admin click) so only a genuinely new click clears
  // any previous stop request.
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const provided = request.headers.get("x-import-secret");
      if (!env.IMPORT_TRIGGER_SECRET || provided !== env.IMPORT_TRIGGER_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      const isChainHop = request.headers.get("x-import-chain") === "1";
      const maxChunks = Number(url.searchParams.get("maxChunks")) || undefined;
      const burst = Number(url.searchParams.get("burst")) || 0;

      await env.DB.prepare(
        "INSERT INTO import_progress (id, total_imported, total_skipped) VALUES (1, 0, 0) ON CONFLICT(id) DO NOTHING"
      ).run();

      if (burst > 0 && !isChainHop) {
        // A fresh admin-triggered burst — clear any earlier Stop request.
        await env.DB.prepare("UPDATE import_progress SET stop_requested = 0 WHERE id = 1").run();
      }
      if (burst > 0 && isChainHop) {
        const flag = await env.DB.prepare("SELECT stop_requested FROM import_progress WHERE id = 1").first();
        if (flag?.stop_requested) return Response.json({ stopped: true });
      }

      const result = await runImport(env, { maxChunks: maxChunks || (burst ? 1 : undefined) });

      const somethingHappened = result.imported > 0 || result.authorsImported > 0 || result.publishersImported > 0 || result.chunksProcessed > 0;
      const shouldContinue = burst > 1 && !result.capped && somethingHappened;
      if (shouldContinue) {
        ctx.waitUntil(
          env.SELF.fetch("https://self/run?burst=" + (burst - 1), {
            method: "POST",
            headers: { "x-import-secret": env.IMPORT_TRIGGER_SECRET, "x-import-chain": "1" },
          }).catch(() => {})
        );
      }

      return Response.json({ ...result, burstRemaining: shouldContinue ? burst - 1 : 0 });
    }
    // Lets the admin dashboard halt an in-progress burst chain — the chain
    // checks this flag before each hop and stops itself rather than the
    // client needing to cancel an in-flight request.
    if (url.pathname === "/stop") {
      const provided = request.headers.get("x-import-secret");
      if (!env.IMPORT_TRIGGER_SECRET || provided !== env.IMPORT_TRIGGER_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      await env.DB.prepare("UPDATE import_progress SET stop_requested = 1 WHERE id = 1").run();
      return Response.json({ stopped: true });
    }
    return new Response("bookqubit-import-cron is running.", { status: 200 });
  },
};
