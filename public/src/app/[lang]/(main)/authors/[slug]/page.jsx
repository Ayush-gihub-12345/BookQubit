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
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row sm:items-start">
          {author.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.image_url} alt={author.name} className="h-32 w-32 rounded-full object-cover shadow-lg" />
          ) : (
            <div className="grid h-32 w-32 shrink-0 place-items-center tint-brand rounded-full text-4xl font-bold text-brand-600">
              {author.name[0]}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold sm:justify-start">
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
            <Translated as="p" className="mt-3 max-w-2xl leading-relaxed" text={author.bio} />
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {author.genres.map((g) => <span key={g} className="pill">{g}</span>)}
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
          <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-1">
            {[
              [books.length, _("booksStat")],
              [books.filter((b) => b.rating).length ? (books.reduce((n, b) => n + (b.rating || 0), 0) / books.filter((b) => b.rating).length).toFixed(1) : "—", _("avgRatingStat")],
              [author.famous_work ? 1 : 0, _("featuredLabelStat"), author.famous_work],
            ].map(([val, label, sub]) => (
              <div key={label} className="rounded-xl border border-line px-4 py-3 text-center">
                <p className="text-lg font-extrabold">{val}</p>
                <p className="text-muted text-[11px]">{label}</p>
                {sub && <p className="text-muted mt-0.5 line-clamp-1 text-[10px]">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {books.length > 0 && (
        <Section title={(() => {
          const [before, after] = _("booksByName").split("{name}");
          return <>{before}<TitleTransliterated text={author.name} />{after}</>;
        })()}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((b) => <BookCard key={b.id} book={b} hrefBase={`/${lang}/books`} />)}
          </div>
        </Section>
      )}
    </>
  );
}
