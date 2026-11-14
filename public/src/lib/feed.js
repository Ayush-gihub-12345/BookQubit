import { baselineSummary } from "@/lib/summary";

export const FILTERS = [
  ["for-you", "For you"],
  ["books", "Books"],
  ["audio", "Audio summaries"],
  ["quotes", "Quotes"],
  ["authors", "Authors"],
  ["comics", "Comics"],
];
export const PAGE_SIZE = 12;
export const MAX_PAGE = 20; // bounds OFFSET cost; deeper browsing goes through search/categories

// Mixed feed rhythm per 12 cards: mostly books, with quotes/authors/comics woven in.
const MIX = ["book", "book", "quote", "book", "author", "book", "book", "quote", "book", "comic", "book", "book"];
const AFFILIATE_AT = 5; // index within the page; replaced by a labelled sponsored book card

const parseJson = (v) => { try { const x = JSON.parse(v); return Array.isArray(x) ? x : []; } catch { return []; } };

export function bookCard(row) {
  const keyPoints = parseJson(row.key_points);
  const { script } = baselineSummary({ title: row.title, author: row.author, summary: row.summary, description: row.description, keyPoints });
  return {
    type: "book", slug: row.slug, lang: row.lang, title: row.title, author: row.author, cover_url: row.cover_url,
    rating: row.rating, category: row.category, script, hasSummary: !!(row.summary || row.description || keyPoints.length),
  };
}

/**
 * Build one feed page. `loaders` are injected (and bounded by the caller's SQL LIMITs):
 *   books(limit, offset, filter) quotes(limit, offset) authors(limit, offset) comics(limit, offset)
 * Single-type filters return that type only; "for-you" interleaves using MIX and adds one affiliate card.
 * @returns {Promise<{ cards: object[], nextPage: number|null }>}
 */
export async function buildFeedPage({ filter, page, loaders, lang }) {
  const p = Math.min(Math.max(1, page | 0), MAX_PAGE);
  const single = { books: "book", audio: "book", quotes: "quote", authors: "author", comics: "comic" }[filter];

  if (single) {
    const rows = await loaders[single === "book" ? "books" : single + "s"](PAGE_SIZE, (p - 1) * PAGE_SIZE, filter);
    const cards = rows.map((r) => (single === "book" ? bookCard(r) : { ...r, type: single }));
    return { cards, nextPage: cards.length === PAGE_SIZE && p < MAX_PAGE ? p + 1 : null };
  }

  const need = (t) => MIX.filter((x) => x === t).length;
  const [books, quotes, authors, comics] = await Promise.all([
    // A fixed window of PAGE_SIZE books per page: 8 are used by the mix, the other 4 are a reserve that
    // fills holes when quotes/authors/comics are missing. Fixed windows keep offsets deterministic
    // (no repeats across pages) whatever the mix turns out to be.
    loaders.books(PAGE_SIZE, (p - 1) * PAGE_SIZE, "for-you"),
    loaders.quotes(need("quote"), (p - 1) * need("quote")),
    loaders.authors(need("author"), (p - 1) * need("author")),
    loaders.comics(need("comic"), (p - 1) * need("comic")),
  ]);
  const bookCards = books.map(bookCard);
  const reserve = bookCards.slice(need("book"));
  const pools = { book: bookCards.slice(0, need("book")), quote: quotes.map((r) => ({ ...r, type: "quote" })), author: authors.map((r) => ({ ...r, type: "author" })), comic: comics.map((r) => ({ ...r, type: "comic" })) };
  const cards = [];
  for (const kind of MIX) {
    const next = pools[kind].shift();
    if (next) cards.push(next);
    else if (reserve.length) cards.push(reserve.shift()); // a missing type never leaves a hole
  }
  // One clearly-labelled sponsored card per page, topically matched to the book before it.
  const anchor = cards.slice(0, AFFILIATE_AT).reverse().find((c) => c.type === "book");
  if (anchor) {
    cards.splice(Math.min(AFFILIATE_AT, cards.length), 0, {
      type: "affiliate", slug: anchor.slug, lang: anchor.lang || lang, title: anchor.title, author: anchor.author, cover_url: anchor.cover_url,
      href: `/api/go?slug=${encodeURIComponent(anchor.slug)}&lang=${anchor.lang || lang}&kind=buy`,
    });
  }
  const full = books.length >= need("book");
  return { cards, nextPage: cards.length && full && p < MAX_PAGE ? p + 1 : null };
}

/** Canvas text wrapping (pure: `measure(str) → width`), used for the shareable quote image. */
export function wrapText(measure, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && measure(test) > maxWidth) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
