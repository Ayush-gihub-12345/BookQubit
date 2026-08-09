// Continuous, never-stopping bulk import — not a fixed schedule or a fixed
// book count. Two sources feed the same pipeline:
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
// already in the catalog and against each other within a run — see the
// pre-enrichment slug-existence check in fetchFromOpenLibrary() below, which
// is what keeps this duplicate-free without wasting enrichment work on
// books already owned.
//
// How "continuous" actually works on Cloudflare (there's no such thing as a
// long-lived background process here): a self-chaining hop-to-hop loop.
// /run?continuous=1 does the smallest safe unit of work (1 book, 1 curated
// title, 1 OL search page, no backfill), then immediately calls itself again
// via ctx.waitUntil(env.SELF.fetch(...)) with no delay — each hop is a fresh
// Worker invocation with its own CPU/subrequest budget, so this never
// accumulates cost across hops the way looping inside one invocation would.
// The once-a-minute cron (see scheduled()) is just a watchdog: if the chain
// is ever not running (first deploy, or it stopped itself after a long
// empty streak / hit the daily cap / an admin clicked Stop) while auto-pilot
// is toggled on, it starts a fresh chain. If a chain is already alive, the
// watchdog tick is one cheap DB read and nothing else.
//
// Two independent safeguards protect the daily D1 write quota:
//   1. daily_cap/imported_today/today_date on import_progress — enforced
//      here regardless of who or what triggered the run (the continuous
//      chain, the watchdog, OR a manual "Run now" click), so nothing can
//      blow past the day's budget. Counts ALL rows written (books +
//      author/publisher stubs), not just books.
//   2. The /run HTTP route requires a shared secret header, known only to
//      the main app's server (never sent to the browser) — the raw worker
//      URL is not something "anyone" can use to trigger a run.

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
// `data.description` here is the REST API's short one-liner (e.g. "British
// author (born 1965)") — distinct from `data.extract` (the full paragraph
// used as `about`). The short form is what makes nationality extraction
// reliable; `wikibase_item` is the linked Wikidata QID, used for publisher
// founded/headquarters lookups without needing a separate search.
async function fetchWikipediaSummary(name) {
  if (!name) return null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.extract) return null;
    return {
      about: data.extract,
      shortDescription: data.description || null,
      logoUrl: data.thumbnail?.source || null,
      pageUrl: data.content_urls?.desktop?.page || null,
      wikidataId: data.wikibase_item || null,
    };
  } catch {
    return null;
  }
}

// Maps common nationality demonyms (as they appear in Wikipedia's short
// "British author (born 1965)"-style description) to a country name — used
// for both author.country and, by extension, book.country (the primary
// author's country, since a book itself has no country field of its own on
// Open Library). Not exhaustive; unmatched text just leaves country null
// rather than guessing.
const NATIONALITY_TO_COUNTRY = {
  american: "United States", british: "United Kingdom", english: "United Kingdom",
  scottish: "United Kingdom", welsh: "United Kingdom", "northern irish": "United Kingdom",
  canadian: "Canada", australian: "Australia", "new zealand": "New Zealand",
  indian: "India", irish: "Ireland", french: "France", german: "Germany",
  japanese: "Japan", russian: "Russia", italian: "Italy", spanish: "Spain",
  nigerian: "Nigeria", "south african": "South Africa", chinese: "China",
  korean: "South Korea", mexican: "Mexico", brazilian: "Brazil", swedish: "Sweden",
  norwegian: "Norway", danish: "Denmark", dutch: "Netherlands", polish: "Poland",
  turkish: "Turkey", egyptian: "Egypt", pakistani: "Pakistan", israeli: "Israel",
  bangladeshi: "Bangladesh", kenyan: "Kenya", ghanaian: "Ghana", colombian: "Colombia",
  argentine: "Argentina", chilean: "Chile", portuguese: "Portugal", greek: "Greece",
  austrian: "Austria", swiss: "Switzerland", belgian: "Belgium", finnish: "Finland",
  ukrainian: "Ukraine", czech: "Czech Republic", hungarian: "Hungary",
  vietnamese: "Vietnam", filipino: "Philippines", indonesian: "Indonesia",
  thai: "Thailand", malaysian: "Malaysia", singaporean: "Singapore",
};
function inferCountryFromDescription(shortDescription) {
  if (!shortDescription) return null;
  const lower = shortDescription.toLowerCase();
  for (const [demonym, country] of Object.entries(NATIONALITY_TO_COUNTRY)) {
    if (lower.includes(demonym)) return country;
  }
  return null;
}

// Wikidata P571 (inception) + P159 (headquarters location) for a publisher
// — two more calls (entity + label resolution), only made for publishers
// whose Wikipedia page links to a Wikidata item (most well-known ones do).
async function fetchWikidataFoundedAndHQ(wikidataId) {
  if (!wikidataId) return null;
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    const claims = data.entities?.[wikidataId]?.claims;
    if (!claims) return null;

    let founded = null;
    const inceptionTime = claims.P571?.[0]?.mainsnak?.datavalue?.value?.time;
    if (inceptionTime) {
      const yearMatch = inceptionTime.match(/^\+?(-?\d{1,4})-/);
      if (yearMatch) founded = yearMatch[1];
    }

    let headquarters = null;
    const hqId = claims.P159?.[0]?.mainsnak?.datavalue?.value?.id;
    if (hqId) {
      const labelRes = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${hqId}&props=labels&languages=en&format=json`,
        { headers: UA }
      );
      if (labelRes.ok) {
        const labelData = await labelRes.json();
        headquarters = labelData.entities?.[hqId]?.labels?.en?.value || null;
      }
    }
    return { founded, headquarters };
  } catch {
    return null;
  }
}

// Open Library's work object also carries `series` (a key like
// "/series/OL326110L", not a name) when the book is part of one — resolved
// via one more fetch to the series endpoint itself, which does have `name`.
async function fetchSeriesName(seriesKey) {
  if (!seriesKey) return null;
  try {
    const res = await fetch(`https://openlibrary.org${seriesKey}.json`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    return data.name || null;
  } catch {
    return null;
  }
}

