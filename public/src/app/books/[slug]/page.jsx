import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Rating from "@/components/Rating";
import Section from "@/components/Section";
import WishlistButton from "@/components/WishlistButton";
import ShelfControls from "@/components/ShelfControls";
import BookCover from "@/components/BookCover";
import { getBook, relatedBooks, getBookAlternates, getBookCommunity } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lang = await getLang();
  const book = await getBook(slug, lang);
  if (!book) return { title: "Book Not Found", robots: { index: false } };

  const alternates = await getBookAlternates(book);
  const languages = Object.fromEntries(
    alternates.map((a) => [a.lang, `/books/${encodeURIComponent(a.slug)}`])
  );

  return {
    title: `${book.title} by ${book.author}`,
    description: book.description?.slice(0, 160),
    alternates: {
      canonical: `/books/${encodeURIComponent(book.slug)}`,
      languages,
    },
    openGraph: {
      title: book.title,
      description: book.description?.slice(0, 160),
      type: "book",
      images: book.cover_url ? [{ url: book.cover_url }] : [],
    },
  };
}

export default async function BookPage({ params }) {
  const { slug } = await params;
  const lang = await getLang();
  const book = await getBook(slug, lang);
  if (!book) notFound();
  const [related, community] = await Promise.all([
    relatedBooks(book, lang),
    getBookCommunity(book.slug),
  ]);
  const _ = t(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: book.author ? { "@type": "Person", name: book.author } : undefined,
    publisher: book.publisher ? { "@type": "Organization", name: book.publisher } : undefined,
    isbn: book.isbn || undefined,
    numberOfPages: book.page_count || undefined,
    bookFormat: book.format || undefined,
    image: book.cover_url || undefined,
    description: book.description?.slice(0, 300),
    aggregateRating: book.rating
      ? { "@type": "AggregateRating", ratingValue: book.rating, bestRating: "5", ratingCount: 1 }
      : undefined,
  };

  const meta = [
    ["Publisher", book.publisher],
    ["Published", book.published],
    ["Pages", book.page_count],
    ["Format", book.format],
    ["ISBN", book.isbn],
    ["Country", book.country],
  ].filter(([, v]) => v);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/books" className="hover:text-brand-600">Books</Link>
          {book.category && (
            <>
              {" / "}
              <Link href={`/books?category=${encodeURIComponent(book.category)}`} className="hover:text-brand-600">
                {book.category}
              </Link>
            </>
          )}
          {" / "}<span className="text-slate-700 dark:text-slate-300">{book.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <div className="card aspect-[2/3] overflow-hidden !shadow-xl hover:!translate-y-0">
              <BookCover title={book.title} author={book.author} cover_url={book.cover_url} />
            </div>
            <div className="mt-5 space-y-3">
              {book.buyUrl && (
                <a href={book.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-primary w-full">
                  🛒 {_("buy")} {book.price && `· ${book.price}`}
                </a>
              )}
              {book.audiobook_url && (
                <a href={book.audiobook_url} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
                  🎧 {_("listen")}
                </a>
              )}
              <WishlistButton book={book} labels={{ save: _("save"), saved: _("saved") }} />
              <ShelfControls slug={book.slug} />
              <p className="text-center text-xs text-slate-400">
                As an Amazon Associate we earn from qualifying purchases.
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{book.title}</h1>
            <p className="mt-2 text-lg text-slate-500">
              by{" "}
              <Link href={`/books?q=${encodeURIComponent(book.author || "")}`} className="font-medium text-brand-600 hover:underline">
                {book.author}
              </Link>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Rating value={book.rating} />
              {book.collection && (
                <Link href={`/collections/${encodeURIComponent(book.collection)}`} className="pill">
                  {book.collection}
                </Link>
              )}
            </div>

            {book.description && <p className="mt-6 text-lg leading-relaxed">{book.description}</p>}

            {book.keyPoints.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("keyTakeaways")}</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {book.keyPoints.map((k) => (
                    <li key={k} className="flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm dark:bg-slate-800">
                      <span className="text-brand-600">✓</span> {k}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {book.summary && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("summary")}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
                  {book.summary}
                </p>
              </div>
            )}

            {meta.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("details")}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {meta.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt>
                      <dd className="text-sm font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {book.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {book.tags.map((t) => (
                  <Link key={t} href={`/books?tag=${encodeURIComponent(t)}`} className="pill">#{t}</Link>
                ))}
              </div>
            )}

            {/* Community section */}
            <div className="mt-10">
              <h2 className="text-xl font-bold">Community</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-[220px_1fr]">
                <div className="card p-5 text-center hover:!translate-y-0">
                  <p className="text-4xl font-extrabold">{community.avg_rating ?? "—"}</p>
                  <p className="text-amber-400">{"★".repeat(Math.round(community.avg_rating || 0)) || "☆☆☆☆☆"}</p>
                  <p className="text-muted mt-1 text-xs">{community.rating_count} ratings from readers</p>
                  <div className="text-muted mt-4 space-y-1 text-xs">
                    <p>🔖 {community.want || 0} want to read</p>
                    <p>📖 {community.reading || 0} reading now</p>
                    <p>✅ {community.read || 0} have read it</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {community.distribution.map((d) => {
                    const pct = community.rating_count ? Math.round((d.n / community.rating_count) * 100) : 0;
                    return (
                      <div key={d.star} className="flex items-center gap-3 text-xs">
                        <span className="w-8">{d.star} ★</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-muted w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {community.reviews.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-bold">Reader Reviews ({community.reviews.length})</h3>
                  {community.reviews.map((r) => (
                    <div key={`${r.user_id}-${r.updated_at}`} className="card p-5 hover:!translate-y-0">
                      <div className="flex items-center gap-3">
                        {r.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.photo_url} alt="" className="h-9 w-9 rounded-full" />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                            {(r.name || "R")[0].toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link href={`/readers/${r.user_id}`} className="text-sm font-semibold hover:text-brand-600">{r.name}</Link>
                          <p className="text-muted text-xs">{r.updated_at?.slice(0, 10)}</p>
                        </div>
                        {r.rating && <span className="text-sm text-amber-400">{"★".repeat(r.rating)}</span>}
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{r.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section title={_("related")}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </Section>
      )}
    </>
  );
}
