import Link from "next/link";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import FeaturedPick from "@/components/FeaturedPick";
import ContinueReading from "@/components/ContinueReading";
import Icon from "@/components/Icon";
import ForYou from "@/components/ForYou";
import RecentlyViewed from "@/components/RecentlyViewed";
import TitleTransliterated from "@/components/TitleTransliterated";
import HScrollRow from "@/components/HScrollRow";
import {
  listBooks, facets, getFeaturedAuthors, getMoodCounts, getFeaturedBooks, getBestsellerBooks,
} from "@/lib/repo";
import { resolveGenres } from "@/lib/genres";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const lang = await getLang();
  return { alternates: { canonical: `/${lang}` } };
}

// The homepage is for orientation, not for showing everything the catalog
// has: one featured book, the reader's own shelf (when signed in), a way into
// the catalog by genre, what's new, some authors, and links to the rest of
// the site. It used to be seventeen blocks and thirteen queries, including
// three whole-table reads (every author, publisher and comic) to render a
// handful of cards each.
export default async function Home() {
  const lang = await getLang();
  const _ = t(lang);
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;

  const [featuredBooks, bestsellers, topRated, newReleases, f, authors, moods] = await Promise.all([
    getFeaturedBooks(lang, 5),
    getBestsellerBooks(lang, 12),
    listBooks(lang, { sort: "rating", limit: 12 }),
    listBooks(lang, { sort: "new", limit: 6 }),
    facets(lang),
    getFeaturedAuthors(lang, 10),
    getMoodCounts(),
  ]);

  // Today's pick rotates daily through the curated featured books (or the
  // best-rated ones when none are curated), so it is stable within a day and
  // needs no client-side timer. In English, prefer a book whose title is
  // written in Latin letters: the English catalog holds some titles in their
  // original script (a Korean title above a cover that reads "HUMAN ACTS"),
  // which looks like a mistake to someone deciding whether to buy.
  const candidates = featuredBooks.length ? featuredBooks : topRated.slice(0, 5);
  const readable = lang === "en" ? candidates.filter((b) => /[A-Za-z]/.test(b.title || "")) : candidates;
  const pool = readable.length ? readable : candidates;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const pick = pool.length ? pool[dayOfYear % pool.length] : null;

  // Chained fallback rather than trusting `bestseller` alone: that flag is
  // admin-set and unset on every book in the catalog at the time of writing,
  // so querying it alone would leave signed-out visitors an empty section.
  const popularBooks = bestsellers.length ? bestsellers : featuredBooks.length ? featuredBooks : topRated.slice(0, 12);

  // Genres are validated against what the catalog really contains, so none of
  // these tiles can lead to an empty page (see lib/genres.js).
  const genres = resolveGenres(f.categories, { limit: 12 });
  const collections = f.collections.filter((c) => c.count >= 3).slice(0, 8);

  const MORE = [
    { icon: "building", title: _("publishers"), href: withLang("/publications") },
    { icon: "zap", title: _("comics"), href: withLang("/comics") },
    { icon: "users", title: _("navCommunity"), href: withLang("/community") },
    { icon: "trophy", title: _("navBookwormRanking"), href: withLang("/leaderboard") },
  ];

  return (
    <>
      <section className="hero-glow border-b border-[var(--line)]">
        <div className="container-bq grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <p className="eyebrow">Discover · Summarize · Buy</p>
            <h1 className="mt-4 text-[2.5rem] font-bold leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
              {_("heroHeadlinePrefix")} <em className="font-medium italic text-brand-700">{_("heroHeadlineHighlight")}</em>
            </h1>
            <p className="text-muted mt-5 max-w-xl text-lg leading-relaxed">{_("heroSub")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={withLang("/books")} className="btn-primary btn-lg"><Icon name="book" size={19} />{_("browse")}</Link>
              <Link href={withLang("/surprise")} prefetch={false} className="btn-ghost btn-lg"><Icon name="dice" size={19} />{_("navSurpriseMe")}</Link>
            </div>
          </div>
          {pick && (
            <FeaturedPick
              lang={lang}
              book={pick}
              labels={{
                pick: _("todaysPick"), by: _("byWord"), rating: _("ratingLabel"), pages: _("pagesLabel"),
                published: _("publishedLabel"), keyPoints: _("keyFeatures"), summary: _("summary"), getBook: _("getBook"),
              }}
            />
          )}
        </div>
      </section>

      {/* Genre chips straight under the hero: a one-tap way into the catalog. Only genres that really have books. */}
      {genres.length > 0 && (
        <nav aria-label={_("genresAndCategories")} className="container-bq pt-6">
          <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {genres.slice(0, 9).map((g) => (
              <li key={g.category} className="shrink-0">
                <Link href={withLang(`/books?category=${encodeURIComponent(g.category)}`)} prefetch={false} className="pill">{g.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Signed-in only: each renders nothing otherwise. ForYou doubles as the
          "popular right now" shelf for signed-out visitors. */}
      <ContinueReading />
      <ForYou lang={lang} fallbackBooks={popularBooks} />
      <RecentlyViewed />

      {genres.length > 0 && (
        <Section title={_("genresAndCategories")} viewAllLabel={_("viewAll")} href={withLang("/categories")}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {genres.map((g) => (
              <li key={g.category}>
                <Link
                  href={withLang(`/books?category=${encodeURIComponent(g.category)}`)}
                  className="card flex min-h-16 flex-col justify-center px-4 py-3"
                >
                  <span className="font-semibold">{g.label}</span>
                  <span className="text-muted text-sm">{g.count} {_("booksWord")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Self-hides until readers have tagged enough books with a mood. */}
      {moods.length >= 3 && (
        <Section title={_("moodQuestionTitle")} subtitle={_("moodQuestionSub")}>
          <div className="flex flex-wrap gap-2.5">
            {moods.slice(0, 10).map((m) => (
              <Link key={m.name} href={withLang(`/books?mood=${encodeURIComponent(m.name)}`)}
                className="pill !min-h-11 !px-4 !text-sm hover:!bg-brand-600 hover:!text-[var(--on-brand)]">
                {m.name} <span className="ms-1.5 opacity-70">{m.count}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title={_("newReleases")} subtitle={_("newReleasesSub")} viewAllLabel={_("viewAll")} href={withLang("/books?sort=new")}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6 max-sm:[&>*:nth-child(n+5)]:hidden">
          {newReleases.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {authors.length > 0 && (
        <Section title={_("featuredAuthorsTitle")} subtitle={_("featuredAuthorsSub")} viewAllLabel={_("viewAll")} href={withLang("/authors")}>
          <HScrollRow>
            {authors.map((a) => (
              <Link key={a.id} href={withLang(`/authors/${a.slug}`)} prefetch={false} className="group block w-28 text-center sm:w-32">
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt="" width={96} height={96} loading="lazy"
                    className="mx-auto h-24 w-24 rounded-full border border-line object-cover" />
                ) : (
                  <span aria-hidden className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand-50 text-3xl font-bold text-brand-700">
                    {a.name[0]}
                  </span>
                )}
                <span className="mt-2 line-clamp-2 block text-sm font-semibold group-hover:text-brand-700">
                  <TitleTransliterated text={a.name} />
                </span>
                {a.country && <span className="text-muted line-clamp-1 block text-xs">{a.country}</span>}
              </Link>
            ))}
          </HScrollRow>
        </Section>
      )}

      {collections.length > 0 && (
        <Section title={_("featuredCollectionsTitle")} viewAllLabel={_("viewAll")} href={withLang("/collections")}>
          <ul className="flex flex-wrap gap-2.5">
            {collections.map((c) => (
              <li key={c.name}>
                <Link href={withLang(`/collections/${encodeURIComponent(c.name)}`)} className="pill !min-h-11 !px-4 !text-sm">
                  {c.name} <span className="ms-1.5 opacity-70">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={_("moreToExplore")}>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MORE.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="card flex min-h-14 items-center gap-3 px-4 py-3 font-semibold">
                <Icon name={m.icon} size={20} className="shrink-0 text-brand-700" />
                {m.title}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