// The physical/media format (Hardcover, Paperback, eBook...) lives on the
// EDITION record, not the work — one more fetch keyed by the book's own ISBN.
async function fetchEditionFormat(isbn) {
  if (!isbn) return null;
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    return data.physical_format || null;
  } catch {
    return null;
  }
}

// Description text stays the primary source for the AI-polished summary;
// `seriesKey` (if present) is resolved separately via fetchSeriesName for
// `collection` — a real, non-hallucinated alternative to the AI-generated
// series name that was previously abandoned for hallucinating badly.
async function fetchWorkDetails(workKey) {
  if (!workKey) return null;
  try {
    const res = await fetch(`https://openlibrary.org${workKey}.json`, { headers: UA });
    if (!res.ok) return null;
    const data = await res.json();
    const desc = data.description;
    const description = desc ? (typeof desc === "string" ? desc : desc.value || null) : null;
    if (!description) return null;
    const seriesEntry = Array.isArray(data.series) ? data.series[0] : null;
    const seriesKey = seriesEntry?.series?.key || null;
    return { description, seriesKey };
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
// name) — tested it live and this small model hallucinates badly: across
// repeated identical calls it repeated the book's own title back as the
// "series name" 3 times out of 4. `collection` now comes from Open
// Library's own `series` field instead (see fetchWorkDetails/
// fetchSeriesName) — a real fact, not a model guess.
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
async function enrichAndCollect(doc, ai, titlesDb, { books, authors, publications, seenAuthorNames, seenPublisherNames }) {
  const isbn = (doc.isbn || [])[0];
  const title = doc.title;
  const authorNames = doc.author_name || [];
  if (!isbn || !title || !authorNames.length) return false;

  // A real synopsis is one more fetch() per book — skip (don't import with
  // a blank) rather than count against the day's budget with thin data.
  const workDetails = await fetchWorkDetails(doc.key);
  if (!workDetails) return false;
  const cleaned = cleanRawText(workDetails.description);
  // OL search docs occasionally repeat the same author name in author_name
  // (e.g. "Daniel Kahneman, Daniel Kahneman") — dedupe before joining.
  const authorLine = [...new Set(authorNames.map((n) => n.trim()))].slice(0, 3).join(", ");
  const polished = await polishSummary(ai, title, authorLine, cleaned);
  const { short, full } = splitDescription(polished || cleaned);
  const { keyPoints } = await generateEnrichment(ai, title, authorLine, full);
  // Both real facts sourced independently of the AI: collection from OL's
  // own series link (resolved to a name), format from the edition record.
  const [collection, format] = await Promise.all([
    fetchSeriesName(workDetails.seriesKey),
    fetchEditionFormat(isbn),
  ]);

  const subjects = (doc.subject || []).filter(isCleanSubject).slice(0, 12);
  const bookStub = {
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
    collection: collection || null,
    format: format || null,
    country: null, // filled in below once the primary author's country is known
    cover_url: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
  };
  books.push(bookStub);

  const authorKeys = doc.author_key || [];
  for (let idx = 0; idx < authorNames.length; idx++) {
    const name = authorNames[idx];
    const olKey = authorKeys[idx];
    const dedupeKey = olKey || name.trim().toLowerCase();
    if (seenAuthorNames.has(dedupeKey)) continue;
    seenAuthorNames.add(dedupeKey);
    // Skip entirely if this author's already known — no Wikipedia/OL
    // author-detail fetches wasted re-deriving data we already have, and
    // no risk of a second stub row for the same person.
    const authorKnown = await titlesDb.prepare(
      "SELECT 1 FROM author_names WHERE lang='en' AND name=?1 COLLATE NOCASE LIMIT 1"
    ).bind(name.trim()).first();
    if (authorKnown) continue;
    // Two independent sources per author: OL's own author record (bio,
    // birth year, photo, links) and Wikipedia's short description, whose
    // nationality phrasing ("British author") is what fills `country` —
    // OL's author record has no nationality field of its own.
    const [details, wiki] = await Promise.all([
      fetchAuthorDetails(olKey),
      fetchWikipediaSummary(name.trim()),
    ]);
    const country = inferCountryFromDescription(wiki?.shortDescription);
    if (idx === 0 && country) bookStub.country = country; // book.country = primary author's country, the closest OL analogue to "country of origin"
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
      country,
    });
  }
  const publisherName = (doc.publisher || [])[0];
  if (publisherName) {
    const key = publisherName.trim().toLowerCase();
    if (!seenPublisherNames.has(key)) {
      seenPublisherNames.add(key);
      const publisherKnown = await titlesDb.prepare(
        "SELECT 1 FROM publisher_names WHERE lang='en' AND name=?1 COLLATE NOCASE LIMIT 1"
      ).bind(publisherName.trim()).first();
      if (publisherKnown) return true;
      const wiki = await fetchWikipediaSummary(publisherName.trim());
      // Founded/headquarters need the Wikidata item linked from the
      // Wikipedia page — only fetched when that link actually exists.
      const wikidata = await fetchWikidataFoundedAndHQ(wiki?.wikidataId);
      publications.push({
        slug: slugify(publisherName),
        lang: "en",
        name: publisherName.trim(),
        about: wiki?.about || null,
        description: wiki?.about ? wiki.about.split(/(?<=[.!?])\s/)[0] : null,
        logo_url: wiki?.logoUrl || null,
        website: wiki?.pageUrl || null,
        founded: wikidata?.founded || null,
        headquarters: wikidata?.headquarters || null,
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
async function fetchCuratedBooks(db, titlesDb, ai, { maxBooks }) {
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
    // Title match against the lightweight titles DB (not catalog — see
    // wrangler.jsonc TITLES_DB binding comment) before spending a single
    // enrichment fetch. CURATED_TITLES entries are specific enough that a
    // title match alone is a safe identity check here.
    const existing = await titlesDb.prepare(
      "SELECT 1 FROM book_titles WHERE lang='en' AND title=?1 COLLATE NOCASE LIMIT 1"
    ).bind(title.trim()).first();
    if (existing) continue;
    let doc;
    try {
      doc = await fetchCuratedMatch(title, author);
    } catch {
      continue;
    }
    if (!doc) continue;
    await enrichAndCollect(doc, ai, titlesDb, { books, authors, publications, seenAuthorNames, seenPublisherNames });
  }

  await db.prepare("UPDATE ol_fetch_state SET curated_index=?1 WHERE id=1").bind(idx).run();
  return { books, authors, publications };
}

// Pulls up to `pages` pages from Open Library's live search API, filtering
// for rating and basic completeness, and returns book/author/publisher
// stubs ready to upsert — advancing (and persisting) the rotation cursor as
// it goes so the next run continues from here instead of restarting.
async function fetchFromOpenLibrary(db, titlesDb, ai, { pages, pageSize, minRating, minReaders, maxBooks }) {
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

    // Cheap pre-filter, no network calls: compute the (title, author) identity
    // every popularity-qualifying candidate would be stored under, then one
    // batched DB lookup for which of those titles already exist. Enrichment
    // (a real synopsis fetch, series resolution, edition format, author +
    // publisher lookups — several fetches per book) then only ever runs on
    // genuinely new candidates.
    //
    // This used to match on the generated slug (title+ISBN) instead — which
    // meant a different ISBN edition of a book already owned got a different
    // slug, sailed past this check, and landed as a second row. Verified live
    // in the catalog: multiple duplicate "Winnie-the-Pooh" entries from
    // exactly this gap. Matching on (title, author) instead recognizes the
    // book itself regardless of which specific edition Open Library hands
    // back this time, and skips straight to the next candidate.
    const qualifying = [];
    for (const doc of docs) {
      // Popularity gate: a high average rating alone lets through obscure
      // books with one perfect vote — readinglog_count (readers who've put
      // this on any shelf: want-to-read + reading + already-read) is what
      // actually distinguishes "widely read" from "technically rated".
      if ((doc.ratings_average || 0) < minRating || (doc.readinglog_count || 0) < minReaders) continue;
      const isbn = (doc.isbn || [])[0];
      const authorNames = doc.author_name || [];
      if (!isbn || !doc.title || !authorNames.length) continue;
      const authorLine = [...new Set(authorNames.map((n) => n.trim()))].slice(0, 3).join(", ");
      qualifying.push({
        doc,
        slug: slugify(doc.title, isbn),
        titleKey: doc.title.trim().toLowerCase(),
        authorKey: authorLine.trim().toLowerCase(),
      });
    }
    // Tied to popularity-qualifying count (not post-dedup count) — a page
    // that's all duplicates still means "keep paging this subject", since
    // there may be genuinely new candidates further in; it's only a truly
    // *empty* page (nothing clears the popularity bar at all) that means
    // this subject is exhausted and it's time to move to the next one.
    const qualifyingOnPage = qualifying.length;

    let newCandidates = qualifying;
    if (qualifying.length) {
      // One indexed point-lookup per distinct title via titlesDb.batch(),
      // not a single WHERE title IN (...) — verified live with EXPLAIN
      // QUERY PLAN that an equivalent index only gets used for a plain
      // `title = ? COLLATE NOCASE`; both `IN (...) COLLATE NOCASE` and an
      // OR-chain fall back to a full scan (every row read, not just a
      // match). Queried against the lightweight titles DB, not catalog —
      // see wrangler.jsonc TITLES_DB binding comment — so this constant
      // background lookup traffic never touches the DB the live website
      // reads from.
      const titleKeys = [...new Set(qualifying.map((q) => q.titleKey))];
      const results = await titlesDb.batch(
        titleKeys.map((t) =>
          titlesDb.prepare("SELECT title, author FROM book_titles WHERE lang=?1 AND title=?2 COLLATE NOCASE").bind("en", t)
        )
      );
      const existingKeys = new Set();
      for (const r of results) {
        for (const row of r.results) existingKeys.add(`${row.title.toLowerCase()}|${row.author.toLowerCase()}`);
      }
      newCandidates = qualifying.filter((q) => !existingKeys.has(`${q.titleKey}|${q.authorKey}`));
    }

    for (const { doc } of newCandidates) {
      if (books.length >= maxBooks) break;
      await enrichAndCollect(doc, ai, titlesDb, { books, authors, publications, seenAuthorNames, seenPublisherNames });
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

async function runImport(env, { maxChunks, maxBooksOverride, curatedOverride, pagesOverride, skipBackfill } = {}) {
  const db = env.DB;
  const titlesDb = env.TITLES_DB;
  const perRunChunks = maxChunks || Number(env.PER_RUN_CHUNKS) || 13;
  const batchSize = Number(env.D1_BATCH_SIZE) || 100;
  // pagesOverride lets a caller (the auto-pilot cron) try several subjects
  // in one invocation instead of giving up after just one — with 1,663+
  // books already imported across many earlier bulk-import bursts, several
  // subjects are now thin at their current rotation offset, so a single
  // subject/page attempt per tick can spend many consecutive ticks just
  // cycling through already-exhausted subjects before landing anything.
  // Empty pages are cheap (one search fetch, no enrichment — see the
  // dedup-before-enrich fix), so trying several per tick costs little.
  const olPages = pagesOverride || (maxChunks ? 1 : (Number(env.OL_PAGES_PER_RUN) || 3));
  const olPageSize = Number(env.OL_PAGE_SIZE) || 100;
  const olMinRating = Number(env.OL_MIN_RATING) || 4.0;
  // readinglog_count = readers who've put this on any shelf (want-to-read +
  // reading + already-read) — the actual "popular / most readers" signal,
  // not just a rating floor a barely-read book could clear with one vote.
  const olMinReaders = Number(env.OL_MIN_READERS) || 200;
  // Every imported book gets a real fetched synopsis (one extra fetch() call
  // each) — capped well under Cloudflare's 50-subrequest-per-invocation free
  // plan limit (search pages + this cap must stay under that, with margin).
  // maxBooksOverride lets a specific caller (the auto-pilot cron) run at a
  // deliberately different, smaller pace than the big scheduled sweep and
  // manual burst button, without those needing separate config.
  const olMaxEnrich = maxBooksOverride || Number(env.OL_MAX_ENRICH_PER_RUN) || 30;
  // How many of this run's book budget go to CURATED_TITLES before falling
  // back to subject rotation — keeps the recognizable "must-have" titles
  // landing early without ballooning subrequest use on top of everything else.
  const olCuratedPerRun = curatedOverride ?? (Number(env.OL_CURATED_PER_RUN) || 5);

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
      const newlyInserted = [];
      results.forEach((res, idx) => {
        if (res.meta.changes > 0) {
          insertedCount += 1;
          newlyInserted.push(slice[idx]);
        } else if (table === "books") skipped += 1;
        if (table === "books" && res.meta.changes > 0) insertedTitles.push(slice[idx].title);
      });
      // Mirror confirmed-new rows' identity into the lightweight titles DB —
      // this is the only write path into it, keeping it in sync with what
      // actually landed in catalog so the next dedup check (which queries
      // titlesDb, never catalog) sees it immediately.
      if (newlyInserted.length) {
        if (table === "books") {
          await titlesDb.batch(newlyInserted.map((r) =>
            titlesDb.prepare("INSERT OR IGNORE INTO book_titles (lang, title, author) VALUES (?1, ?2, ?3)")
              .bind(r.lang || "en", r.title, r.author || "")
          ));
        } else if (table === "authors") {
          await titlesDb.batch(newlyInserted.map((r) =>
            titlesDb.prepare("INSERT OR IGNORE INTO author_names (lang, name) VALUES (?1, ?2)")
              .bind(r.lang || "en", r.name)
          ));
        } else if (table === "publications") {
          await titlesDb.batch(newlyInserted.map((r) =>
            titlesDb.prepare("INSERT OR IGNORE INTO publisher_names (lang, name) VALUES (?1, ?2)")
              .bind(r.lang || "en", r.name)
          ));
        }
      }
    }
    return insertedCount;
  }

  const bookColumns = [
    "slug", "lang", "title", "author", "publisher", "isbn", "published", "page_count", "format",
    "category", "subjects", "genres", "tags", "key_points", "description", "summary", "cover_url", "rating",
    "collection", "country",
  ];
  const toBookValues = (r) => [
    r.slug, r.lang || "en", r.title, r.author || null, r.publisher || null, r.isbn || null,
    r.published || null, r.page_count || null, r.format || null, r.category || null,
    JSON.stringify(r.subjects || []), JSON.stringify(r.genres || []), JSON.stringify(r.tags || []),
    r.key_points ? JSON.stringify(r.key_points) : null,
    r.description || null, r.summary || null, r.cover_url || null, r.rating || null,
    r.collection || null, r.country || null,
  ];
  const bookUpdateCols = ["format", "collection", "country"];
  const authorColumns = ["slug", "lang", "name", "birth_year", "bio", "image_url", "wikipedia_url", "website_url", "genres", "famous_work", "country"];
  const toAuthorValues = (r) => [
    r.slug, r.lang || "en", r.name, r.birth_year || null, r.bio || null,
    r.image_url || null, r.wikipedia_url || null, r.website_url || null,
    r.genres ? JSON.stringify(r.genres) : null, r.famous_work || null, r.country || null,
  ];
  const authorUpdateCols = ["birth_year", "bio", "image_url", "wikipedia_url", "website_url", "genres", "famous_work", "country"];
  const pubColumns = ["slug", "lang", "name", "type", "description", "about", "logo_url", "website", "founded", "headquarters"];
  const toPubValues = (r) => [
    r.slug, r.lang || "en", r.name, r.type || "Publisher",
    r.description || null, r.about || null, r.logo_url || null, r.website || null,
    r.founded || null, r.headquarters || null,
  ];
  const pubUpdateCols = ["type", "description", "about", "logo_url", "website", "founded", "headquarters"];

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
    const curated = await fetchCuratedBooks(db, titlesDb, env.AI, { maxBooks: curatedBudget });
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
    const ol = await fetchFromOpenLibrary(db, titlesDb, env.AI, {
      pages: olPages, pageSize: olPageSize, minRating: olMinRating, minReaders: olMinReaders,
      maxBooks: olBudget,
    });
    if (ol.books.length) source = ol.subject;
    imported += await upsertBatch("books", bookColumns, ol.books, toBookValues);
    authorsImported += await upsertBatch("authors", authorColumns, ol.authors, toAuthorValues, authorUpdateCols);
    publishersImported += await upsertBatch("publications", pubColumns, ol.publications, toPubValues, pubUpdateCols);
  }

  // 3-5. Backfill passes (existing authors' bio/country, publishers'
  // description/founded, books' collection/format/country) — each one is
  // extra network + CPU work (regex-heavy text cleaning, nationality
  // matching, JSON parsing) on top of whatever this run's primary job was.
  // Fine for the big 6-hour sweep and manual burst button, which have a
  // generous time/CPU budget per hop — but the auto-pilot cron fires every
  // single MINUTE, and running all three backfill loops on every one of
  // those ticks was adding enough CPU time to push invocations over the
  // free Workers plan's ~10ms budget: verified live via wrangler tail that
  // this was a real, ongoing cause of "outcome":"exceededCpu" kills, not
  // just a one-time fluke. skipBackfill lets the auto-pilot opt out of all
  // three so its ticks stay small and reliably complete within budget.
  if (!skipBackfill) {
    const { results: sparseAuthors } = await db.prepare(
      "SELECT id, name FROM authors WHERE bio IS NULL OR country IS NULL LIMIT 1"
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
        const [details, wiki] = await Promise.all([
          fetchAuthorDetails(authorKey),
          fetchWikipediaSummary(row.name),
        ]);
        if (!details && !wiki) continue;
        const country = inferCountryFromDescription(wiki?.shortDescription);
        await db.prepare(
          `UPDATE authors SET
            birth_year = COALESCE(?1, birth_year),
            bio = COALESCE(?2, bio),
            image_url = COALESCE(?3, image_url),
            wikipedia_url = COALESCE(?4, wikipedia_url),
            website_url = COALESCE(?5, website_url),
            country = COALESCE(?6, country)
          WHERE id = ?7`
        ).bind(
          details?.birthYear || null, details?.bio || null,
          details?.imageUrl || null, details?.wikipedia || null,
          details?.websiteUrl || null, country || null, row.id
        ).run();
        authorsImported += 1;
      } catch { /* skip this author, try next run */ }
    }

    const { results: sparsePublishers } = await db.prepare(
      "SELECT id, name FROM publications WHERE description IS NULL OR founded IS NULL LIMIT 1"
    ).all();
    for (const row of sparsePublishers) {
      try {
        const wiki = await fetchWikipediaSummary(row.name);
        if (!wiki) continue;
        const wikidata = await fetchWikidataFoundedAndHQ(wiki.wikidataId);
        await db.prepare(
          `UPDATE publications SET
            description = COALESCE(?1, description),
            about = COALESCE(?2, about),
            logo_url = COALESCE(?3, logo_url),
            website = COALESCE(?4, website),
            founded = COALESCE(?5, founded),
            headquarters = COALESCE(?6, headquarters)
          WHERE id = ?7`
        ).bind(
          wiki.about.split(/(?<=[.!?])\s/)[0], wiki.about, wiki.logoUrl, wiki.pageUrl,
          wikidata?.founded || null, wikidata?.headquarters || null, row.id
        ).run();
        publishersImported += 1;
      } catch { /* skip this publisher, try next run */ }
    }

    const { results: sparseBooks } = await db.prepare(
      "SELECT id, isbn, author FROM books WHERE isbn IS NOT NULL AND (collection IS NULL OR format IS NULL OR country IS NULL) LIMIT 1"
    ).all();
    for (const row of sparseBooks) {
      try {
        const searchRes = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(`isbn:${row.isbn}`)}&limit=1&fields=key`,
          { headers: UA }
        );
        if (!searchRes.ok) continue;
        const searchData = await searchRes.json();
        const workKey = searchData.docs?.[0]?.key;
        if (!workKey) continue;
        const workDetails = await fetchWorkDetails(workKey);
        const [collection, format] = await Promise.all([
          fetchSeriesName(workDetails?.seriesKey),
          fetchEditionFormat(row.isbn),
        ]);
        let country = null;
        const primaryAuthor = (row.author || "").split(",")[0]?.trim();
        if (primaryAuthor) {
          const wiki = await fetchWikipediaSummary(primaryAuthor);
          country = inferCountryFromDescription(wiki?.shortDescription);
        }
        if (!collection && !format && !country) continue;
        await db.prepare(
          `UPDATE books SET
            collection = COALESCE(?1, collection),
            format = COALESCE(?2, format),
            country = COALESCE(?3, country)
          WHERE id = ?4`
        ).bind(collection || null, format || null, country || null, row.id).run();
        // Not counted toward `imported` — this enriches an already-counted
        // existing row, it isn't a new book.
      } catch { /* skip this book, try next run */ }
    }
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

// Served at /dashboard. Self-contained (no CDN, no build step) because it
// ships inside the Worker bundle. The admin secret is typed in once and
// held in sessionStorage — never in the URL, never persisted to disk.
const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>BookQubit Import Cron</title>
<style>
  :root {
    --bg: #f6f7f9; --card: #fff; --line: #e3e6ea; --text: #12161c;
    --muted: #667085; --ok: #0a7a44; --okbg: #e6f6ed;
    --bad: #b42318; --badbg: #fdecea; --warn: #a15c07; --warnbg: #fdf3e2;
    --accent: #4338ca;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0c1017; --card: #141a23; --line: #243040; --text: #e8edf4;
      --muted: #93a1b5; --ok: #4ade80; --okbg: #0d2e1e;
      --bad: #f87171; --badbg: #34161a; --warn: #fbbf24; --warnbg: #33270d;
      --accent: #a5b4fc;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    padding: 24px 16px 64px;
  }
  .wrap { max-width: 1040px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0; letter-spacing: -0.01em; }
  .top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
  .badge {
    padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 650;
  }
  .b-ok { background: var(--okbg); color: var(--ok); }
  .b-bad { background: var(--badbg); color: var(--bad); }
  .b-warn { background: var(--warnbg); color: var(--warn); }
  .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
  .card {
    background: var(--card); border: 1px solid var(--line);
    border-radius: 12px; padding: 14px 16px;
  }
  .card .k { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  .card .v { font-size: 24px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .card .s { color: var(--muted); font-size: 12px; margin-top: 2px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em;
       color: var(--muted); margin: 28px 0 10px; }
  .flow { display: flex; gap: 8px; flex-wrap: wrap; align-items: stretch; }
  .step {
    flex: 1 1 150px; background: var(--card); border: 1px solid var(--line);
    border-radius: 12px; padding: 12px 14px; position: relative;
  }
  .step.on { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent); }
  .step .n { font-size: 11px; color: var(--muted); font-weight: 650; }
  .step .t { font-weight: 650; margin-top: 3px; font-size: 14px; }
  .step .d { color: var(--muted); font-size: 12px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; background: var(--card);
          border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  td { padding: 9px 14px; border-top: 1px solid var(--line); font-size: 14px; }
  tr:first-child td { border-top: 0; }
  td:first-child { color: var(--muted); width: 45%; }
  td:last-child { font-variant-numeric: tabular-nums; }
  button {
    font: inherit; font-weight: 600; padding: 9px 16px; border-radius: 9px;
    border: 1px solid var(--line); background: var(--card); color: var(--text); cursor: pointer;
  }
  button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  input {
    font: inherit; padding: 9px 12px; border-radius: 9px;
    border: 1px solid var(--line); background: var(--card); color: var(--text); min-width: 260px;
  }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .muted { color: var(--muted); font-size: 13px; }
  #gate { max-width: 420px; margin: 60px auto; text-align: center; }
  #app { display: none; }
  .err { color: var(--bad); font-size: 13px; }
</style>
</head>
<body>
<div class="wrap">
  <div id="gate">
    <h1>Import Cron Dashboard</h1>
    <p class="muted">Enter the import trigger secret to continue.</p>
    <div class="row" style="justify-content:center">
      <input id="key" type="password" placeholder="IMPORT_TRIGGER_SECRET" autocomplete="off">
      <button class="primary" id="go">Open</button>
    </div>
    <p class="err" id="gateErr"></p>
  </div>

  <div id="app">
    <div class="top">
      <h1>Import Cron</h1>
      <span class="badge" id="health">checking…</span>
      <span class="muted" id="updated"></span>
      <span style="flex:1"></span>
      <button id="startBtn">Start</button>
      <button id="stopBtn">Stop</button>
    </div>

    <div class="grid" id="stats"></div>

    <h2>Pipeline — what it does on each hop</h2>
    <div class="flow" id="flow"></div>

    <h2>State</h2>
    <table id="state"></table>
    <p class="muted" style="margin-top:14px">
      Auto-refreshes every 5s. <code>/health</code> is public and returns 503
      when the import stops — point an uptime monitor at it to get email alerts.
    </p>
  </div>
</div>

<script>
(function () {
  var KEY = "bq_import_key";
  var gate = document.getElementById("gate");
  var app = document.getElementById("app");
  var timer = null;

  function secret() { return sessionStorage.getItem(KEY) || ""; }
  function num(n) { return (n === null || n === undefined) ? "—" : Number(n).toLocaleString(); }

  function ago(ms) {
    if (ms === null || ms === undefined) return "never";
    var s = Math.floor(ms / 1000);
    if (s < 60) return s + "s ago";
    var m = Math.floor(s / 60);
    if (m < 60) return m + "m ago";
    return Math.floor(m / 60) + "h " + (m % 60) + "m ago";
  }

  function card(k, v, s) {
    return '<div class="card"><div class="k">' + k + '</div><div class="v">' + v +
           '</div><div class="s">' + (s || "") + "</div></div>";
  }

  function step(n, title, desc, on) {
    return '<div class="step' + (on ? " on" : "") + '"><div class="n">' + n +
           '</div><div class="t">' + title + '</div><div class="d">' + desc + "</div></div>";
  }

  function render(d) {
    var p = d.progress || {};
    var running = !!p.chain_running;
    var auto = !!p.auto_run_enabled;

    document.getElementById("stats").innerHTML =
      card("Books imported", num(p.total_imported), "total in catalog") +
      card("Today", num(p.imported_today), "cap " + num(p.daily_cap)) +
      card("Authors", num(p.total_authors_imported), "profiles created") +
      card("Publishers", num(p.total_publishers_imported), "profiles created") +
      card("Skipped", num(p.total_skipped), "already known") +
      card("Titles known", num(d.titlesKnown), "dedup index size");

    document.getElementById("flow").innerHTML =
      step("1", "Fetch", "Pull candidate books from Open Library", running) +
      step("2", "Dedup", "Match title+author against titles DB", running) +
      step("3", "Enrich", "Wikipedia/Wikidata for new author + publisher", running) +
      step("4", "Write", "Insert into catalog AND titles together", running) +
      step("5", "Hop", "Chain to next run after a 3s throttle", running);

    var rows = [
      ["Auto-run", auto ? "on" : "off"],
      ["Chain running", running ? "yes" : "no"],
      ["Stop requested", p.stop_requested ? "yes" : "no"],
      ["Last run", ago(d.staleMs)],
      ["Last status", p.last_status || "—"],
      ["Pending chunks", num(d.pendingChunks)],
      ["OL subject index", num(d.fetchState && d.fetchState.query_index)],
      ["OL page offset", num(d.fetchState && d.fetchState.offset_val)]
    ];
    document.getElementById("state").innerHTML = rows.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>";
    }).join("");

    document.getElementById("updated").textContent =
      "updated " + new Date().toLocaleTimeString();
  }

  function health() {
    fetch("/health").then(function (r) {
      return r.json().then(function (j) { return { code: r.status, j: j }; });
    }).then(function (res) {
      var el = document.getElementById("health");
      var s = res.j.status;
      el.textContent = s;
      el.className = "badge " + (res.code === 200
        ? (s === "ok" ? "b-ok" : "b-warn")
        : "b-bad");
    }).catch(function () {});
  }

  function poll() {
    fetch("/status", { headers: { "x-import-secret": secret() } })
      .then(function (r) {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then(render)
      .catch(function (e) {
        if (String(e.message) === "unauthorized") {
          sessionStorage.removeItem(KEY);
          location.reload();
        }
      });
    health();
  }

  function action(path, body) {
    return fetch(path, {
      method: "POST",
      headers: { "x-import-secret": secret(), "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }).then(poll);
  }

  function open_() {
    gate.style.display = "none";
    app.style.display = "block";
    poll();
    timer = setInterval(poll, 5000);
  }

  document.getElementById("go").onclick = function () {
    var v = document.getElementById("key").value.trim();
    if (!v) return;
    sessionStorage.setItem(KEY, v);
    fetch("/status", { headers: { "x-import-secret": v } }).then(function (r) {
      if (r.status === 401) {
        sessionStorage.removeItem(KEY);
        document.getElementById("gateErr").textContent = "Wrong secret.";
        return;
      }
      open_();
    });
  };
  document.getElementById("key").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("go").click();
  });

  document.getElementById("startBtn").onclick = function () {
    action("/auto", { enabled: true });
  };
  document.getElementById("stopBtn").onclick = function () {
    action("/stop");
  };

  if (secret()) open_();
})();
</script>
</body>
</html>`;

export default {
  // Single cron trigger, "* * * * *" — a cheap once-a-minute WATCHDOG, not a
  // pacing mechanism. The actual importing happens via the self-chaining
  // /run?continuous=1 loop below, which hops from one invocation straight to
  // the next with no delay at all (real continuous throughput, not "N books
  // per minute"). This tick's only job: if auto-pilot is on but no chain is
  // currently alive, start a fresh one.
  //
  // "Alive" isn't just the chain_running flag — verified live that if the
  // very first self.fetch() kicking off a chain fails for any reason (seen
  // once right after a fresh deploy, silently swallowed by the .catch()
  // below since a stuck flag must never crash the watchdog), chain_running
  // stays stuck at 1 forever with zero hops ever actually running, and
  // nothing would ever clear it. So a chain also counts as dead if
  // last_run_at hasn't moved in over 2 minutes — comfortably longer than a
  // single hop ever takes — and gets restarted rather than trusted forever.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      (async () => {
        const row = await env.DB.prepare(
          "SELECT auto_run_enabled, chain_running, last_run_at FROM import_progress WHERE id=1"
        ).first();
        if (!row?.auto_run_enabled) return;
        // D1's CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" (space-separated,
        // implicitly UTC, no 'Z') — normalize to real ISO-8601 before parsing.
        const staleMs = row.last_run_at
          ? Date.now() - new Date(row.last_run_at.replace(" ", "T") + "Z").getTime()
          : Infinity;
        if (row.chain_running && staleMs < 120_000) return;
        await env.DB.prepare("UPDATE import_progress SET chain_running=1 WHERE id=1").run();
        await env.SELF.fetch("https://self/run?continuous=1", {
          method: "POST",
          headers: { "x-import-secret": env.IMPORT_TRIGGER_SECRET },
        }).catch(() => {});
      })()
    );
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
      // `target=N` chains hop-to-hop, no fixed chunk count, until the
      // catalog's real total_imported reaches N.
      const target = Number(url.searchParams.get("target")) || 0;
      // `continuous=1` — no target, no burst count, just keeps hopping to
      // itself forever (until stop_requested, the daily cap, or a long
      // empty streak). This is what the per-minute cron watchdog starts and
      // keeps alive — the actual "never-stopping, no fixed count" import
      // process the admin toggle turns on. Each hop does the smallest safe
      // unit of work (1 book, 1 curated title, 1 OL page, no backfill) —
      // production metrics showed even the old 2-book/1-page auto-pilot tick
      // was landing ~13ms median CPU, right at the free-tier ~10ms ceiling,
      // so this trims further rather than risk the same exceeded-CPU failures.
      const continuous = url.searchParams.get("continuous") === "1";
      // How many hops in a row have yielded nothing — a single empty hop is
      // normal (e.g. the current subject/offset is past its popular titles
      // and the cursor just needs to roll to the next of 26 subjects), not
      // a reason to stop. Only a long unbroken run of empty hops (network
      // trouble, OL outage, or genuine exhaustion) should stop the chain —
      // and even then, the cron watchdog will start a fresh one next minute.
      const emptyStreak = Number(url.searchParams.get("empty")) || 0;
      const MAX_EMPTY_STREAK = target > 0 || continuous ? 300 : 30;

      await env.DB.prepare(
        "INSERT INTO import_progress (id, total_imported, total_skipped) VALUES (1, 0, 0) ON CONFLICT(id) DO NOTHING"
      ).run();

      if ((burst > 0 || target > 0 || continuous) && !isChainHop) {
        // A fresh trigger (admin click, or the watchdog starting a new
        // chain) — clear any earlier Stop request.
        await env.DB.prepare("UPDATE import_progress SET stop_requested = 0 WHERE id = 1").run();
      }
      if ((burst > 0 || target > 0 || continuous) && isChainHop) {
        const flag = await env.DB.prepare("SELECT stop_requested FROM import_progress WHERE id = 1").first();
        if (flag?.stop_requested) {
          await env.DB.prepare("UPDATE import_progress SET chain_running = 0 WHERE id = 1").run();
          return Response.json({ stopped: true });
        }
      }

      // ?pages=N lets a manual test call exercise the exact same code path
      // as continuous mode — otherwise a manual /run test only ever
      // exercises the maxChunks-forced single-page behavior.
      const pagesParam = Number(url.searchParams.get("pages")) || (continuous ? 1 : undefined);
      // Burst/target/continuous hops all skip backfill — CPU/subrequest
      // budget goes to finding new books, not enriching already-existing
      // rows. Backfill still happens via the dedicated one-time scripts.
      const result = await runImport(env, {
        maxChunks: maxChunks || (burst || target || continuous ? 1 : undefined),
        maxBooksOverride: continuous ? 1 : undefined,
        curatedOverride: continuous ? 1 : undefined,
        pagesOverride: pagesParam,
        skipBackfill: burst > 0 || target > 0 || continuous,
      });

      const somethingHappened = result.imported > 0 || result.authorsImported > 0 || result.publishersImported > 0 || result.chunksProcessed > 0;
      const newEmptyStreak = somethingHappened ? 0 : emptyStreak + 1;

      let shouldContinue;
      if (continuous) {
        shouldContinue = !result.capped && newEmptyStreak < MAX_EMPTY_STREAK;
      } else if (target > 0) {
        // No fixed hop count — keep chaining until the real catalog total
        // hits the target, checked fresh from the DB each hop (not the
        // per-hop delta, since that'd drift from the true count over
        // thousands of hops).
        const progressRow = await env.DB.prepare("SELECT total_imported FROM import_progress WHERE id=1").first();
        shouldContinue = (progressRow?.total_imported || 0) < target && !result.capped && newEmptyStreak < MAX_EMPTY_STREAK;
      } else {
        shouldContinue = burst > 1 && !result.capped && newEmptyStreak < MAX_EMPTY_STREAK;
      }

      if (shouldContinue) {
        const nextUrl = continuous
          ? `https://self/run?continuous=1&empty=${newEmptyStreak}`
          : target > 0
          ? `https://self/run?target=${target}&empty=${newEmptyStreak}`
          : `https://self/run?burst=${burst - 1}&empty=${newEmptyStreak}`;
        // Continuous mode chained hop-to-hop with zero delay by design (for
        // max throughput) — but with most hops finishing fast (a candidate
        // getting filtered by popularity/dedup costs almost nothing), that
        // meant hundreds+ Worker invocations/minute running 24/7. Verified
        // live twice now: that request *rate* (not row-reads — those were
        // already fixed) is enough on its own to trip Cloudflare's
        // account-level resource limits and take down every Worker on the
        // account with 503s, including the unrelated main site — not a
        // catalog-size or query-cost problem, a sheer-volume one. A small
        // floor between hops keeps continuous growth going indefinitely
        // without ever being able to reproduce that again. Burst/target are
        // bounded, admin-triggered runs (not 24/7), left unthrottled.
        const hopDelayMs = continuous ? 3000 : 0;
        ctx.waitUntil(
          (async () => {
            if (hopDelayMs) await new Promise((resolve) => setTimeout(resolve, hopDelayMs));
            return env.SELF.fetch(nextUrl, {
              method: "POST",
              headers: { "x-import-secret": env.IMPORT_TRIGGER_SECRET, "x-import-chain": "1" },
            }).catch(() => {});
          })()
        );
      } else if (continuous) {
        // Chain is ending (capped, or genuinely exhausted for now) — mark
        // it not-running so next minute's watchdog tick starts a fresh one
        // rather than assuming a chain is still alive forever.
        await env.DB.prepare("UPDATE import_progress SET chain_running = 0 WHERE id = 1").run();
      }

      return Response.json({
        ...result,
        burstRemaining: shouldContinue ? (continuous ? "continuous" : target > 0 ? "until target" : burst - 1) : 0,
        emptyStreak: newEmptyStreak,
      });
    }
    // Lets the admin dashboard halt an in-progress chain — the chain checks
    // this flag before each hop and stops itself rather than the client
    // needing to cancel an in-flight request. Also turns auto-pilot off so
    // next minute's watchdog doesn't immediately start a new chain back up —
    // a real Stop should actually stop, not resume within 60 seconds.
    if (url.pathname === "/stop") {
      const provided = request.headers.get("x-import-secret");
      if (!env.IMPORT_TRIGGER_SECRET || provided !== env.IMPORT_TRIGGER_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      await env.DB.prepare(
        "UPDATE import_progress SET stop_requested = 1, auto_run_enabled = 0, chain_running = 0 WHERE id = 1"
      ).run();
      return Response.json({ stopped: true });
    }
    // Toggles continuous mode the admin dashboard's Start/Stop switch
    // controls: while on, the per-minute cron watchdog keeps a self-chaining
    // import loop alive (see scheduled() above); while off, that same tick
    // is a fast no-op. This just flips the flag — the watchdog starts the
    // actual chain on its next tick.
    if (url.pathname === "/auto") {
      const provided = request.headers.get("x-import-secret");
      if (!env.IMPORT_TRIGGER_SECRET || provided !== env.IMPORT_TRIGGER_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      const body = await request.json().catch(() => ({}));
      const enabled = body.enabled ? 1 : 0;
      await env.DB.prepare(
        "INSERT INTO import_progress (id, total_imported, total_skipped) VALUES (1, 0, 0) ON CONFLICT(id) DO NOTHING"
      ).run();
      // Turning it back on should clear any earlier stop request so the
      // watchdog's next tick can actually start a fresh chain.
      await env.DB.prepare(
        "UPDATE import_progress SET auto_run_enabled = ?1, stop_requested = 0 WHERE id = 1"
      ).bind(enabled).run();
      return Response.json({ autoRunEnabled: !!enabled });
    }
    // ── Monitoring ────────────────────────────────────────────────────────
    // Deliberately PUBLIC and secret-free so an external uptime monitor
    // (or Cloudflare's own health checks) can poll it and email on failure
    // without holding a credential. It exposes only coarse liveness state —
    // no catalog data, no counts that aren't already public on the site.
    //
    // Returns HTTP 503 when the import is not actually progressing, which
    // is what turns "the import silently died" into an email: uptime
    // monitors alert on non-2xx. 200 means books are still flowing.
    if (url.pathname === "/health") {
      const row = await env.DB.prepare(
        "SELECT auto_run_enabled, chain_running, last_run_at, imported_today, daily_cap FROM import_progress WHERE id=1"
      ).first().catch(() => null);

      if (!row) {
        return Response.json({ status: "unknown", reason: "no import_progress row" }, { status: 503 });
      }
      // D1's CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" (UTC, no 'Z') —
      // normalize before parsing, same as the watchdog does.
      const staleMs = row.last_run_at
        ? Date.now() - new Date(row.last_run_at.replace(" ", "T") + "Z").getTime()
        : Infinity;

      // Hitting the daily write cap is the system working as designed, not
      // a failure — it resets tomorrow, so this must not page anyone.
      if (row.daily_cap && row.imported_today >= row.daily_cap) {
        return Response.json({ status: "daily-cap-reached", staleMs }, { status: 200 });
      }
      if (!row.auto_run_enabled) {
        return Response.json({ status: "stopped", reason: "auto_run_enabled is off", staleMs }, { status: 503 });
      }
      // The watchdog restarts a chain it considers dead after 2 minutes, so
      // anything past 10 means even the watchdog isn't recovering it.
      if (staleMs > 600_000) {
        return Response.json({ status: "stalled", reason: "no import activity in over 10 minutes", staleMs }, { status: 503 });
      }
      return Response.json({ status: "ok", staleMs }, { status: 200 });
    }

    // Full metrics for the dashboard — secret-gated, since this joins the
    // progress counters with catalog/titles totals.
    if (url.pathname === "/status") {
      const provided = request.headers.get("x-import-secret");
      if (!env.IMPORT_TRIGGER_SECRET || provided !== env.IMPORT_TRIGGER_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      const [progress, fetchState, chunks, titles] = await Promise.all([
        env.DB.prepare("SELECT * FROM import_progress WHERE id=1").first().catch(() => null),
        env.DB.prepare("SELECT * FROM ol_fetch_state WHERE id=1").first().catch(() => null),
        env.DB.prepare("SELECT COUNT(*) AS n FROM import_chunks WHERE consumed=0").first().catch(() => ({ n: 0 })),
        env.TITLES_DB
          ? env.TITLES_DB.prepare("SELECT COUNT(*) AS n FROM book_titles").first().catch(() => ({ n: 0 }))
          : Promise.resolve({ n: 0 }),
      ]);
      const staleMs = progress?.last_run_at
        ? Date.now() - new Date(progress.last_run_at.replace(" ", "T") + "Z").getTime()
        : null;
      return Response.json({
        progress, fetchState,
        pendingChunks: chunks?.n ?? 0,
        titlesKnown: titles?.n ?? 0,
        staleMs,
        serverTime: new Date().toISOString(),
      });
    }

    // Live dashboard. The HTML shell itself is data-free, so serving it
    // unauthenticated leaks nothing — the secret is entered in the browser,
    // kept in sessionStorage, and sent as a header on each /status poll.
    // Deliberately NOT passed in the URL: query strings end up in logs,
    // history, and referrers.
    // Root serves the dashboard too: Cloudflare's "Visit" button in the
    // Workers dashboard always opens the bare origin, so landing there on a
    // plain-text "is running" line just looks broken. Same page either way.
    if (url.pathname === "/dashboard" || url.pathname === "/") {
      return new Response(DASHBOARD_HTML, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          // This is an internal ops page — keep it out of search results
          // even though it lives on a workers.dev subdomain.
          "x-robots-tag": "noindex, nofollow",
        },
      });
    }
    return new Response("bookqubit-import-cron is running.", { status: 404 });
  },
};
