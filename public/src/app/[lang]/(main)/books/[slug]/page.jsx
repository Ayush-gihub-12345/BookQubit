import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import ShelfControls from "@/components/ShelfControls";
import HScrollRow from "@/components/HScrollRow";
import Icon from "@/components/Icon";
import ReportIssueButton from "@/components/ReportIssueButton";
import Translated from "@/components/Translated";
import QuotesSection from "@/components/QuotesSection";
import WhereToGet from "@/components/book/WhereToGet";
import MobileBookBar from "@/components/book/MobileBookBar";
import BookActionsProvider from "@/components/book/v3/BookActionsProvider";
import BookHero from "@/components/book/v3/BookHero";
import StickyBookBar from "@/components/book/v3/StickyBookBar";
import ClampText from "@/components/book/v3/ClampText";
import ReviewList from "@/components/book/v3/ReviewList";
import { SectionHead, TakeawayCards, ReadersFelt, EditionsList, RatingCard, ReadersCard, AuthorCard } from "@/components/book/v3/Sections";
import { TrackView } from "@/components/RecentlyViewed";
import {
  getBook, relatedBooks, getBookAlternates, getBookCommunity, getDiscussionsForBook, getAuthorLineProfiles,
  getPublicationByName, listBooks, booksByAuthor,
} from "@/lib/repo";
import SummaryReader from "@/components/player/SummaryReader";
import AddToShelf from "@/components/library/AddToShelf";
import SaveToMindSpace from "@/components/mindspace/SaveToMindSpace";
import { getCf } from "@/lib/cf/env";
import { baselineSummary, resolveSummary } from "@/lib/summary";
import { LANGUAGES } from "@/lib/languages";
import { t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { safeJsonLd } from "@/lib/jsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const book = await getBook(slug, lang);
  if (!book) return { title: "Book Not Found", robots: { index: false } };

  const alternates = await getBookAlternates(book);
  const languages = Object.fromEntries(
    alternates.map((a) => [a.lang, `/${a.lang}/books/${encodeURIComponent(a.slug)}`])
  );

  return {
    title: `${book.title} by ${book.author}`,
    description: book.description?.slice(0, 160),
    alternates: {
      canonical: `/${lang}/books/${encodeURIComponent(book.slug)}`,
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

// A real ISBN-13 only (978/979 prefix). Some catalog rows carry an internal id in this column; showing or emitting that as an
// ISBN would be wrong, so anything that is not a valid-looking ISBN-13 is dropped.
const realIsbn = (v) => {
  const d = String(v || "").replace(/[-\s]/g, "");
  return /^97[89]\d{10}$/.test(d) ? d : null;
};
const languageName = (code) => LANGUAGES.find((l) => l.code === code)?.name || code;

export default async function BookPage({ params }) {
  const { slug, lang } = await params;
  const book = await getBook(slug, lang);
  if (!book) notFound();
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;
  const firstAuthor = (book.author || "").split(",")[0].trim();
  const [related, community, bookDiscussions, publisherProfile, authorLine, moreInCollection, alternates, byAuthor] = await Promise.all([
    relatedBooks(book, lang),
    getBookCommunity(book.slug),
    getDiscussionsForBook(book.slug, 3),
    getPublicationByName(book.publisher, lang),
    // Every co-author resolved individually, so each links to their own profile (indexed lookup, see repo.js).
    getAuthorLineProfiles(book.author, lang),
    // `book.collection` is a flat editorial label, not a numbered series: shown as "more from this collection", never as "Book 2 of 7".
    book.collection ? listBooks(lang, { collection: book.collection, limit: 5 }) : [],
    getBookAlternates(book).catch(() => []),
    firstAuthor ? booksByAuthor(firstAuthor, lang).catch(() => []) : [],
  ]);
  const moreInCollectionFiltered = moreInCollection.filter((b) => b.slug !== book.slug).slice(0, 4);
  const moreByAuthor = byAuthor.filter((b) => b.slug !== book.slug).slice(0, 12);
  const _ = t(lang);

  // 60-second summary. The baseline is built from stored data (no AI), so this can never leave the page without one;
  // KV/D1/AI only improve it. Any failure falls back silently.
  let initialSummary = baselineSummary(book);
  let initialAudioUrl = null;
  try {
    const { env } = await getCf();
    const r = await resolveSummary(env, book, lang, "general");
    initialSummary = r.summary;
    initialAudioUrl = r.audioUrl;
  } catch {
    /* keep the baseline */
  }
  const slugQ = encodeURIComponent(book.slug);
  // Geo-routed, click-logged outbound links (see /api/go).
  const goBuy = `/api/go?slug=${slugQ}&lang=${lang}&kind=buy`;
  const goAudible = `/api/go?slug=${slugQ}&lang=${lang}&kind=audible`;

  const keyIdeas = (initialSummary?.takeaways?.length ? initialSummary.takeaways : book.keyPoints || [])
    .map((x) => (typeof x === "string" ? x : x?.text || x?.title || ""))
    .filter(Boolean);
  const summaryWords = String(initialSummary?.script || "").split(/\s+/).filter(Boolean).length;
  const summaryMinutes = summaryWords ? Math.max(1, Math.round(summaryWords / 170)) : null;

  const isbn = realIsbn(book.isbn);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: book.author ? { "@type": "Person", name: book.author } : undefined,
    publisher: book.publisher ? { "@type": "Organization", name: book.publisher } : undefined,
    isbn: isbn || undefined,
    numberOfPages: book.page_count || undefined,
    bookFormat: book.format || undefined,
    image: book.cover_url || undefined,
    description: book.description?.slice(0, 300),
    // Only our own readers' ratings can back a ratingCount (Open Library's average has no count we store).
    aggregateRating: community.rating_count > 0
      ? { "@type": "AggregateRating", ratingValue: community.avg_rating, bestRating: "5", ratingCount: community.rating_count }
      : undefined,
    inLanguage: book.language || undefined,
  };
  const baseUrl = SITE_URL;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Books", item: `${baseUrl}/books` },
      ...(book.category ? [{ "@type": "ListItem", position: 2, name: book.category, item: `${baseUrl}/books?category=${encodeURIComponent(book.category)}` }] : []),
      { "@type": "ListItem", position: book.category ? 3 : 2, name: book.title, item: `${baseUrl}/books/${encodeURIComponent(book.slug)}` },
    ],
  };

  const readingMinutes = book.page_count ? Math.max(5, Math.round(book.page_count * 1.2)) : null;
  const readingTime = readingMinutes
    ? readingMinutes >= 60
      ? `${Math.floor(readingMinutes / 60)} ${_("hourAbbrev")} ${readingMinutes % 60 ? `${readingMinutes % 60} ${_("minuteAbbrev")}` : ""}`.trim()
      : `${readingMinutes} ${_("minuteAbbrev")}`
    : null;
  const difficulty = book.page_count
    ? book.page_count < 180 ? _("easyRead") : book.page_count < 400 ? _("moderateRead") : _("deepRead")
    : null;

  const meta = [
    [_("metaPublisher"), book.publisher],
    [_("metaPublished"), book.published],
    [_("metaLanguage"), book.language],
    [_("metaPages"), book.page_count],
    [_("metaReadingTime"), readingTime && `~${readingTime}`],
    [_("metaDifficulty"), difficulty],
    [_("metaFormat"), book.format],
    [_("metaISBN"), isbn],
    [_("metaCountry"), book.country],
    [_("metaGenres"), book.genres?.length > 0 && book.genres.join(", ")],
  ].filter(([, v]) => v);

  // ----- hero props -----
  const reviewCount = community.reviews.length;
  const communityRated = community.rating_count > 0;
  const rating = communityRated
    ? { value: community.avg_rating, label: `${community.rating_count} ${community.rating_count === 1 ? "rating" : "ratings"}${reviewCount ? ` · ${reviewCount} ${reviewCount === 1 ? _("reviewWord") : _("reviewsWord")}` : ""}` }
    : book.rating ? { value: book.rating, label: "Average rating" } : {};
  const authors = (authorLine.length ? authorLine : [{ name: book.author, profile: null }])
    .filter((a) => a.name)
    .map((a) => ({ name: a.name, href: withLang(a.profile ? `/authors/${a.profile.slug}` : `/books?q=${encodeURIComponent(a.name)}`) }));
  const facts = [
    { icon: "bookOpen", label: "Pages", value: book.page_count ? String(book.page_count) : null },
    { icon: "clock", label: "Read in", value: readingTime },
    { icon: "gauge", label: "Difficulty", value: difficulty },
    { icon: "zap", label: "Pace", value: community.pace[0]?.name },
    { icon: "calendar", label: "Published", value: book.published ? String(book.published) : null },
    { icon: "headphones", label: "Summary", value: summaryMinutes ? `${summaryMinutes} min` : null },
  ];
  const moodChips = [
    ...(book.category ? [{ name: book.category, href: withLang(`/books?category=${encodeURIComponent(book.category)}`) }] : []),
    ...community.moods.slice(0, 3).map((m) => ({ name: m.name, href: withLang(`/books?mood=${encodeURIComponent(m.name)}`) })),
  ];
  const crumbs = [
    { label: _("homeWord"), href: withLang("/") },
    { label: _("books"), href: withLang("/books") },
    ...(book.category ? [{ label: book.category, href: withLang(`/books?category=${encodeURIComponent(book.category)}`) }] : []),
    { label: book.title },
  ];
  const heroBook = {
    slug: book.slug, lang, title: book.title, author: book.author, cover_url: book.cover_url, rating: book.rating,
    buyUrl: goBuy, pages: book.page_count, publisherName: book.publisher || null,
    publisherHref: publisherProfile ? withLang(`/publications/${publisherProfile.slug}`) : null,
  };

  const editions = [...new Map(alternates.map((e) => [e.lang, e])).values()];
  const moods = community.moods;
  const hasReaders = moods.length > 0 || community.pace.length > 0;
  const sections = [
    ["overview", "Overview"], ["summary", "Summary"],
    ...(hasReaders ? [["readers", "Readers"]] : []),
    ["reviews", "Reviews"], ["quotes", "Quotes"],
    ...(related.length || moreByAuthor.length ? [["similar", "Similar"]] : []),
    ["details", "Details"],
  ];
  const reasonFor = (b) => (b.author && b.author === book.author ? "Same author" : b.category && b.category === book.category ? `More ${b.category}` : undefined);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <TrackView book={{ slug: book.slug, title: book.title, author: book.author, cover_url: book.cover_url }} />

      <BookActionsProvider book={heroBook}>
        <article>
          <StickyBookBar book={heroBook} rating={rating.value} sections={sections} buyHref={goBuy} />
          <BookHero
            book={heroBook} crumbs={crumbs} authors={authors} rating={rating} reading={Number(community.reading) || 0}
            facts={facts} moods={moodChips} summaryMinutes={summaryMinutes} editions={editions.length}
          />

          <div className="container-bq grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 lg:py-10">
            <div className="min-w-0 space-y-12 lg:space-y-16">
              {/* ---- About ---- */}
              <section id="overview" aria-labelledby="overview-h" className="scroll-mt-36">
                <SectionHead id="overview">About the book</SectionHead>
                {book.description && (
                  <ClampText long={book.description.length > 520}>
                    <Translated as="p" className="whitespace-pre-line text-[17px] leading-[1.75]" text={book.description} />
                  </ClampText>
                )}
                {(book.category || book.subjects?.length > 0) && (
                  <div className="mt-6 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-qubit-500,#6C83D9)_30%,var(--line))] bg-[color-mix(in_srgb,var(--color-qubit-500,#6C83D9)_7%,var(--surface))] p-5">
                    <b className="flex items-center gap-2 text-[var(--color-qubit-500,#6C83D9)]"><Icon name="sparkles" size={18} />{_("whosItFor")}</b>
                    <p className="mt-2 text-[15px] leading-relaxed">
                      {_("whosItForBody", {
                        category: book.category ? book.category.toLowerCase() : _("thisGenre"),
                        subjects: book.subjects?.length > 0 ? book.subjects.slice(0, 2).join(" & ") : _("thisGenre"),
                        time: readingTime || "",
                        level: difficulty ? difficulty.toLowerCase() : "",
                      })}
                    </p>
                  </div>
                )}
                {(book.genres?.length > 0 || book.tags.length > 0) && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {book.genres.map((g) => <Link key={`g-${g}`} href={withLang(`/books?category=${encodeURIComponent(g)}`)} prefetch={false} className="pill !h-8 !text-[13px]">{g}</Link>)}
                    {book.tags.map((tg) => <Link key={`t-${tg}`} href={withLang(`/books?tag=${encodeURIComponent(tg)}`)} prefetch={false} className="pill !h-8 !text-[13px]">#{tg}</Link>)}
                  </div>
                )}
              </section>

              {/* ---- Summary: listen or read, then the key ideas as cards ---- */}
              <section id="summary" aria-labelledby="summary-h" className="scroll-mt-36">
                <SectionHead id="summary" eyebrow={summaryMinutes ? `${summaryMinutes}-minute summary` : "Summary"}>Key ideas, fast</SectionHead>
                <SummaryReader
                  book={{ slug: book.slug, lang, title: book.title, author: book.author, cover_url: book.cover_url }}
                  initial={initialSummary}
                  initialAudioUrl={initialAudioUrl}
                  fullText={book.summary}
                />
                {keyIdeas.length > 0 && (
                  <div id="takeaways" className="mt-8 scroll-mt-36">
                    <h3 className="mb-3 flex items-center gap-2 font-bold"><Icon name="lightbulb" size={18} />{keyIdeas.length} key {keyIdeas.length === 1 ? "idea" : "ideas"}</h3>
                    <TakeawayCards ideas={keyIdeas} />
                  </div>
                )}
                {book.summary && (
                  <details className="card mt-6 p-5 hover:!translate-y-0">
                    <summary className="cursor-pointer font-semibold">{_("summary")}: read the full text</summary>
                    <Translated as="p" className="mt-3 max-w-[70ch] whitespace-pre-line leading-relaxed" text={book.summary} />
                  </details>
                )}
                <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--muted)]"><Icon name="info" size={13} />Summaries help you decide and remember. They don&apos;t replace the book.</p>
              </section>

              <ReadersFelt moods={moods} pace={community.pace} />

              {/* ---- Reviews ---- */}
              <section id="reviews" aria-labelledby="reviews-h" className="scroll-mt-36">
                <SectionHead id="reviews" eyebrow={reviewCount ? `${reviewCount} ${reviewCount === 1 ? _("reviewWord") : _("reviewsWord")}` : undefined}>{_("readerReviews")}</SectionHead>
                <div id="write-review" className="scroll-mt-24"><ShelfControls slug={book.slug} /></div>
                <ReviewList reviews={community.reviews} />
              </section>

              {/* ---- Quotes ---- */}
              <section id="quotes" aria-label="Quotes" className="scroll-mt-36"><QuotesSection bookSlug={book.slug} /></section>

              <EditionsList editions={editions} lang={lang} languageName={languageName} />

              {/* ---- Similar ---- */}
              {(related.length > 0 || moreByAuthor.length > 0 || moreInCollectionFiltered.length > 0) && (
                <div id="similar" className="scroll-mt-36 space-y-10">
                  {related.length > 0 && (
                    <section aria-labelledby="similar-h">
                      <SectionHead id="similar" eyebrow="Matched on genre and author">Readers also loved</SectionHead>
                      <HScrollRow>
                        {related.map((b) => <div key={b.id} className="w-[142px] shrink-0 sm:w-[158px]"><BookCard book={b} hrefBase={withLang("/books")} note={reasonFor(b)} /></div>)}
                      </HScrollRow>
                    </section>
                  )}
                  {moreByAuthor.length > 0 && (
                    <section aria-label={`More by ${firstAuthor}`}>
                      <SectionHead>More by {firstAuthor}</SectionHead>
                      <HScrollRow>
                        {moreByAuthor.map((b) => <div key={b.id} className="w-[142px] shrink-0 sm:w-[158px]"><BookCard book={b} hrefBase={withLang("/books")} /></div>)}
                      </HScrollRow>
                    </section>
                  )}
                  {moreInCollectionFiltered.length > 0 && (
                    <section aria-label={_("moreFromCollection", { collection: book.collection })}>
                      <SectionHead>{_("moreFromCollection", { collection: book.collection })}</SectionHead>
                      <HScrollRow>
                        {moreInCollectionFiltered.map((b) => <div key={b.id} className="w-[142px] shrink-0 sm:w-[158px]"><BookCard book={b} hrefBase={withLang("/books")} /></div>)}
                      </HScrollRow>
                    </section>
                  )}
                </div>
              )}

              {/* ---- Details ---- */}
              <section id="details" aria-labelledby="details-h" className="scroll-mt-36">
                <SectionHead id="details">{_("details")}</SectionHead>
                {meta.length > 0 && (
                  <dl className="card grid divide-y divide-[var(--line)] overflow-hidden hover:!translate-y-0 sm:grid-cols-2 sm:divide-y-0">
                    {meta.map(([k, v], i) => (
                      <div key={k} className={`grid grid-cols-[130px_minmax(0,1fr)] gap-3 border-[var(--line)] px-5 py-3 text-sm ${i % 2 === 0 ? "sm:border-e" : ""} sm:[&:nth-child(n+3)]:border-t`}>
                        <dt className="text-[var(--muted)]">{k}</dt>
                        <dd className="font-medium">
                          {k === _("metaPublisher") && publisherProfile ? <Link href={withLang(`/publications/${publisherProfile.slug}`)} prefetch={false} className="text-brand-700 hover:underline">{v}</Link> : v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-4"><p className="text-muted mb-2 text-xs font-semibold">{_("bookInformation")}</p><ReportIssueButton bookSlug={book.slug} /></div>
              </section>
            </div>

            {/* ---- Sidebar (sticky on desktop) ---- */}
            <aside className="space-y-5 lg:sticky lg:top-[8.5rem] lg:self-start">
              <WhereToGet book={book} goBuy={goBuy} goAudible={goAudible} />
              <RatingCard avg={community.avg_rating} count={community.rating_count} distribution={community.distribution} />
              <ReadersCard reading={Number(community.reading) || 0} finished={Number(community.read) || 0} want={Number(community.want) || 0} />
              <AuthorCard profile={authorLine[0]?.profile} name={firstAuthor} lang={lang} moreHref={withLang(`/books?author=${encodeURIComponent(firstAuthor)}`)} />
              <section className="card p-5 hover:!translate-y-0" aria-label={_("readWithOthers")}>
                <p className="mb-2 text-sm font-bold">{_("readWithOthers")}</p>
                {bookDiscussions.map((d) => (
                  <Link key={d.id} href={withLang(`/community?open=${d.id}`)} prefetch={false} className="text-muted flex items-center gap-2 py-1 text-sm hover:text-brand-700">
                    <Icon name="users" size={13} className="shrink-0" /><span className="truncate">{d.title}</span><span className="shrink-0 text-xs opacity-70">· {d.members}</span>
                  </Link>
                ))}
                <Link href={withLang(`/community?book=${encodeURIComponent(book.slug)}&title=${encodeURIComponent(book.title)}`)} prefetch={false} className="text-muted flex items-center gap-2 py-1 text-sm hover:text-brand-700">
                  <Icon name="feather" size={14} /> {_("startDiscussion")}
                </Link>
                {related.length > 0 && <a href="#similar" className="text-muted flex items-center gap-2 py-1 text-sm hover:text-brand-700"><Icon name="layers" size={14} /> {_("browseSimilarBooks")}</a>}
              </section>
              <div className="text-muted flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-sm">
                <AddToShelf slug={book.slug} />
                <SaveToMindSpace node={{ kind: "book", bookSlug: book.slug, title: book.title }} />
              </div>
            </aside>
          </div>
        </article>
        <MobileBookBar book={heroBook} buyHref={goBuy} />
      </BookActionsProvider>
    </>
  );
}
