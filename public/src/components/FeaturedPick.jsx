import Link from "next/link";
import BookCover from "./BookCover";
import TitleTransliterated from "./TitleTransliterated";
import Translated from "./Translated";

// Today's pick: one book, shown properly, in place of the rotating slider.
//
// The slider it replaces advanced itself every six seconds with no way to
// pause it (WCAG 2.2.2 requires one for moving content over five seconds),
// hid four of its five books at any moment, and cost a client component with
// a timer on the page that gets the most traffic. A single, static pick is
// calmer, loads with the page, and gives the cover the room it needs.
//
// "Summary" is the primary action and "Get book" the secondary one on
// purpose: someone arriving on the homepage hasn't decided yet, and the book
// page, where the summary, takeaways and similar books sit around the buy
// link, is where that decision gets made.
//
// It is a server component. Only the pieces that must translate in the
// browser (title, author, takeaways) are client components inside it.
export default function FeaturedPick({ lang, book, labels }) {
  const href = `/${lang}/books/${encodeURIComponent(book.slug)}`;
  const points = (book.keyPoints || []).slice(0, 3);

  return (
    <article className="card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Link href={href} className="cover block aspect-[2/3] sm:row-span-2" aria-label={book.title}>
          <BookCover title={book.title} author={book.author} cover_url={book.cover_url} priority />
        </Link>

        <div className="min-w-0 self-start">
          <span className="inline-flex min-h-7 items-center rounded-md bg-marker px-2.5 text-xs font-semibold text-marker-ink">
            {labels.pick}
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
            <Link href={href} className="hover:text-brand-600">
              <TitleTransliterated text={book.title} />
            </Link>
          </h2>
          <p className="text-muted mt-1">
            {labels.by} <span className="font-medium text-[var(--fg)]"><TitleTransliterated text={book.author} /></span>
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {book.rating ? (
              <div className="flex items-center gap-1">
                <dt className="sr-only">{labels.rating}</dt>
                <dd><span className="text-amber-500" aria-hidden>★</span> {Number(book.rating).toFixed(1)}</dd>
              </div>
            ) : null}
            {book.page_count ? (
              <div><dt className="sr-only">{labels.pages}</dt><dd>{book.page_count} {labels.pages}</dd></div>
            ) : null}
            {book.published ? (
              <div><dt className="sr-only">{labels.published}</dt><dd>{labels.published} {book.published}</dd></div>
            ) : null}
          </dl>
        </div>

        <div className="col-span-2 min-w-0 sm:col-span-1">
          {points.length > 0 && (
            <>
              <h3 className="text-sm font-semibold">{labels.keyPoints}</h3>
              <ul className="mt-2 max-w-prose list-disc space-y-1.5 ps-5 text-[15px] marker:text-brand-600">
                {points.map((k) => (
                  <li key={k}><Translated text={k} /></li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={href} className="btn-primary">{labels.summary}</Link>
            {book.buyUrl && (
              <a href={book.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-ghost">
                {labels.getBook}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
