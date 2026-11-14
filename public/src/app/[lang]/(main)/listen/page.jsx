import Link from "next/link";
import Icon from "@/components/Icon";
import ListenShelf from "@/components/listen/ListenShelf";
import ContinueListening from "@/components/listen/ContinueListening";
import { listBooks, facets } from "@/lib/repo";
import { resolveGenres } from "@/lib/genres";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const metadata = {
  title: "Listen",
  description: "Audio summaries of great books: press play, queue a whole shelf, and keep going while you do something else.",
};
export const dynamic = "force-dynamic";

// Light projection: the client only needs what a tile and the queue show.
const slim = (b) => ({ slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url, lang: b.lang, rating: b.rating, page_count: b.page_count });

export default async function ListenPage() {
  const lang = await getLang();
  const _ = t(lang);
  const [top, fresh, f] = await Promise.all([
    listBooks(lang, { sort: "rating", limit: 24 }),
    listBooks(lang, { sort: "new", limit: 14 }),
    facets(lang),
  ]);
  const genres = resolveGenres(f.categories, { limit: 3 });
  // Genre shelves share one bounded query each; cached by the same layers as every other list.
  const genreShelves = await Promise.all(genres.map(async (g) => ({ g, books: (await listBooks(lang, { category: g.category, sort: "rating", limit: 12 })).map(slim) })));
  // "Quick listens": the shortest books of the top-rated set make the shortest narrations.
  const quick = top.filter((b) => b.page_count && b.page_count <= 260).slice(0, 12).map(slim);

  return (
    <>
      <section className="hero-glow border-b border-[var(--line)]">
        <div className="container-bq py-6 sm:py-12">
          <p className="eyebrow max-sm:!text-[10px]">Listen</p>
          <h1 className="mt-2 text-[1.75rem] font-bold leading-[1.1] sm:text-5xl">Books you can <em className="font-medium italic text-brand-700">listen to</em></h1>
          <p className="text-muted mt-2 max-w-xl text-[13px] leading-snug sm:mt-4 sm:text-lg">
            Press play on any cover. Queue a whole shelf with Play all, change the speed, set a sleep timer, and keep listening while you browse.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
            <Link href={`/${lang}/books`} className="btn-ghost max-sm:!min-h-10 max-sm:!px-4 max-sm:!text-sm"><Icon name="book" size={16} />{_("allBooksMenu")}</Link>
            <Link href={`/${lang}/feed`} prefetch={false} className="btn-ghost max-sm:!min-h-10 max-sm:!px-4 max-sm:!text-sm"><Icon name="newspaper" size={16} />Feed</Link>
          </div>
        </div>
      </section>

      <ContinueListening />

      <ListenShelf title="Top rated" subtitle="Summaries of the books readers rate highest" books={top.slice(0, 12).map(slim)} lang={lang} href={`/${lang}/books?sort=rating`} viewAll={_("viewAll")} />
      <ListenShelf title="Quick listens" subtitle="Short books, short narrations" books={quick} lang={lang} />
      <ListenShelf title={_("newReleases")} books={fresh.map(slim)} lang={lang} href={`/${lang}/books?sort=new`} viewAll={_("viewAll")} />
      {genreShelves.map(({ g, books }) => (
        <ListenShelf key={g.category} title={g.label} books={books} lang={lang} href={`/${lang}/books?category=${encodeURIComponent(g.category)}`} viewAll={_("viewAll")} />
      ))}

      <section className="container-bq pb-10 pt-4">
        <div className="card p-5 text-sm text-[var(--muted)] sm:p-6">
          <h2 className="text-base font-bold text-[var(--fg)]">About these audio summaries</h2>
          <p className="mt-1">
            They are short narrated summaries, not the full audiobook. Where a book has generated audio it plays as a file; otherwise your device reads
            the summary aloud. For the complete audiobook, open the book and choose <b className="text-[var(--fg)]">Audible</b> under “Where to get it”.
          </p>
        </div>
      </section>
    </>
  );
}
