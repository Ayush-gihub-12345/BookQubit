import Link from "next/link";
import BookCard from "@/components/BookCard";
import { listBooks, facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export const metadata = { title: "Browse Books" };

export default async function BooksPage({ searchParams }) {
  const sp = await searchParams;
  const lang = await getLang();
  const { q, category, tag, collection, sort } = sp;
  const [books, f] = await Promise.all([
    listBooks(lang, { q, category, tag, collection, sort }),
    facets(lang),
  ]);

  const link = (params) => {
    const s = new URLSearchParams(Object.fromEntries(Object.entries({ q, category, tag, collection, sort, ...params }).filter(([, v]) => v)));
    return `/books${s.size ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {q ? `Results for “${q}”` : category || collection || tag || "All Books"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{books.length} books</p>
        </div>
        <div className="flex gap-2">
          {[["", "Default"], ["rating", "Top Rated"], ["new", "Newest"], ["title", "A–Z"]].map(([v, label]) => (
            <Link
              key={label}
              href={link({ sort: v || undefined })}
              className={`pill ${sort === v || (!sort && !v) ? "!bg-brand-600 !text-white" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {(category || tag || collection || q) && (
        <Link href="/books" className="mb-6 inline-block text-sm text-brand-600 hover:underline">
          ← Clear filters
        </Link>
      )}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Categories</p>
          <ul className="space-y-1.5">
            {f.categories.map((c) => (
              <li key={c.name}>
                <Link
                  href={link({ category: c.name })}
                  className={`text-sm hover:text-brand-600 ${category === c.name ? "font-semibold text-brand-600" : ""}`}
                >
                  {c.name} <span className="text-slate-400">({c.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {books.length ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            <p className="text-5xl">📖</p>
            <p className="mt-4 text-lg font-medium">No books found</p>
            <p className="text-sm">Try a different search or clear the filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
