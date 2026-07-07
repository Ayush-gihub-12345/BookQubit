import { getDb } from "./d1";
import { cached } from "./kv";

const parse = (v) => (v ? JSON.parse(v) : undefined);

function mapRow(row) {
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOC_TAG;
  const getBook = row.amazon_asin && tag
    ? `https://www.amazon.com/dp/${row.amazon_asin}?tag=${tag}`
    : row.amazon_url || "#";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    publisher: row.publisher,
    price: row.price,
    isbn: row.isbn,
    language: row.language,
    published: row.published,
    originalPublished: row.original_published,
    pageCount: row.page_count,
    format: row.format,
    description: row.description,
    summary: row.summary,
    category: row.category,
    collection: row.collection,
    genres: parse(row.genres_json) || [],
    subjects: parse(row.subjects_json) || [],
    tags: parse(row.tags_json) || [],
    keyPoints: parse(row.key_points_json) || [],
    rating: row.rating,
    imageUrl: row.image_url,
    geography: {
      country: row.country,
      continent: row.continent,
      subRegion: row.sub_region,
    },
    buttons: {
      knowMore: row.know_more_url || `/books/${row.slug}`,
      getBook,
      readSummary: row.read_summary_url || "#",
      listenAudiobook: row.listen_audiobook_url || "#",
    },
  };
}

async function fetchAllForLang(lang) {
  return cached(`books:${lang}`, async () => {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT * FROM books WHERE lang = ?1 ORDER BY id ASC")
      .bind(lang)
      .all();
    return results.map(mapRow);
  });
}

export async function getBooksByLanguage(lang) {
  const books = await fetchAllForLang(lang);
  if (books.length) return books;
  return lang === "en" ? books : fetchAllForLang("en");
}

export async function getBookBySlug(slug, lang) {
  if (!slug) return null;
  const books = await getBooksByLanguage(lang);
  const bySlug = books.find((b) => b.slug?.toLowerCase() === slug.toLowerCase());
  if (bySlug) return bySlug;
  if (!isNaN(slug)) return books.find((b) => b.id === parseInt(slug)) || null;
  return null;
}

export async function getBooksByCategory(category, lang) {
  const books = await getBooksByLanguage(lang);
  return books.filter((b) => b.category?.toLowerCase() === category?.toLowerCase());
}

export async function getBooksByCollection(collection, lang) {
  const books = await getBooksByLanguage(lang);
  return books.filter((b) => b.collection?.toLowerCase() === collection?.toLowerCase());
}

export async function getBooksByTag(tag, lang) {
  const books = await getBooksByLanguage(lang);
  const term = tag?.toLowerCase();
  return books.filter((b) => b.tags?.some((t) => t.toLowerCase() === term));
}

export async function searchBooks(term, lang) {
  const books = await getBooksByLanguage(lang);
  if (!term) return books;
  const q = term.toLowerCase();
  return books.filter(
    (b) =>
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

export async function getFeaturedBooks(lang, limit = 6) {
  const books = await getBooksByLanguage(lang);
  return books.slice(0, limit);
}

export async function getTopRatedBooks(lang, limit = 6) {
  const books = await getBooksByLanguage(lang);
  return [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, limit);
}

export async function getNewReleaseBooks(lang, limit = 6) {
  const books = await getBooksByLanguage(lang);
  return [...books].sort((a, b) => (b.published || b.id) - (a.published || a.id)).slice(0, limit);
}

export async function getBestsellerBooks(lang, limit = 6) {
  // No sales-rank data yet; bestsellers reuses the top-rated ordering.
  return getTopRatedBooks(lang, limit);
}

// Aggregate facets (categories, collections, tags, countries) derived from the
// cached book list for a language — replaces the old client-side reduces over
// the static book arrays (TagsData.js, useCollectionFiltering.js, useCategories.jsx).
export async function getCatalogFacets(lang) {
  return cached(`facets:${lang}`, async () => {
    const books = await getBooksByLanguage(lang);

    const categories = [...new Set(books.map((b) => b.category).filter(Boolean))].sort();
    const countries = [...new Set(books.map((b) => b.geography?.country).filter(Boolean))].sort();

    const collectionsMap = {};
    for (const book of books) {
      if (!book.collection) continue;
      (collectionsMap[book.collection] ||= []).push(book);
    }

    const tagsMap = new Map();
    for (const book of books) {
      for (const tag of book.tags || []) {
        const key = tag.toLowerCase().trim();
        const slug = tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (!tagsMap.has(key)) tagsMap.set(key, { name: tag, slug, count: 0 });
        tagsMap.get(key).count += 1;
      }
    }
    const tags = [...tagsMap.values()].sort((a, b) => b.count - a.count);

    return { categories, countries, collections: collectionsMap, tags };
  });
}
