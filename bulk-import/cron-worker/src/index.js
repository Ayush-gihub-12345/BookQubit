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

// Open Library's own readinglog_count (readers who've shelved a book) skews
// hard toward classic/library-catalog fiction (Harry Potter, 1984, Pride and
// Prejudice) — it's real reader data, but it under-represents real-world
// bestsellers in business/self-help/nonfiction that people buy and read
// outside library systems (Atomic Habits, The Psychology of Money, Sapiens).
// This hand-picked list of widely recognized, high-demand titles is fetched
// by exact title+author lookup — no popularity gate needed since these are
// already known-good — and runs through the identical enrichment pipeline
// (real synopsis, AI key_points, author/publisher detail lookups) as every
// other book. Processed once each (a persisted cursor tracks progress) before
// falling back to subject rotation, so these land in the catalog early.
const CURATED_TITLES = [
  { title: "The Psychology of Money", author: "Morgan Housel" },
  { title: "Atomic Habits", author: "James Clear" },
  { title: "Sapiens", author: "Yuval Noah Harari" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman" },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki" },
  { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson" },
  { title: "Deep Work", author: "Cal Newport" },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey" },
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie" },
  { title: "The Power of Habit", author: "Charles Duhigg" },
  { title: "Man's Search for Meaning", author: "Viktor Frankl" },
  { title: "The Alchemist", author: "Paulo Coelho" },
  { title: "Ikigai", author: "Hector Garcia" },
  { title: "Educated", author: "Tara Westover" },
  { title: "Becoming", author: "Michelle Obama" },
  { title: "Can't Hurt Me", author: "David Goggins" },
  { title: "The Four Agreements", author: "Don Miguel Ruiz" },
  { title: "Outliers", author: "Malcolm Gladwell" },
  { title: "Grit", author: "Angela Duckworth" },
  { title: "Mindset", author: "Carol Dweck" },
  { title: "The Lean Startup", author: "Eric Ries" },
  { title: "Zero to One", author: "Peter Thiel" },
  { title: "Start with Why", author: "Simon Sinek" },
  { title: "Think and Grow Rich", author: "Napoleon Hill" },
  { title: "The Millionaire Next Door", author: "Thomas Stanley" },
  { title: "The Intelligent Investor", author: "Benjamin Graham" },
  { title: "A Brief History of Time", author: "Stephen Hawking" },
  { title: "Homo Deus", author: "Yuval Noah Harari" },
  { title: "12 Rules for Life", author: "Jordan Peterson" },
  { title: "Emotional Intelligence", author: "Daniel Goleman" },
  { title: "The Book Thief", author: "Markus Zusak" },
  { title: "To Kill a Mockingbird", author: "Harper Lee" },
  { title: "The Catcher in the Rye", author: "J.D. Salinger" },
  { title: "Animal Farm", author: "George Orwell" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { title: "The Kite Runner", author: "Khaled Hosseini" },
  { title: "Life of Pi", author: "Yann Martel" },
  { title: "The Hobbit", author: "J.R.R. Tolkien" },
  { title: "Charlie and the Chocolate Factory", author: "Roald Dahl" },
  { title: "The Da Vinci Code", author: "Dan Brown" },
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

// Exact title+author lookup for CURATED_TITLES — general relevance search
// (not sorted by readers) since we already know these are worth having;
// just need OL's best-matching edition with an ISBN attached.
async function fetchCuratedMatch(title, author) {
  const fields = "key,title,author_name,author_key,isbn,cover_i,first_publish_year,number_of_pages_median,ratings_average,publisher,subject";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(`${title} ${author}`)}&limit=5&fields=${fields}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.docs || []).find((d) => (d.isbn || []).length && d.title && (d.author_name || []).length) || null;
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

// Open Library has no publisher-details API at all, so publishers were
// landing with just name+slug — everything else null. Wikipedia's public
// REST summary endpoint (no key required) is a genuine, real data source
// for the well-known publishers this catalog actually sees (Penguin,
// HarperCollins, etc.) — returns a proper prose description, a logo/photo,
// and a canonical page URL to use as a website fallback. Returns null
// cleanly (a small/obscure imprint just won't have a Wikipedia page —
// nothing to fabricate) rather than ever guessing.
async function fetchWikipediaSummary(name) {
  if (!name) return null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.extract) return null;
    return {
      about: data.extract,
      logoUrl: data.thumbnail?.source || null,
      pageUrl: data.content_urls?.desktop?.page || null,
    };
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

// Open Library's raw descriptions are scraped from many sources and often
// carry mangled UTF-8 (smart quotes/em-dashes decoded as "â€™"/"â€"" etc.),
// stray replacement characters, and — as seen on real books like The
// Psychology of Money — spammy markdown links to unrelated third-party
// "pdf download" sites baked right into the text. Strip all of that before
// it ever reaches the AI rewrite or the database.
function cleanRawText(raw) {
  return raw
    .replace(/â€™|â€˜/g, "'")
    .replace(/â€œ|â€\x9d|â€�/g, '"')
    .replace(/â€"|â€"/g, "—")
    .replace(/Â/g, "")
    .replace(/�/g, "")
    .replace(/\[[^\]]*\]\(https?:\/\/[^)]+\)/g, "") // markdown links
    .replace(/https?:\/\/\S+/g, "") // bare URLs
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Rewrites a cleaned synopsis into proper, engaging book-jacket prose via
// Workers AI — the raw OL text is often a single run-on paragraph or reads
// like a database dump, not something you'd want to show a reader. Told
// explicitly to keep the same facts/plot points, not invent anything, so
// this is a copyediting pass, not a content-generation one (the model's
// hallucination risk from the `collection` field doesn't apply the same way
// here — nothing is being asked that isn't already in the source text).
// Falls back to null (caller uses the cleaned-but-unpolished text instead)
// on any failure or suspiciously short/empty output, never a summary worse
// than what came from Open Library.
async function polishSummary(ai, title, author, raw) {
  if (!ai || !raw) return null;
  try {
    const response = await ai.run("@cf/meta/llama-3.2-1b-instruct", {
      messages: [
        {
          role: "user",
          content:
            `Rewrite this book synopsis as clean, engaging prose for a book discovery website. ` +
            `Two short paragraphs, no markdown, no links, no preamble like "Here's a rewrite" — just the synopsis text itself. ` +
            `Keep every fact and plot point as given; don't invent anything new.\n\n` +
            `Book: "${title}" by ${author}.\nOriginal: ${raw.slice(0, 900)}`,
        },
      ],
      max_tokens: 350,
    });
    let text = (response?.response || "").trim();
    if (!text) return null;
    // Strip a leading meta-preamble the model sometimes adds despite being told not to,
    // plus any markdown emphasis (*italic*/**bold**) it slips into otherwise-plain prose.
    text = text.replace(/^(here'?s?\b[^:]{0,60}:)\s*/i, "").replace(/\*+/g, "").trim();
    return text.length >= 40 ? text : null;
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

// Shared per-book enrichment: given an OL search-result doc, fetches its
// real synopsis + AI key_points, and appends the book/author/publisher
// stubs into the passed-in arrays. Used by both the subject-rotation path
// and the curated-title path so every book — famous or not — goes through
// identical enrichment. Returns true if a book stub was actually added.
async function enrichAndCollect(doc, ai, { books, authors, publications, seenAuthorNames, seenPublisherNames }) {
  const isbn = (doc.isbn || [])[0];
  const title = doc.title;
  const authorNames = doc.author_name || [];
  if (!isbn || !title || !authorNames.length) return false;

  // A real synopsis is one more fetch() per book — skip (don't import with
  // a blank) rather than count against the day's budget with thin data.
  const rawDescription = await fetchWorkDescription(doc.key);
  if (!rawDescription) return false;
  const cleaned = cleanRawText(rawDescription);
  // OL search docs occasionally repeat the same author name in author_name
  // (e.g. "Daniel Kahneman, Daniel Kahneman") — dedupe before joining.
  const authorLine = [...new Set(authorNames.map((n) => n.trim()))].slice(0, 3).join(", ");
  const polished = await polishSummary(ai, title, authorLine, cleaned);
  const { short, full } = splitDescription(polished || cleaned);
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
    authors.push({
      slug: slugify(name, olKey),
      lang: "en",
      name: name.trim(),
      birth_year: details?.birthYear || null,
      bio: details?.bio || null,
      image_url: details?.imageUrl || null,
      wikipedia_url: details?.wikipedia || null,
      website_url: details?.websiteUrl || null,
      genres: subjects.length ? subjects.slice(0, 4) : null,
      famous_work: title,
    });
  }
  const publisherName = (doc.publisher || [])[0];
  if (publisherName) {
    const key = publisherName.trim().toLowerCase();
    if (!seenPublisherNames.has(key)) {
      seenPublisherNames.add(key);
      const wiki = await fetchWikipediaSummary(publisherName.trim());
      publications.push({
        slug: slugify(publisherName),
        lang: "en",
        name: publisherName.trim(),
        about: wiki?.about || null,
        description: wiki?.about ? wiki.about.split(/(?<=[.!?])\s/)[0] : null,
        logo_url: wiki?.logoUrl || null,
        website: wiki?.pageUrl || null,
      });
    }
  }
  return true;
}

// Walks CURATED_TITLES from a persisted cursor, resolving each to a real OL
// edition and running it through the same enrichment as everything else.
// The cursor advances past a title whether or not it resolved (a title OL
// genuinely can't match well isn't worth re-querying every run) — once past
// the end of the list it just stops being a no-op source forever, so this
// costs nothing on future runs once exhausted.
async function fetchCuratedBooks(db, ai, { maxBooks }) {
  const state = await db.prepare("SELECT curated_index FROM ol_fetch_state WHERE id=1").first();
  let idx = state?.curated_index || 0;

  const books = [];
  const authors = [];
  const publications = [];
  const seenAuthorNames = new Set();
  const seenPublisherNames = new Set();

  while (idx < CURATED_TITLES.length && books.length < maxBooks) {
    const { title, author } = CURATED_TITLES[idx];
    idx += 1;
    let doc;
    try {
      doc = await fetchCuratedMatch(title, author);
    } catch {
      continue;
    }
    if (!doc) continue;
    await enrichAndCollect(doc, ai, { books, authors, publications, seenAuthorNames, seenPublisherNames });
  }

  await db.prepare("UPDATE ol_fetch_state SET curated_index=?1 WHERE id=1").bind(idx).run();
  return { books, authors, publications };
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
    let qualifyingOnPage = 0;

    for (const doc of docs) {
      if (books.length >= maxBooks) break;
      // Popularity gate: a high average rating alone lets through obscure
      // books with one perfect vote — readinglog_count (readers who've put
      // this on any shelf: want-to-read + reading + already-read) is what
      // actually distinguishes "widely read" from "technically rated".
      if ((doc.ratings_average || 0) < minRating || (doc.readinglog_count || 0) < minReaders) continue;
      qualifyingOnPage += 1;
      await enrichAndCollect(doc, ai, { books, authors, publications, seenAuthorNames, seenPublisherNames });
    }

    // Results are sorted by readers descending (sort=readinglog), so once a
    // page has zero qualifying candidates, EVERY later page in this subject
    // will also be below the threshold — paging further would just waste
    // subrequests forever without ever finding another popular book. Move
    // to the next subject immediately rather than waiting for a short page.
    if (docs.length < pageSize || qualifyingOnPage === 0) {
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
  // How many of this run's book budget go to CURATED_TITLES before falling
  // back to subject rotation — keeps the recognizable "must-have" titles
  // landing early without ballooning subrequest use on top of everything else.
  const olCuratedPerRun = Number(env.OL_CURATED_PER_RUN) || 5;

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
  const pubColumns = ["slug", "lang", "name", "type", "description", "about", "logo_url", "website"];
  const toPubValues = (r) => [
    r.slug, r.lang || "en", r.name, r.type || "Publisher",
    r.description || null, r.about || null, r.logo_url || null, r.website || null,
  ];
  const pubUpdateCols = ["type", "description", "about", "logo_url", "website"];

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

  // 2a. Curated, hand-picked bestsellers/must-haves first (Atomic Habits,
  // The Psychology of Money, Sapiens, etc.) — real popularity these titles
  // undeniably have, that Open Library's own reader-log data underrepresents.
  let source = null;
  const curatedBudget = Math.min(
    progress.daily_cap - (progress.imported_today + imported + authorsImported + publishersImported),
    Math.min(olMaxEnrich, olCuratedPerRun)
  );
  if (curatedBudget > 0) {
    const curated = await fetchCuratedBooks(db, env.AI, { maxBooks: curatedBudget });
    if (curated.books.length) source = "curated";
    imported += await upsertBatch("books", bookColumns, curated.books, toBookValues);
    authorsImported += await upsertBatch("authors", authorColumns, curated.authors, toAuthorValues, authorUpdateCols);
    publishersImported += await upsertBatch("publications", pubColumns, curated.publications, toPubValues, pubUpdateCols);
  }

  // 2b. Live fetch straight from Open Library — fills the rest of this
  // run's budget once the curated list is exhausted (or budget remains).
  const budgetRemaining = progress.daily_cap - (progress.imported_today + imported + authorsImported + publishersImported);
  const olBudget = Math.min(budgetRemaining, Math.max(0, olMaxEnrich - imported));
  if (olBudget > 0) {
    const ol = await fetchFromOpenLibrary(db, env.AI, {
      pages: olPages, pageSize: olPageSize, minRating: olMinRating, minReaders: olMinReaders,
      maxBooks: olBudget,
    });
    if (ol.books.length) source = ol.subject;
    imported += await upsertBatch("books", bookColumns, ol.books, toBookValues);
    authorsImported += await upsertBatch("authors", authorColumns, ol.authors, toAuthorValues, authorUpdateCols);
    publishersImported += await upsertBatch("publications", pubColumns, ol.publications, toPubValues, pubUpdateCols);
  }

  // 3. Backfill existing authors that have NULL bios — search OL for their
  // author key by name, then fetch details. Capped at 2/run (2 fetches each
  // = 4 subrequests) to stay within Cloudflare's limit alongside the curated pass.
  const { results: sparseAuthors } = await db.prepare(
    "SELECT id, name FROM authors WHERE bio IS NULL LIMIT 2"
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

  // 4. Backfill existing publishers that have NULL descriptions — one
  // Wikipedia summary fetch each. Capped at 2/run to stay within budget.
  const { results: sparsePublishers } = await db.prepare(
    "SELECT id, name FROM publications WHERE description IS NULL LIMIT 2"
  ).all();
  for (const row of sparsePublishers) {
    try {
      const wiki = await fetchWikipediaSummary(row.name);
      if (!wiki) continue;
      await db.prepare(
        `UPDATE publications SET
          description = COALESCE(?1, description),
          about = COALESCE(?2, about),
          logo_url = COALESCE(?3, logo_url),
          website = COALESCE(?4, website)
        WHERE id = ?5`
      ).bind(
        wiki.about.split(/(?<=[.!?])\s/)[0], wiki.about, wiki.logoUrl, wiki.pageUrl, row.id
      ).run();
      publishersImported += 1;
    } catch { /* skip this publisher, try next run */ }
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
      // How many hops in a row have yielded nothing — a single empty hop is
      // normal (e.g. the current subject/offset is past its popular titles
      // and the cursor just needs to roll to the next of 26 subjects), not
      // a reason to kill the whole burst. Only a long unbroken run of empty
      // hops (network trouble, OL outage) should actually stop it.
      const emptyStreak = Number(url.searchParams.get("empty")) || 0;
      const MAX_EMPTY_STREAK = 30;

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
      const newEmptyStreak = somethingHappened ? 0 : emptyStreak + 1;
      const shouldContinue = burst > 1 && !result.capped && newEmptyStreak < MAX_EMPTY_STREAK;
      if (shouldContinue) {
        ctx.waitUntil(
          env.SELF.fetch(`https://self/run?burst=${burst - 1}&empty=${newEmptyStreak}`, {
            method: "POST",
            headers: { "x-import-secret": env.IMPORT_TRIGGER_SECRET, "x-import-chain": "1" },
          }).catch(() => {})
        );
      }

      return Response.json({ ...result, burstRemaining: shouldContinue ? burst - 1 : 0, emptyStreak: newEmptyStreak });
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
