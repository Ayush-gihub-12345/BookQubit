import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Rating from "@/components/Rating";
import Section from "@/components/Section";
import ShelfControls from "@/components/ShelfControls";
import ReviewCard from "@/components/ReviewCard";
import BookCover from "@/components/BookCover";
import QuickActions from "@/components/QuickActions";
import TitleTransliterated from "@/components/TitleTransliterated";
import Translated from "@/components/Translated";
import { getComic, relatedComics, getBookCommunity } from "@/lib/repo";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const comic = await getComic(slug, lang);
  return comic
    ? { title: comic.title, description: comic.description?.slice(0, 160), alternates: { canonical: `/${lang}/comics/${comic.slug}` } }
    : { title: t(lang)("comicNotFound"), robots: { index: false } };
}

export default async function ComicPage({ params }) {
  const { slug, lang } = await params;
  const _ = t(lang);
  const comic = await getComic(slug, lang);
  if (!comic) notFound();

  // getBookCommunity() keys purely off `shelf.book_slug`, with no join back
  // to the books table, so it works unmodified for a comic's slug — reviews,
  // ratings and shelf status are content-type-agnostic in this schema.
  const [related, community] = await Promise.all([
    relatedComics(comic, lang),
    getBookCommunity(comic.slug),
  ]);

  const meta = [
    [_("metaPublisher"), comic.publisher],
    [_("publishedLabel"), comic.publication_date],
    [_("coverPriceLabel"), comic.cover_price],
    [_("formatLabel"), comic.format],
    [_("valueTodayLabel"), comic.value_today],
  ].filter(([, v]) => v);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav className="text-muted mb-6 text-sm">
          <Link href={`/${lang}/comics`} className="hover:text-brand-600">{_("comicsLink")}</Link>
          {comic.category && (
            <>
              {" / "}
              <span className="text-[var(--fg)]">{comic.category}</span>
            </>
          )}
        </nav>

        {/* min-w-0 on both grid children — see books/[slug]/page.jsx for why:
            without it, a cover with unusually large intrinsic dimensions can
            force this column (and the whole grid) wider than the viewport. */}
        <div className="grid min-w-0 gap-10 lg:grid-cols-[300px_1fr]">
          <div className="min-w-0">
            <div className="card aspect-[2/3] overflow-hidden !shadow-xl hover:!translate-y-0">
              <BookCover title={comic.title} author={comic.publisher} cover_url={comic.cover_url} />
            </div>

            {/* Comics have no Amazon fields, so QuickActions' "Get Book" button
                simply doesn't render (it's gated on book.buyUrl) — every other
                action (like/wishlist/share/shelf status) works identically. */}
            <QuickActions book={{ ...comic, author: comic.publisher }} />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl"><TitleTransliterated text={comic.title} /></h1>
            {comic.publisher && <p className="text-muted mt-2 text-lg"><TitleTransliterated text={comic.publisher} /></p>}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {comic.category && <span className="pill !text-[11px]">{comic.category}</span>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Rating value={comic.rating} />
              {community.reviews.length > 0 && (
                <a href="#reviews" className="text-muted hover:text-brand-600">
                  {community.reviews.length} {community.reviews.length === 1 ? _("reviewWord") : _("reviewsWord")}
                </a>
              )}
            </div>

            {comic.description && <Translated as="p" className="mt-6 text-lg leading-relaxed" text={comic.description} />}

            {meta.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("details")}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {meta.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted text-xs uppercase tracking-wide">{k}</dt>
                      <dd className="text-sm font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {comic.characters.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("charactersIntroducedLabel")}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {comic.characters.map((ch) => <span key={ch} className="pill">{ch}</span>)}
                </div>
              </div>
            )}

            {comic.creators.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">{_("creatorsLabel")}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {comic.creators.map((c) => <span key={c} className="pill">{c}</span>)}
                </div>
              </div>
            )}

            {comic.fun_fact && (
              <div className="mt-8 tint-brand rounded-2xl border-l-4 border-brand-500 p-5">
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-100">💡 {_("funFactLabel")}</p>
                <Translated as="p" className="mt-1 text-sm leading-relaxed" text={comic.fun_fact} />
              </div>
            )}

            <div className="mt-10 scroll-mt-24" id="write-review">
              <ShelfControls slug={comic.slug} />
            </div>

            <div id="reviews" className="mt-10 scroll-mt-24">
              <h2 className="text-xl font-bold">{_("communityTitle")}</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-[220px_1fr]">
                <div className="card p-5 text-center hover:!translate-y-0">
                  <p className="text-4xl font-extrabold">{community.avg_rating ?? "—"}</p>
                  <p className="text-amber-400">{"★".repeat(Math.round(community.avg_rating || 0)) || "☆☆☆☆☆"}</p>
                  <p className="text-muted mt-1 text-xs">{_("ratingsFromReaders", { n: community.rating_count })}</p>
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
                  <h3 className="font-bold">{_("readerReviewsLabel")} ({community.reviews.length})</h3>
                  {community.reviews.map((r) => (
                    <ReviewCard
                      key={`${r.user_id}-${r.updated_at}`}
                      rating={r.rating}
                      review={r.review}
                      spoiler={r.spoiler}
                      updatedAt={r.updated_at}
                      reviewer={{ name: r.name, photo_url: r.photo_url, slug: r.slug, user_id: r.user_id }}
                      spoilerLabel={_("spoilerClickToReveal")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section id="related" title={_("youMightAlsoLike")}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((c) => <BookCard key={c.id} book={c} hrefBase={`/${lang}/comics`} />)}
          </div>
        </Section>
      )}
    </>
  );
}
