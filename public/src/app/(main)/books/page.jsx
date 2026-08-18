import BooksBrowser from "@/components/discovery/books_discovery/BooksBrowser";
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

  const [initialData, f, moods] = await Promise.all([
    queryBooks(lang, { ...params, minRating: params.rating, page: params.page || 1 }),
    facets(lang),
    getMoodCounts(),
  ]);

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
