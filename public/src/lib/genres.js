// A small, curated list of browse genres, validated against what the
// catalog actually contains.
//
// Why this exists: the catalog's `category` column holds raw Open Library
// subject headings, not a taxonomy. The top of the live list reads
// "Fiction" (1,051), "Fiction, Romance, Contemporary" (279), "New York Times
// bestseller" (160), "Cats" (53) — plus near-duplicates that differ only by
// capitalisation ("Juvenile fiction" / "Juvenile Fiction", "Fiction, Romance,
// Contemporary" / "Fiction, romance, contemporary"). Showing that list as
// navigation sends people into buckets that are either junk or split three
// ways. The navigation used to compensate with hand-typed links, and most of
// them led nowhere: every "Special collection", "USA" and "UK" returned zero
// books, and "Self-Help" and "Finance" returned four and three.
//
// The rule here is the opposite of hand-typing: GENRES lists the labels and
// the EXACT category value each one filters on, and resolveGenres() keeps
// only the ones the live facet data confirms exist, with their real counts.
// A genre can therefore never link to an empty page, whatever the catalog
// looks like on the day. The category value stays in its stored English
// form because it is also the filter key in the URL (`?category=…`); the
// same rule the rest of the app applies to catalog data values.
export const GENRES = [
  { label: "Fiction", category: "Fiction" },
  { label: "Romance", category: "Fiction, Romance, Contemporary" },
  { label: "Fantasy", category: "Fantasy" },
  { label: "Science fiction", category: "Science fiction" },
  { label: "Mystery and detective", category: "Detective and mystery stories" },
  { label: "Horror", category: "Horror stories" },
  { label: "Children's", category: "Children's fiction" },
  { label: "Young adult", category: "Young adult fiction" },
  { label: "History", category: "History" },
  { label: "Biography", category: "Biography" },
  { label: "Business", category: "Business" },
  { label: "Psychology", category: "Psychology" },
  { label: "Philosophy", category: "Philosophy" },
  { label: "Poetry", category: "Poetry" },
  { label: "Classics", category: "Classic Literature" },
];

// `categories` is the `facets(lang).categories` array: [{ name, count }].
// Returns genres that exist with at least `minCount` books, most populous
// first, each carrying its real count.
export function resolveGenres(categories = [], { limit = 12, minCount = 5 } = {}) {
  const counts = new Map(categories.map((c) => [c.name, c.count]));
  return GENRES
    .map((g) => ({ ...g, count: counts.get(g.category) || 0 }))
    .filter((g) => g.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
