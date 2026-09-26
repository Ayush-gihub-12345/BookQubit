import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getPlatformStats } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export async function generateMetadata() {
  const lang = await getLang();
  const _ = t(lang);
  return {
    title: _("aboutMetaTitle"),
    description: _("aboutMetaDesc"),
    alternates: { canonical: `/${lang}/about` },
  };
}

const featuresOf = (_) => [
  { icon: "bookOpen", title: _("featSummariesTitle"), desc: _("featSummariesDesc") },
  { icon: "star", title: _("featReviewsTitle"), desc: _("featReviewsDesc") },
  { icon: "bookmark", title: _("featShelfTitle"), desc: _("featShelfDesc") },
  { icon: "trophy", title: _("featRankingTitle"), desc: _("featRankingDesc") },
  { icon: "users", title: _("featCommunityTitle"), desc: _("featCommunityDesc") },
  { icon: "globe", title: _("featLanguagesTitle"), desc: _("featLanguagesDesc") },
];

export default async function AboutPage() {
  const lang = await getLang();
  const _ = t(lang);
  const FEATURES = featuresOf(_);
  const stats = await getPlatformStats().catch(() => null);
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-6 flex justify-center"><Logo size={44} /></div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{_("aboutHeroTitle")}</h1>
        <p className="text-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
          {_("aboutHeroSub")}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[[stats.books, _("booksStat")], [stats.authors, _("authors")], [stats.reviews, _("readerReviewsLabel")], [stats.readers, _("readersStat")]].map(([n, label]) => (
            <div key={label} className="card p-5 text-center hover:!translate-y-0">
              <p className="text-3xl font-extrabold text-brand-600">{n.toLocaleString()}+</p>
              <p className="text-muted mt-1 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mission */}
      <div className="mx-auto mt-14 max-w-2xl">
        <h2 className="text-2xl font-bold">{_("whyWeBuiltTitle")}</h2>
        <p className="text-muted mt-3 leading-relaxed">
          {_("whyWeBuiltPara1")}
        </p>
        <p className="text-muted mt-3 leading-relaxed">
          {_("whyWeBuiltPara2")}
        </p>
      </div>

      {/* Feature grid */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-bold">{_("whatYouCanDoTitle")}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 hover:!translate-y-0">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
                <Icon name={f.icon} size={18} />
              </span>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="text-muted mt-1.5 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Growing */}
      <div className="tint-brand mx-auto mt-14 max-w-2xl rounded-2xl p-6 text-center">
        <p className="font-semibold text-brand-600">{_("activelyGrowingLabel")}</p>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          {_("activelyGrowingPara")}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-14 text-center">
        <h2 className="text-2xl font-bold">{_("readyToFindNextBookTitle")}</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href={withLang("/books")} className="btn-primary">{_("browseBooksLabel")}</Link>
          <Link href={withLang("/community")} className="btn-ghost">{_("joinTheCommunityLabel")}</Link>
        </div>
      </div>
    </div>
  );
}
