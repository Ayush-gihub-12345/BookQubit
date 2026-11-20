import Link from "next/link";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import FeaturedPick from "@/components/FeaturedPick";
import ContinueReading from "@/components/ContinueReading";
import Icon from "@/components/Icon";
import { SurpriseLink } from "@/components/surprise/SurpriseMe";
import PickCarousel from "@/components/home/PickCarousel";
import ListenShelf from "@/components/listen/ListenShelf";
import { FactsStrip, HowItWorks } from "@/components/home/HomeExtras";
import { StartShelves, HomeFaq } from "@/components/home/HomeMore";
import { LANGUAGES } from "@/lib/languages";
import { QuickHub, DiscoverStrip, QuoteOfTheDay, CollectionCard, PublisherCard, TagCloud, NewsletterBanner } from "@/components/home/HomeSections";
import { getFeaturedPublishers, getCollectionCovers } from "@/lib/home-data";
import { cached } from "@/lib/db";
import { TTL } from "@/lib/cache-policy";
import { getCf } from "@/lib/cf/env";
import { feedLoaders } from "@/lib/feed-server";
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
// One reader-saved quote per day, stable until midnight and cached with the feed group.
async function quoteOfTheDay() {
  try {
    const day = Math.floor(Date.now() / 86400000);
    return await cached(`feed:quote-of-day:${day}`, async () => {
      const { env } = await getCf();
      const loaders = feedLoaders(env, "en");
      let rows = await loaders.quotes(1, day % 20);
      if (!rows.length) rows = await loaders.quotes(1, 0);
      const q = rows[0];
      return q ? { text: q.text, bookSlug: q.book.slug, bookTitle: q.book.title, author: q.book.author || "" } : null;
    }, TTL.lists);
  } catch {
    return null;
  }
}

