import Link from "next/link";
import BookCover from "./BookCover";
import TitleTransliterated from "./TitleTransliterated";
import Translated from "./Translated";
import Icon from "./Icon";

// Today's pick (UI v2): one book, shown properly. The cover sits left, the facts and three takeaways right, and
// "Read summary" is the primary action with "Get book" secondary, on purpose: someone arriving on the homepage
// hasn't decided yet, and the book page is where that decision gets made. A single static pick replaces the old
// auto-advancing slider (WCAG 2.2.2) and costs no client JavaScript: it is a server component, and only the pieces
// that translate in the browser (title, author, takeaways) are client components inside it.
export default function FeaturedPick({ lang, book, labels, priority = true }) {
  const href = `/${lang}/books/${encodeURIComponent(book.slug)}`;
  const points = (book.keyPoints || []).slice(0, 3);

  return (
    <article className="card relative grid grid-cols-[88px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-5 sm:p-6 lg:shadow-[var(--shadow-2)]">
      <Link href={href} className="cover mx-auto block w-full" aria-label={book.title}>
        <BookCover title={book.title} author={book.author} cover_url={book.cover_url} priority={priority} />
      </Link>

      <div className="min-w-0">
        <span className="badge badge-marker">{labels.pick}</span>
        <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-tight sm:mt-3 sm:line-clamp-none sm:text-[1.7rem]">
          <Link href={href} className="hover:text-brand-700"><TitleTransliterated text={book.title} /></Link>
        </h2>
        <p className="text-muted mt-1">
          {labels.by} <span className="font-semibold text-[var(--fg)]"><TitleTransliterated text={book.author} /></span>
        </p>
        <dl className="text-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {book.rating ? (
            <div className="flex items-center gap-1">
              <dt className="sr-only">{labels.rating}</dt>
              <dd className="flex items-center gap-1"><Icon name="star" size={14} filled className="stars" /><b className="text-[var(--fg)]">{Number(book.rating).toFixed(1)}</b></dd>
            </div>
          ) : null}
          {book.page_count ? <div><dt className="sr-only">{labels.pages}</dt><dd>{book.page_count} {labels.pages}</dd></div> : null}
          {book.published ? <div><dt className="sr-only">{labels.published}</dt><dd>{book.published}</dd></div> : null}
          {book.category ? <div><dt className="sr-only">Genre</dt><dd><span className="pill !h-7 !text-xs">{book.category}</span></dd></div> : null}
        </dl>

        {points.length > 0 && (
          <>
            <h3 className="sr-only">{labels.keyPoints}</h3>
            <ul className="mt-4 hidden space-y-2 text-[15px] sm:block">
              {points.map((k) => (
                <li key={k} className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /><Translated text={k} /></li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-5">
          <Link href={`${href}#summary`} className="btn-primary btn-sm"><Icon name="book" size={16} />{labels.summary}</Link>
          {book.buyUrl && (
            <a href={book.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-ghost btn-sm">
              <Icon name="cart" size={16} />{labels.getBook}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
