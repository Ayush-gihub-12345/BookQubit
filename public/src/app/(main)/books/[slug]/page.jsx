import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Rating from "@/components/Rating";
import Section from "@/components/Section";
import ShelfControls from "@/components/ShelfControls";
import ReviewCard from "@/components/ReviewCard";
import HScrollRow from "@/components/HScrollRow";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";
import ReportIssueButton from "@/components/ReportIssueButton";
import QuickActions from "@/components/QuickActions";
import Translated from "@/components/Translated";
import TitleTransliterated from "@/components/TitleTransliterated";
import QuotesSection from "@/components/QuotesSection";
import { TrackView } from "@/components/RecentlyViewed";
import { getBook, relatedBooks, getBookAlternates, getBookCommunity, getDiscussionsForBook, getAuthorLineProfiles, getPublicationByName, listBooks } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

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
  const [related, community, bookDiscussions, publisherProfile, authorLine, moreInCollection] = await Promise.all([
    relatedBooks(book, lang),
    getBookCommunity(book.slug),
    getDiscussionsForBook(book.slug, 3),
    getPublicationByName(book.publisher, lang),
    // Every co-author resolved individually — `book.author` is a ", "-joined
    // list, so linking it as one string sent "Ken Follett, John Lee" to a
    // single profile and left the second author unlinked entirely. This
    // replaces the old single getAuthorByName() lookup, which only ever
    // resolved the first name in the list.
    getAuthorLineProfiles(book.author, lang),
    // `book.collection` is a flat editorial label (e.g. "Harari Collection"),
    // not a true series with an order/sequence — there's no such column
    // anywhere in the schema. This is an honestly-labeled "more from this
    // collection" strip, not a fake "Book 2 of 7" series feature.
    book.collection ? listBooks(lang, { collection: book.collection, limit: 5 }) : [],
  ]);
  const moreInCollectionFiltered = moreInCollection.filter((b) => b.slug !== book.slug).slice(0, 4);
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
    // Google requires ratingCount/reviewCount to reflect a real number of
    // reviews — book.rating is Open Library's imported average, which has
    // no review count we actually store, so it can't honestly back a
    // ratingCount. Only our own community reviews have a real count behind
    // them, so aggregateRating uses those, and is omitted entirely (not
    // faked with a placeholder like ratingCount: 1) when there are none yet.
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
      ...(book.category
        ? [{ "@type": "ListItem", position: 2, name: book.category, item: `${baseUrl}/books?category=${encodeURIComponent(book.category)}` }]
        : []),
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
    [_("metaISBN"), book.isbn],
    [_("metaCountry"), book.country],
    [_("metaGenres"), book.genres?.length > 0 && book.genres.join(", ")],
  ].filter(([, v]) => v);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <TrackView book={{ slug: book.slug, title: book.title, author: book.author, cover_url: book.cover_url }} />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav className="text-muted mb-6 text-sm">
          <Link href="/books" className="hover:text-brand-600">{_("books")}</Link>
          {book.category && (
            <>
              {" / "}
              <Link href={`/books?category=${encodeURIComponent(book.category)}`} className="hover:text-brand-600">
                {book.category}
              </Link>
            </>
          )}
          {" / "}<span className="text-[var(--fg)]"><TitleTransliterated text={book.title} /></span>
        </nav>

        {/* min-w-0 on both grid children: without it, a grid item's implicit
            min-width is "auto", which factors in a replaced element's (img)
            intrinsic size — so a cover whose real dimensions are unusually
            large/wide can force this column, and the whole grid, wider than
            the viewport, squeezing the rest of the page into a narrow strip
            beside empty space. w-full/object-cover on the <img> itself don't
            prevent this; the fix has to be on the grid item. */}
        <div className="grid min-w-0 gap-10 lg:grid-cols-[300px_1fr]">
          <div className="min-w-0">
            <div className="card aspect-[2/3] overflow-hidden !shadow-xl hover:!translate-y-0">
              <BookCover title={book.title} author={book.author} cover_url={book.cover_url} />
            </div>

            <QuickActions book={book} />

            {related.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <a href="#related" className="text-muted flex items-center gap-2 py-1 text-sm hover:text-brand-600">
                  <Icon name="layers" size={14} /> {_("browseSimilarBooks")}
                </a>
              </div>
            )}

            <div className="mt-2 border-t border-line pt-4">
              <p className="text-muted mb-2 text-[11px] font-bold uppercase tracking-wider">{_("readWithOthers")}</p>
              {bookDiscussions.map((d) => (
                <Link key={d.id} href={`/community?open=${d.id}`}
                  className="text-muted flex items-center gap-2 py-1 text-sm hover:text-brand-600">
                  <Icon name="users" size={13} className="shrink-0" />
                  <span className="truncate">{d.title}</span>
                  <span className="shrink-0 text-xs opacity-70">· {d.members}</span>
                </Link>
              ))}
              <Link
                href={`/community?book=${encodeURIComponent(book.slug)}&title=${encodeURIComponent(book.title)}`}
                className="text-muted flex items-center gap-2 py-1 text-sm hover:text-brand-600"
              >
                <Icon name="feather" size={14} /> {_("startDiscussion")}
              </Link>
            </div>

            <div className="mt-2 border-t border-line pt-4">
              <p className="text-muted mb-2 text-[11px] font-bold uppercase tracking-wider">{_("bookInformation")}</p>
              <ReportIssueButton bookSlug={book.slug} />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl"><TitleTransliterated text={book.title} /></h1>
            <p className="text-muted mt-2 text-lg">
              {_("byWord")}{" "}
              {/* One link per co-author. Anyone with a real profile goes to
                  their author page; anyone without one falls back to a search
                  so the name is still clickable rather than dead text. */}
              {(authorLine.length ? authorLine : [{ name: book.author, profile: null }])
                .filter((a) => a.name)
                .map((a, i) => (
                  <span key={a.name}>
                    {i > 0 && <span className="opacity-60">, </span>}
                    <Link
                      href={a.profile ? `/authors/${a.profile.slug}` : `/books?q=${encodeURIComponent(a.name)}`}
                      prefetch={false}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      <TitleTransliterated text={a.name} />
                    </Link>
                  </span>
                ))}
            </p>
            {/* Compact meta line — StoryGraph-style at-a-glance facts */}
            <p className="text-muted mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {[book.page_count && _("pagesSuffix", { count: book.page_count }), book.format, book.published && _("firstPub", { year: book.published })]
                .filter(Boolean)
                .map((part, i) => <span key={i}>{i > 0 && <span className="mx-1 opacity-50">·</span>}{part}</span>)}
            </p>

            {/* Top facet pills — category + top moods/pace at a glance */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {book.category && <Link href={`/books?category=${encodeURIComponent(book.category)}`} className="pill !text-[11px]">{book.category}</Link>}
              {book.tags.slice(0, 4).map((tg) => (
                <Link key={tg} href={`/books?tag=${encodeURIComponent(tg)}`} className="pill !text-[11px]">{tg}</Link>
              ))}
              {community.pace[0] && <span className="pill !bg-emerald-500/15 !text-[11px] !text-emerald-600">{community.pace[0].name}</span>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Rating value={book.rating} />
              {community.reviews.length > 0 && (
                <a href="#reviews" className="text-muted hover:text-brand-600">
                  {community.reviews.length} {community.reviews.length === 1 ? _("reviewWord") : _("reviewsWord")}
                </a>
              )}
              {readingTime && <span className="text-muted">~{readingTime} {_("readWord")}</span>}
              {book.collection && (
                <Link href={`/collections/${encodeURIComponent(book.collection)}`} className="pill">
                  {book.collection}
                </Link>
              )}
            </div>

            {moreInCollectionFiltered.length > 0 && (
              <div className="mt-5">
                <p className="text-muted mb-2 text-[11px] font-bold uppercase tracking-wider">
                  {_("moreFromCollection", { collection: book.collection })}
                </p>
                <HScrollRow>
                  {moreInCollectionFiltered.map((b) => (
                    <Link key={b.id} href={`/books/${encodeURIComponent(b.slug)}`} className="card group w-28 shrink-0 overflow-hidden">
                      <div className="aspect-[2/3] overflow-hidden bg-black/5">
                        <BookCover title={b.title} author={b.author} cover_url={b.cover_url}
                          imgClassName="transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-2">
                        <p className="line-clamp-2 text-xs font-semibold group-hover:text-brand-600"><TitleTransliterated text={b.title} /></p>
                      </div>
                    </Link>
                  ))}
                </HScrollRow>
              </div>
            )}

            {book.description && <Translated as="p" className="mt-6 text-lg leading-relaxed" text={book.description} />}

            {(book.category || book.subjects?.length > 0) && (
              <div className="tint-brand mt-6 rounded-xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{_("whosItFor")}</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {_("whosItForBody", {
                    category: book.category ? book.category.toLowerCase() : _("thisGenre"),
                    subjects: book.subjects?.length > 0 ? book.subjects.slice(0, 2).join(" & ") : _("thisGenre"),
                    time: readingTime || "",
                    level: difficulty ? difficulty.toLowerCase() : "",
                  })}
                </p>
              </div>
            )}

            {book.keyPoints.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("keyTakeaways")}</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {book.keyPoints.map((k) => (
                    <li key={k} className="tint-brand flex items-start gap-2 rounded-xl px-4 py-3 text-sm">
                      <span className="text-brand-600">✓</span> <Translated text={k} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {book.summary && (
              <div id="summary" className="mt-8 scroll-mt-24">
                <h2 className="text-xl font-bold">{_("summary")}</h2>
                <Translated as="p" className="mt-3 whitespace-pre-line leading-relaxed opacity-90" text={book.summary} />
              </div>
            )}

            {meta.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("details")}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {meta.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted text-xs uppercase tracking-wide">{k}</dt>
                      <dd className="text-sm font-medium">
                        {k === "Publisher" && publisherProfile ? (
                          <Link href={`/publications/${publisherProfile.slug}`} className="text-brand-600 hover:underline">{v}</Link>
                        ) : v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Reader quotes */}
            <div className="mt-8">
              <QuotesSection bookSlug={book.slug} />
            </div>

            <div className="mt-10 scroll-mt-24" id="write-review">
              <ShelfControls slug={book.slug} />
            </div>

            {book.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {book.tags.map((t) => (
                  <Link key={t} href={`/books?tag=${encodeURIComponent(t)}`} className="pill">#{t}</Link>
                ))}
              </div>
            )}

            {/* Community section */}
            <div id="reviews" className="mt-10 scroll-mt-24">
              <h2 className="text-xl font-bold">{_("communityTitle")}</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-[220px_1fr]">
                <div className="card p-5 text-center hover:!translate-y-0">
                  <p className="text-4xl font-extrabold">{community.avg_rating ?? "—"}</p>
                  <p className="text-amber-400">{"★".repeat(Math.round(community.avg_rating || 0)) || "☆☆☆☆☆"}</p>
                  <p className="text-muted mt-1 text-xs">{community.rating_count} {_("ratingsFromReaders")}</p>
                </div>
                <div>
                  {community.moods.length > 0 && (
                    <div className="mb-5">
                      <p className="text-muted mb-2 text-[11px] font-bold uppercase tracking-wider">{_("moodsLabel")}</p>
                      <div className="space-y-1">
                        {community.moods.slice(0, 5).map((m) => {
                          const moodTotal = community.moods.reduce((n, x) => n + x.n, 0);
                          const pct = moodTotal ? Math.round((m.n / moodTotal) * 100) : 0;
                          return (
                            <div key={m.name} className="flex items-center gap-2 text-xs">
                              <span className="w-24 shrink-0 truncate">{m.name}</span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-muted w-9 text-right">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {community.pace.length > 0 && (
                    <div className="mb-5 flex items-center gap-2 text-xs">
                      <span className="text-muted w-24 shrink-0">{_("paceLabel")}</span>
                      <span className="pill !bg-emerald-500/15 !text-emerald-600">{community.pace[0].name}</span>
                    </div>
                  )}
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
              </div>

              {community.reviews.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-bold">{_("readerReviews")} ({community.reviews.length})</h3>
                  {community.reviews.map((r) => (
                    <ReviewCard
                      key={`${r.user_id}-${r.updated_at}`}
                      rating={r.rating}
                      review={r.review}
                      spoiler={r.spoiler}
                      updatedAt={r.updated_at}
                      spoilerLabel={_("spoilerClickToReveal")}
                      reviewer={{ name: r.name, photo_url: r.photo_url, slug: r.slug, user_id: r.user_id }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section id="related" title={_("related")}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </Section>
      )}
    </>
  );
}
