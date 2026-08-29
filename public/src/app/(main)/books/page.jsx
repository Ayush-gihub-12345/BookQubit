import BooksBrowser from "@/components/BooksBrowser";
import { queryBooks, facets, getMoodCounts } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const parts = [sp.q && `"${sp.q}"`, sp.category, sp.collection, sp.tag && `#${sp.tag}`].filter(Boolean);
  return { title: parts.length ? `${parts.join(" · ")} — Books` : "Browse Books" };
}

// Server component: renders the first page for SEO/no-JS, then hands off to
// the client BooksBrowser for instant, reload-free filtering.
export default async function BooksPage({ searchParams }) {
  const sp = await searchParams;
  const lang = await getLang();
  const params = {
    q: sp.q, category: sp.category, tag: sp.tag, collection: sp.collection,
    sort: sp.sort, rating: sp.rating, format: sp.format, country: sp.country,
    mood: sp.mood, view: sp.view, page: sp.page ? parseInt(sp.page) : undefined,
  };

  const [rawInitialData, f, moods] = await Promise.all([
    queryBooks(lang, { ...params, minRating: params.rating, page: params.page || 1 }),
    facets(lang),
    getMoodCounts(),
  ]);

  // Trimmed to only what BookCard/BooksBrowser actually render before this
  // gets serialized into the page as hydration props. queryBooks()/mapBook()
  // return every catalog column (description, summary, key_points, subjects,
  // genres, tags, buyUrl, isbn, publisher, format, plus the now-unused
  // difficulty_score/pct_length/difficulty_bucket columns left over from a
  // reverted feature) — none of that is used by the grid view, and only
  // `description` is used (truncated) by the list view.
  //
  // This isn't just a size optimization: verified live that shipping the
  // full-fat objects here was enough to break the page's server render
  // outright on this Cloudflare Workers/OpenNext runtime — the raw HTML had
  // a `<div hidden id="S:2">` holding the entire browse UI with no matching
  // reveal script anywhere in the response, so 0 of 32 book cards were
  // actually visible. Same root cause and same fix as the /authors and
  // /publications payload trims done earlier.
  const initialData = {
    ...rawInitialData,
    books: rawInitialData.books.map((b) => ({
      id: b.id, slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url,
      rating: b.rating, category: b.category, page_count: b.page_count, published: b.published,
      description: b.description ? b.description.slice(0, 200) : b.description,
    })),
  };

  // Keyed on the actual URL params: BooksBrowser is a client component that
  // seeds its filter/sort/list state from initialParams/initialData via
  // useState on mount only. Navigating here from a nav/footer link (e.g.
  // "All Books", "Top Rated") changes the URL and these props, but without a
  // key React reuses the same component instance and its internal state
  // never re-syncs — the page looked stuck showing whatever was filtered
  // before. Keying on the params forces a real remount on every distinct
  // filter combination, same fix either way something changes the URL.
  return (
    <BooksBrowser
      key={JSON.stringify(params)}
      lang={lang}
      initialParams={params}
      initialData={initialData}
      facets={{ ...f, moods }}
    />
  );
}
