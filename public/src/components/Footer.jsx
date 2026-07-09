import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import Icon from "./Icon";
import { getPlatformStats } from "@/lib/repo";
import { t } from "@/lib/i18n";

export default async function Footer({ lang = "en" }) {
  const _ = t(lang);
  const stats = await getPlatformStats().catch(() => null);

  return (
    <footer className="border-line bg-surface mt-16 border-t">
      {/* Trust bar */}
      {stats && (
        <div className="border-line border-b">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center sm:grid-cols-4">
            {[
              [stats.books, "Books"], [stats.authors, "Authors"],
              [stats.reviews, "Reader Reviews"], [stats.readers, "Readers"],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-brand-600">{n.toLocaleString()}+</p>
                <p className="text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo size={32} />
          <p className="text-muted mt-3 max-w-xs text-sm">{_("footerTagline")}</p>
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

        <div>
          <p className="text-muted mb-3 text-sm font-semibold uppercase tracking-wide">{_("footerExplore")}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/books" className="hover:text-brand-600">{_("browse")}</Link></li>
            <li><Link href="/books?sort=rating" className="hover:text-brand-600">{_("topRated")}</Link></li>
            <li><Link href="/books?sort=new" className="hover:text-brand-600">{_("newReleases")}</Link></li>
            <li><Link href="/collections" className="hover:text-brand-600">{_("collections")}</Link></li>
            <li><Link href="/tags" className="hover:text-brand-600">{_("tags")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-muted mb-3 text-sm font-semibold uppercase tracking-wide">{_("footerBrowse")}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/authors" className="hover:text-brand-600">{_("authors")}</Link></li>
            <li><Link href="/publications" className="hover:text-brand-600">{_("publishers")}</Link></li>
            <li><Link href="/comics" className="hover:text-brand-600">{_("comics")}</Link></li>
            <li><Link href="/community" className="hover:text-brand-600">{_("communityTitle")}</Link></li>
            <li><Link href="/leaderboard" className="hover:text-brand-600">Bookworm Ranking</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-muted mb-3 text-sm font-semibold uppercase tracking-wide">{_("footerCompany")}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand-600">{_("footerAbout")}</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">{_("footerContact")}</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-600">{_("footerPrivacy")}</Link></li>
            <li><Link href="/terms" className="hover:text-brand-600">{_("footerTerms")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-line border-t px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="text-muted text-xs">© {new Date().getFullYear()} BookQubit. {_("rightsReserved")}</p>
          <p className="text-muted flex items-center gap-1.5 text-xs">
            <Icon name="shieldCheck" size={12} /> {_("footerDisclosure")}
          </p>
        </div>
      </div>
    </footer>
  );
}
