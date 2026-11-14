import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import TitleTransliterated from "@/components/TitleTransliterated";
import Translated from "@/components/Translated";
import { getPublication, booksByPublisher } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lang = await getLang();
  const pub = await getPublication(slug, lang);
  return pub
    ? { title: pub.name, description: pub.description?.slice(0, 160), alternates: { canonical: `/${lang}/publications/${pub.slug}` } }
    : { title: t(lang)("publisherNotFound"), robots: { index: false } };
}

export default async function PublicationPage({ params }) {
  const { slug } = await params;
  const lang = await getLang();
  const _ = t(lang);
  const pub = await getPublication(slug, lang);
  if (!pub) notFound();
  const books = await booksByPublisher(pub.name, lang);

  const meta = [
    [_("foundedLabel"), pub.founded],
    [_("headquartersLabel"), pub.headquarters],
    [_("typeLabel"), pub.type],
  ].filter(([, v]) => v);

  const ratedBooks = books.filter((b) => b.rating);
  const avgRating = ratedBooks.length ? (ratedBooks.reduce((n, b) => n + b.rating, 0) / ratedBooks.length).toFixed(1) : "—";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Breadcrumbs lang={lang} homeLabel={_("homeWord")} label={_("navBreadcrumb")} className="mb-5" items={[
          { label: _("publishers"), href: "/publications" },
          { label: <TitleTransliterated text={pub.name} /> },
        ]} />
        <div className="border-line border-b pb-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {pub.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pub.logo_url} alt={pub.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold sm:text-4xl"><TitleTransliterated text={pub.name} /></h1>
              <Translated as="p" className="mt-3 max-w-[70ch] leading-relaxed" text={pub.about || pub.description} />
              {pub.website && (
                <a href={pub.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
                  {pub.website}
                </a>
              )}
            </div>
            {/* Engagement stats — same pattern as the author page */}
            <dl className="flex shrink-0 gap-8 sm:flex-col sm:gap-4 sm:text-right">
              {[
                [books.length, _("booksStat")],
                [avgRating, _("avgRatingStat")],
                [pub.founded || "—", _("foundedLabel")],
              ].map(([val, label]) => (
                <div key={label}>
                  <dd className="font-display text-2xl font-semibold">{val}</dd>
                  <dt className="text-muted text-xs">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {meta.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-4 border-line border-t pt-6 sm:grid-cols-3">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted text-xs">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {pub.notable_authors.length > 0 && (
            <div className="mt-6">
              <p className="text-muted text-xs font-semibold">{_("notableAuthorsLabel")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pub.notable_authors.map((a) => (
                  <Link key={a} href={`/${lang}/books?q=${encodeURIComponent(a)}`} prefetch={false} className="pill"><TitleTransliterated text={a} /></Link>
                ))}
              </div>
            </div>
          )}

          {pub.imprints.length > 0 && (
            <div className="mt-4">
              <p className="text-muted text-xs font-semibold">{_("imprintsLabel")}</p>
              <p className="mt-1 text-sm">
                {pub.imprints.map((im, idx) => <span key={im}>{idx > 0 && ", "}<TitleTransliterated text={im} /></span>)}
              </p>
            </div>
          )}
        </div>
      </div>

      {books.length > 0 && (
        <Section title={(() => {
          const [before, after] = _("booksFromName").split("{name}");
          return <>{before}<TitleTransliterated text={pub.name} />{after}</>;
        })()}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </Section>
      )}
    </>
  );
}
