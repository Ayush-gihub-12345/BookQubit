import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import TitleTransliterated from "@/components/TitleTransliterated";
import Translated from "@/components/Translated";
import { getAuthor, booksByAuthor } from "@/lib/repo";
import { t } from "@/lib/i18n";
import { FollowButton, ShareButton } from "@/components/FollowButton";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const author = await getAuthor(slug, lang);
  return author
    ? { title: author.name, description: author.bio?.slice(0, 160), alternates: { canonical: `/${lang}/authors/${author.slug}` } }
    : { title: t(lang)("authorNotFound"), robots: { index: false } };
}

export default async function AuthorPage({ params }) {
  const { slug, lang } = await params;
  const _ = t(lang);
  const author = await getAuthor(slug, lang);
  if (!author) notFound();
  const books = await booksByAuthor(author.name, lang);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Breadcrumbs lang={lang} homeLabel={_("homeWord")} label={_("navBreadcrumb")} className="mb-5" items={[
          { label: _("authors"), href: "/authors" },
          { label: <TitleTransliterated text={author.name} /> },
        ]} />
        <div className="border-line flex flex-col items-center gap-6 border-b pb-8 sm:flex-row sm:items-start sm:gap-8">
          {author.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.image_url} alt={author.name} className="h-32 w-32 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="grid h-32 w-32 shrink-0 place-items-center tint-brand rounded-full text-4xl font-bold text-brand-600">
              {author.name[0]}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="flex flex-wrap items-center justify-center gap-2 text-3xl font-bold sm:justify-start sm:text-4xl">
              <TitleTransliterated text={author.name} />
              {author.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/10 px-2 py-0.5 text-xs font-semibold text-brand-600" title={_("verifiedTitleAttr")}>
                  <Icon name="shieldCheck" size={14} /> {_("verifiedBadge")}
                </span>
              ) : null}
            </h1>
            <p className="text-muted mt-1 text-sm">
              {[author.country, author.birth_year && _("bornAbbrev", { year: author.birth_year })].filter(Boolean).join(" · ")}
            </p>
            <Translated as="p" className="mt-3 max-w-[70ch] leading-relaxed" text={author.bio} />
            {/* The best-known title used to be a stat tile showing "1". It is
                a thing to go and find, so it is a link. */}
            {author.famous_work && (
              <p className="mt-3 text-sm">
                <span className="text-muted">{_("featuredLabelStat")}: </span>
                <Link href={`/${lang}/books?q=${encodeURIComponent(author.famous_work)}`} prefetch={false} className="font-medium text-brand-600 hover:underline">
                  {author.famous_work}
                </Link>
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {author.genres.map((g) => (
                <Link key={g} href={`/${lang}/books?q=${encodeURIComponent(g)}`} prefetch={false} className="pill">{g}</Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <FollowButton type="author" id={author.slug} label={_("followAuthorLabel")} />
              <ShareButton label={_("shareProfileLabel")} />
              {author.wikipedia_url && (
                <a href={author.wikipedia_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">{_("wikipediaLabel")}</a>
              )}
              {author.website_url && (
                <a href={author.website_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">{_("websiteLabel")}</a>
              )}
            </div>
          </div>
          {/* Engagement stats */}
          <dl className="flex shrink-0 gap-8 sm:flex-col sm:gap-4 sm:text-right">
            {[
              [books.length, _("booksStat")],
              [books.filter((b) => b.rating).length ? (books.reduce((n, b) => n + (b.rating || 0), 0) / books.filter((b) => b.rating).length).toFixed(1) : "—", _("avgRatingStat")],
            ].map(([val, label]) => (
              <div key={label}>
                <dd className="font-display text-2xl font-semibold">{val}</dd>
                <dt className="text-muted text-xs">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {books.length > 0 && (
        <Section title={(() => {
          const [before, after] = _("booksByName").split("{name}");
          return <>{before}<TitleTransliterated text={author.name} />{after}</>;
        })()}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => <BookCard key={b.id} book={b} hrefBase={`/${lang}/books`} />)}
          </div>
        </Section>
      )}
    </>
  );
}
