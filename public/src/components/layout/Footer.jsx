"use client";

import Link from "next/link";
import Logo from "../Logo";
import NewsletterForm from "../NewsletterForm";
import SocialIcon from "../SocialIcon";
import { useT } from "@/context/TranslationContext";

const SOCIALS = [
  ["social_twitter", "twitter", "X (Twitter)"],
  ["social_instagram", "instagram", "Instagram"],
  ["social_facebook", "facebook", "Facebook"],
  ["social_youtube", "youtube", "YouTube"],
];

export default function Footer({ stats, settings = {} }) {
  const t = useT();
  const socialLinks = SOCIALS.filter(([key]) => settings[key]);

  return (
    <footer className="border-line bg-surface mt-16 border-t">
      {stats && (
        <div className="border-line border-b">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-center sm:grid-cols-4">
            {[
              [stats.books, t("footer.books")],
              [stats.authors, t("footer.authors")],
              [stats.reviews, t("footer.reviews")],
              [stats.readers, t("footer.readers")],
            ].map(([n, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold text-brand-600">
                  {n.toLocaleString()}+
                </p>
                <p className="text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo size={32} />
          <p className="text-muted mt-3 max-w-xs text-sm">
            {t("footer.tagline")}
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socialLinks.map(([key, icon, label]) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="border-line text-muted grid h-9 w-9 place-items-center rounded-full border transition hover:border-brand-500 hover:text-brand-600"
                >
                  <SocialIcon name={icon} size={16} />
                </a>
              ))}
            </div>
          )}
          <div className="mt-5">
            <p className="text-sm font-semibold">
              {t("footer.newsletterTitle")}
            </p>
            <p className="text-muted mt-1 text-xs">
              {t("footer.newsletterSub")}
            </p>
            <div className="mt-3">
              <NewsletterForm
                labels={{
                  placeholder: t("footer.newsletterPlaceholder"),
                  button: t("footer.newsletterButton"),
                  success: t("footer.newsletterSuccess"),
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-muted mb-3 text-sm font-semibold uppercase tracking-wide">
            {t("footer.explore")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/books"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("browse.allBooks")}
              </Link>
            </li>
            <li>
              <Link
                href="/books?sort=rating"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("discover.topRated")}
              </Link>
            </li>
            <li>
              <Link
                href="/books?sort=new"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("discover.newReleases")}
              </Link>
            </li>
            <li>
              <Link
                href="/collections"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("discover.collections")}
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("browse.tags")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-muted mb-3 text-sm font-semibold uppercase tracking-wide">
            {t("footer.browse")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/authors"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("nav.authors")}
              </Link>
            </li>
            <li>
              <Link
                href="/publications"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("nav.publishers")}
              </Link>
            </li>
            <li>
              <Link
                href="/comics"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("browse.comics")}
              </Link>
            </li>
            <li>
              <Link
                href="/community"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("nav.community")}
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboard"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("nav.leaderboard")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-muted mb-3 text-sm font-semibold uppercase tracking-wide">
            {t("footer.company")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/about"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("footer.contact")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                prefetch={false}
                className="hover:text-brand-600"
              >
                {t("footer.terms")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-line border-t px-4 py-4">
        <p className="text-muted text-center text-xs">
          © {new Date().getFullYear()} BookQubit. {t("footer.rightsReserved")}
        </p>
      </div>
    </footer>
  );
}
