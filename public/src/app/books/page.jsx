import Link from "next/link";
import BookCard from "@/components/BookCard";
import BookCover from "@/components/BookCover";
import Rating from "@/components/Rating";
import Icon from "@/components/Icon";
import { queryBooks, facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const parts = [sp.q && `“${sp.q}”`, sp.category, sp.collection, sp.tag && `#${sp.tag}`].filter(Boolean);
  return { title: parts.length ? `${parts.join(" · ")} — Books` : "Browse Books" };
}

const SORTS = [
  ["", "Relevance"],
  ["rating", "Top Rated"],
  ["new", "Newest"],
  ["title", "Title A–Z"],
];
const RATINGS = [["4.5", "4.5 & up"], ["4", "4.0 & up"], ["3", "3.0 & up"]];
const FORMATS = ["Paperback", "Hardcover", "EBook"];

export default async function BooksPage({ searchParams }) {
  const sp = await searchParams;
  const lang = await getLang();
  const { q, category, tag, collection, sort, rating, format, country, view } = sp;
  const page = Math.max(1, parseInt(sp.page) || 1);

  const [result, f] = await Promise.all([
    queryBooks(lang, { q, category, tag, collection, format, country, minRating: rating, sort, page }),
    facets(lang),
  ]);
  const { books, total, pages } = result;

  const params = { q, category, tag, collection, sort, rating, format, country, view };
  const link = (patch) => {
    const merged = { ...params, ...patch };
    if (!("page" in patch)) delete merged.page; // filter changes reset to page 1
    const s = new URLSearchParams(Object.fromEntries(Object.entries(merged).filter(([, v]) => v)));
    return `/books${s.size ? `?${s}` : ""}`;
  };

  const activeFilters = [
    q && { label: `“${q}”`, clear: link({ q: undefined }) },
    category && { label: category, clear: link({ category: undefined }) },
    collection && { label: collection, clear: link({ collection: undefined }) },
    tag && { label: `#${tag}`, clear: link({ tag: undefined }) },
    rating && { label: `★ ${rating}+`, clear: link({ rating: undefined }) },
    format && { label: format, clear: link({ format: undefined }) },
    country && { label: country, clear: link({ country: undefined }) },
  ].filter(Boolean);

  const isList = view === "list";

  // pagination window
  const win = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) win.push(p);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb + header */}
      <nav className="text-muted text-xs">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-1.5">/</span>
        <span>Books</span>
        {category && (<><span className="mx-1.5">/</span><span className="text-brand-600">{category}</span></>)}
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {q ? `Results for “${q}”` : category || collection || (tag && `#${tag}`) || "All Books"}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {total.toLocaleString()} {total === 1 ? "book" : "books"}
            {pages > 1 && ` · page ${page} of ${pages}`}
          </p>
        </div>

        {/* Toolbar: sort + view */}
        <div className="flex items-center gap-2">
          <div className="border-line bg-surface flex rounded-xl border p-1 text-xs font-semibold">
            {SORTS.map(([v, label]) => (
              <Link key={label} href={link({ sort: v || undefined })}
                className={`rounded-lg px-3 py-1.5 transition ${(sort || "") === v ? "bg-brand-600 text-white shadow" : "hover:text-brand-600"}`}>
                {label}
              </Link>
            ))}
          </div>
          <div className="border-line bg-surface flex rounded-xl border p-1">
            <Link href={link({ view: undefined })} aria-label="Grid view"
              className={`rounded-lg px-2.5 py-1.5 ${!isList ? "bg-brand-600 text-white" : "text-muted hover:text-brand-600"}`}>
              <Icon name="grid" size={14} />
            </Link>
            <Link href={link({ view: "list" })} aria-label="List view"
              className={`rounded-lg px-2.5 py-1.5 ${isList ? "bg-brand-600 text-white" : "text-muted hover:text-brand-600"}`}>
              <Icon name="menu" size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((fl) => (
            <Link key={fl.label} href={fl.clear} className="pill group">
              {fl.label} <Icon name="x" size={11} className="ml-1.5 opacity-60 group-hover:opacity-100" />
            </Link>
          ))}
          <Link href="/books" className="text-xs font-semibold text-brand-600 hover:underline">Clear all</Link>
        </div>
      )}

      {/* Mobile category strip */}
      <div className="hscroll mt-4 lg:hidden">
        {f.categories.map((c) => (
          <Link key={c.name} href={link({ category: category === c.name ? undefined : c.name })}
            className={`pill whitespace-nowrap ${category === c.name ? "!bg-brand-600 !text-white" : ""}`}>
            {c.name} <span className="ml-1 opacity-60">{c.count}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filter sidebar */}
        <aside className="hidden space-y-7 lg:block">
          <div>
            <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Categories</p>
            <ul className="space-y-1">
              {f.categories.map((c) => (
                <li key={c.name}>
                  <Link href={link({ category: category === c.name ? undefined : c.name })}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-brand-50 dark:hover:bg-white/5 ${category === c.name ? "bg-brand-50 font-semibold text-brand-600 dark:bg-white/5" : ""}`}>
                    <span className="line-clamp-1">{c.name}</span>
                    <span className="text-muted text-xs">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Rating</p>
            <ul className="space-y-1">
              {RATINGS.map(([v, label]) => (
                <li key={v}>
                  <Link href={link({ rating: rating === v ? undefined : v })}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-brand-50 dark:hover:bg-white/5 ${rating === v ? "bg-brand-50 font-semibold text-brand-600 dark:bg-white/5" : ""}`}>
                    <span className="text-amber-400">★</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Format</p>
            <ul className="space-y-1">
              {FORMATS.map((fmt) => (
                <li key={fmt}>
                  <Link href={link({ format: format === fmt ? undefined : fmt })}
                    className={`block rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-brand-50 dark:hover:bg-white/5 ${format === fmt ? "bg-brand-50 font-semibold text-brand-600 dark:bg-white/5" : ""}`}>
                    {fmt}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {f.collections.length > 0 && (
            <div>
              <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Collections</p>
              <ul className="space-y-1">
                {f.collections.slice(0, 8).map((c) => (
                  <li key={c.name}>
                    <Link href={link({ collection: collection === c.name ? undefined : c.name })}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-brand-50 dark:hover:bg-white/5 ${collection === c.name ? "bg-brand-50 font-semibold text-brand-600 dark:bg-white/5" : ""}`}>
                      <span className="line-clamp-1">{c.name}</span>
                      <span className="text-muted text-xs">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Results */}
        <div>
          {books.length === 0 ? (
            <div className="py-24 text-center">
              <Icon name="search" size={40} className="text-muted mx-auto" />
              <p className="mt-4 text-lg font-semibold">No books found</p>
              <p className="text-muted mt-1 text-sm">Try adjusting your filters or search terms.</p>
              <Link href="/books" className="btn-primary mt-5 inline-flex">Clear filters</Link>
            </div>
          ) : isList ? (
            <div className="space-y-4">
              {books.map((b) => (
                <Link key={b.id} href={`/books/${encodeURIComponent(b.slug)}`}
                  className="card flex gap-5 p-4 hover:!translate-y-0">
                  <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg shadow">
                    <BookCover title={b.title} author={b.author} cover_url={b.cover_url} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold hover:text-brand-600">{b.title}</h2>
                        <p className="text-muted text-sm">{b.author}</p>
                      </div>
                      {b.price && <span className="shrink-0 text-sm font-bold text-brand-600">{b.price}</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                      <Rating value={b.rating} />
                      {b.category && <span className="pill !text-[10px]">{b.category}</span>}
                      {b.page_count && <span className="text-muted">{b.page_count} pages</span>}
                      {b.published && <span className="text-muted">{b.published}</span>}
                    </div>
                    <p className="text-muted mt-2 line-clamp-2 text-sm leading-relaxed">{b.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {books.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
              {page > 1 && (
                <Link href={link({ page: page - 1 })} className="btn-ghost !px-3 !py-2 text-sm">←</Link>
              )}
              {win[0] > 1 && (
                <>
                  <Link href={link({ page: 1 })} className="btn-ghost !px-3.5 !py-2 text-sm">1</Link>
                  {win[0] > 2 && <span className="text-muted px-1">…</span>}
                </>
              )}
              {win.map((p) => (
                <Link key={p} href={link({ page: p })}
                  className={p === page ? "btn-primary !px-3.5 !py-2 text-sm" : "btn-ghost !px-3.5 !py-2 text-sm"}>
                  {p}
                </Link>
              ))}
              {win[win.length - 1] < pages && (
                <>
                  {win[win.length - 1] < pages - 1 && <span className="text-muted px-1">…</span>}
                  <Link href={link({ page: pages })} className="btn-ghost !px-3.5 !py-2 text-sm">{pages}</Link>
                </>
              )}
              {page < pages && (
                <Link href={link({ page: page + 1 })} className="btn-ghost !px-3 !py-2 text-sm">→</Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