export default async function Home() {
  const lang = await getLang();
  const _ = t(lang);
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;

  const [featuredBooks, bestsellers, topRated, newReleases, f, authors, moods, quote, publishers] = await Promise.all([
    getFeaturedBooks(lang, 5),
    getBestsellerBooks(lang, 12),
    listBooks(lang, { sort: "rating", limit: 12 }),
    listBooks(lang, { sort: "new", limit: 6 }),
    facets(lang),
    getFeaturedAuthors(lang, 10),
    getMoodCounts(),
    quoteOfTheDay(),
    getFeaturedPublishers(lang, 8).catch(() => []),
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

  // The hero rotates through up to five picks, starting with today's.
  const pickLabels = {
    pick: _("todaysPick"), by: _("byWord"), rating: _("ratingLabel"), pages: _("pagesLabel"),
    published: _("publishedLabel"), keyPoints: _("keyFeatures"), summary: _("summary"), getBook: _("getBook"),
  };
  const picks = pool.length ? pool.map((_, i) => pool[(dayOfYear + i) % pool.length]).slice(0, 5) : [];

  // Chained fallback rather than trusting `bestseller` alone: that flag is
  // admin-set and unset on every book in the catalog at the time of writing,
  // so querying it alone would leave signed-out visitors an empty section.
  const popularBooks = bestsellers.length ? bestsellers : featuredBooks.length ? featuredBooks : topRated.slice(0, 12);

  // Genres are validated against what the catalog really contains, so none of
  // these tiles can lead to an empty page (see lib/genres.js).
  const genres = resolveGenres(f.categories, { limit: 12 });
  const collections = f.collections.filter((c) => c.count >= 3).slice(0, 8);
  const covers = await getCollectionCovers(lang, collections.map((c) => c.name)).catch(() => ({}));

  return (
    <>
      <section className="hero-glow border-b border-[var(--line)]">
        <div className="container-bq grid items-center gap-6 py-6 sm:gap-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <p className="eyebrow max-sm:!text-[10px]">Discover · Summarize · Buy</p>
            <h1 className="mt-2 text-[1.75rem] font-bold leading-[1.1] sm:mt-4 sm:text-5xl lg:text-[3.6rem]">
              {_("heroHeadlinePrefix")} <em className="font-medium italic text-brand-700">{_("heroHeadlineHighlight")}</em>
            </h1>
            <p className="text-muted mt-2 line-clamp-2 max-w-xl text-[13px] leading-snug sm:mt-5 sm:line-clamp-none sm:text-lg sm:leading-relaxed">{_("heroSub")}</p>
            <div className="mt-4 flex gap-2 sm:mt-7 sm:flex-wrap sm:gap-3">
              <Link href={withLang("/books")} className="btn-primary btn-lg max-sm:!min-h-10 max-sm:!px-4 max-sm:!text-sm"><Icon name="book" size={17} />{_("browse")}</Link>
              <SurpriseLink locale={lang} className="btn-ghost btn-lg max-sm:!min-h-10 max-sm:!px-4 max-sm:!text-sm"><Icon name="dice" size={17} />{_("navSurpriseMe")}</SurpriseLink>
            </div>
          </div>
          {picks.length > 0 && (
            <PickCarousel label={_("todaysPick")}>
              {picks.map((b, i) => (
                <FeaturedPick key={b.slug} lang={lang} book={b} priority={i === 0} labels={pickLabels} />
              ))}
            </PickCarousel>
          )}
        </div>
      </section>

      {/* Genre chips straight under the hero: a one-tap way into the catalog. Only genres that really have books. */}
      {genres.length > 0 && (
        <nav aria-label={_("genresAndCategories")} className="container-bq pt-6">
          <ul className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {genres.slice(0, 9).map((g) => (
              <li key={g.category} className="shrink-0">
                <Link href={withLang(`/books?category=${encodeURIComponent(g.category)}`)} prefetch={false} className="pill">{g.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <FactsStrip items={[
        { icon: "layers", value: genres.length ? String(f.categories.length) : "", label: "Genres to explore" },
        { icon: "globe", value: f.countries?.length ? String(f.countries.length) : "", label: "Countries represented" },
        { icon: "headphones", value: "Audio + text", label: "Every summary" },
        { icon: "users", value: String(LANGUAGES.length), label: "Languages" },
      ]} />

      <section className="container-bq py-5 sm:py-6" aria-label="Quick links">
        <QuickHub lang={lang} labels={{
          library: _("browse"), books: _("booksWord"), libraryHint: "Every book we have",
          shelf: _("navLibrary"), shelfHint: "Shelves, stats and goals",
          comics: _("comics"), comicsHint: "Marvel, DC, manga",
          community: _("navCommunity"), communityHint: "Discuss and connect",
        }} />
      </section>

      {/* Signed-in only: each renders nothing otherwise. ForYou doubles as the
          "popular right now" shelf for signed-out visitors. */}
      <ContinueReading />
      <ForYou lang={lang} fallbackBooks={popularBooks} />
      <RecentlyViewed />

      {popularBooks.length >= 4 && (
        <Section title="Trending now" subtitle="The books readers are picking up most" viewAllLabel={_("viewAll")} href={withLang("/books?sort=rating")}>
          <HScrollRow>
            {popularBooks.slice(0, 10).map((b, i) => <div key={b.id} className="w-[148px] shrink-0 pt-3 sm:w-[168px]"><BookCard book={b} rank={i + 1} /></div>)}
          </HScrollRow>
        </Section>
      )}

      <HowItWorks lang={lang} />

      <StartShelves lang={lang} />

      {quote && (
        <section className="container-bq py-8"><QuoteOfTheDay lang={lang} quote={quote} label="Quote of the day" /></section>
      )}

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

      {topRated.length >= 4 && (
        <Section title={_("topRated")} subtitle="Highest rated by readers" viewAllLabel={_("viewAll")} href={withLang("/books?sort=rating")}>
          <HScrollRow>
            {topRated.slice(0, 12).map((b) => <div key={b.id} className="w-[148px] shrink-0 sm:w-[168px]"><BookCard book={b} /></div>)}
          </HScrollRow>
        </Section>
      )}

      {/* Audio summaries: press play on a cover, or queue the whole row. Reuses the global player. */}
      <ListenShelf
        title="Listen now" subtitle="Short audio summaries you can start with one tap"
        books={topRated.slice(0, 10).map((b) => ({ slug: b.slug, title: b.title, author: b.author, cover_url: b.cover_url, lang: b.lang, rating: b.rating }))}
        lang={lang} href={withLang("/listen")} viewAll={_("viewAll")}
      />

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
          <HScrollRow>
            {collections.map((c) => <CollectionCard key={c.name} lang={lang} c={c} covers={covers[c.name]} booksLabel={_("booksWord")} />)}
          </HScrollRow>
        </Section>
      )}

      {publishers.length > 0 && (
        <Section title={_("publishers")} viewAllLabel={_("viewAll")} href={withLang("/publications")}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {publishers.map((p) => <li key={p.slug}><PublisherCard lang={lang} p={p} /></li>)}
          </ul>
        </Section>
      )}

      {f.tags?.length >= 6 && (
        <Section title="Popular tags" subtitle="Jump straight to a topic">
          <TagCloud lang={lang} tags={f.tags.slice(0, 16)} />
        </Section>
      )}

      <section className="container-bq py-8">
        <DiscoverStrip lang={lang} labels={{
          title: _("heroHeadlinePrefix") + " " + _("heroHeadlineHighlight"), sub: "Browse the shelves, let us pick for you, or see what top readers are into.",
          browse: _("browse"), surprise: _("navSurpriseMe"), ranking: _("navBookwormRanking"),
        }} />
      </section>

      <HomeFaq />

      <section className="container-bq pb-10 pt-4">
        <NewsletterBanner lang={lang} labels={{
          kicker: "Free · Weekly", title: _("newsletterTitle"), sub: _("newsletterSub"),
          placeholder: _("newsletterPlaceholder"), button: _("newsletterButton"), success: _("newsletterSuccess"),
        }} />
      </section>
    </>
  );
}
