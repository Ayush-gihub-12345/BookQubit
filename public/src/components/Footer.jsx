import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import SocialIcon from "./SocialIcon";
import { getPlatformStats, getSiteSettings } from "@/lib/repo";
import { t } from "@/lib/i18n";

const SOCIALS = [
  ["social_twitter", "twitter", "X (Twitter)"],
  ["social_instagram", "instagram", "Instagram"],
  ["social_facebook", "facebook", "Facebook"],
  ["social_youtube", "youtube", "YouTube"],
];

// Counters only render once the catalog looks healthy: "12 books" under a headline about a library makes the
// whole site look empty (UI v2 decision).
const SHOW_STATS_FROM = 1000;

export default async function Footer({ lang = "en" }) {
  const _ = t(lang);
  const [stats, settings] = await Promise.all([
    getPlatformStats().catch(() => null),
    getSiteSettings().catch(() => ({})),
  ]);
  const socialLinks = SOCIALS.filter(([key]) => settings[key]);
  const withLang = (href) => `/${lang}${href}`;
  const link = "inline-flex min-h-11 items-center hover:text-brand-700";

  const COLS = [
    { title: _("footerExplore"), links: [[_("browse"), "/books"], [_("topRated"), "/books?sort=rating"], [_("newReleases"), "/books?sort=new"], [_("collections"), "/collections"], [_("tags"), "/tags"]] },
    { title: _("footerBrowse"), links: [[_("authors"), "/authors"], [_("publishers"), "/publications"], [_("comics"), "/comics"], [_("compareWord"), "/compare"], [_("requestABookTitle"), "/request-a-book"]] },
    { title: _("navCommunity"), links: [["Feed", "/feed"], [_("communityTitle"), "/community"], [_("navBookwormRanking"), "/leaderboard"], ["MindSpace", "/mindspace"]] },
    { title: _("footerCompany"), links: [[_("footerAbout"), "/about"], [_("footerContact"), "/contact"], [_("footerPrivacy"), "/privacy"], [_("footerTerms"), "/terms"]] },
  ];

  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--surface)] pb-20 lg:pb-0">
      {stats && stats.books >= SHOW_STATS_FROM && (
        <div className="border-b border-[var(--line)]">
          <div className="container-bq grid grid-cols-2 gap-4 py-6 text-center sm:grid-cols-4">
            {[
              [stats.books, _("booksStat")], [stats.authors, _("authors")],
              [stats.reviews, _("readerReviewsLabel")], [stats.readers, _("readersStat")],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-brand-700">{n.toLocaleString()}+</p>
                <p className="text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-bq grid gap-10 py-12 md:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="max-w-sm">
          <Logo size={32} />
          <p className="text-muted mt-3 text-sm">{_("footerTagline")}</p>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socialLinks.map(([key, icon, label]) => (
                <a key={key} href={settings[key]} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="btn-icon text-muted hover:text-brand-700"><SocialIcon name={icon} size={16} /></a>
              ))}
            </div>
          )}
          <div className="mt-5">
            <p className="text-sm font-semibold">{_("newsletterTitle")}</p>
            <p className="text-muted mt-1 text-xs">{_("newsletterSub")}</p>
            <div className="mt-3">
              <NewsletterForm lang={lang} labels={{
                placeholder: _("newsletterPlaceholder"), button: _("newsletterButton"), success: _("newsletterSuccess"),
              }} />
            </div>
          </div>
        </div>

        {COLS.map((c) => (
          <div key={c.title}>
            <p className="eyebrow mb-2 !text-[var(--muted)]">{c.title}</p>
            <ul className="text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={withLang(href)} prefetch={false} className={link}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-bq flex flex-wrap justify-between gap-3 border-t border-[var(--line)] py-5 text-xs text-[var(--muted)]">
        <span>© {new Date().getFullYear()} BookQubit. {_("rightsReserved")}</span>
        <span>As an Amazon Associate, BookQubit earns from qualifying purchases.</span>
      </div>
    </footer>
  );
}
