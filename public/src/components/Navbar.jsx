"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";
import Icon from "./Icon";
import { LogoMark } from "./Logo";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import CustomThemeModal from "./CustomThemeModal";
import { t } from "@/lib/i18n";

function Dropdown({ button, children, width = "w-48" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      {button(() => setOpen(!open), open)}
      {open && (
        <div className={`bg-surface border-line absolute right-0 top-full z-50 mt-2 ${width} overflow-hidden rounded-2xl border shadow-2xl`}
          onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-base shadow-sm transition hover:scale-105 hover:border-brand-500 hover:shadow-md";

export default function Navbar({ lang, theme, languages, themes, labels }) {
  const tr = t(lang);
  const [open, setOpen] = useState(false);
  const [myGenres, setMyGenres] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [surprising, setSurprising] = useState(false);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef(null);

  // Unlike the homepage's own "Surprise me" link (which reuses whatever
  // random book that page's server render happened to pick), this fetches
  // a genuinely fresh pick on every click, from anywhere on the site.
  const surpriseMe = async () => {
    setSurprising(true);
    try {
      const r = await fetch(`/api/random-book?lang=${lang}`);
      const d = await r.json();
      if (d.slug) router.push(`/${lang}/books/${encodeURIComponent(d.slug)}`);
    } finally {
      setSurprising(false);
    }
  };

  // Powers the "Your Genres" row in the Discover dropdown — set during
  // onboarding, editable from the account page.
  useEffect(() => {
    if (!firebaseEnabled) return;
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged((u) => {
      if (!u) { setMyGenres([]); setNotifCount(0); return; }
      fetch(`/api/preferences?uid=${u.uid}`).then((r) => r.json())
        .then((d) => setMyGenres(d.genres || [])).catch(() => setMyGenres([]));
      fetch(`/api/notifications?uid=${u.uid}`).then((r) => r.json())
        .then((d) => setNotifCount((d.notifications || []).length)).catch(() => setNotifCount(0));
    });
  }, []);

  // Close the mobile sheet on any click/tap outside the header
  useEffect(() => {
    const close = (e) => { if (!headerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, []);

  // Publisher names ("Penguin Random House", "HarperCollins") and reader-
  // picked genre names (myGenres, sourced from the catalog's category data)
  // are left untranslated deliberately — they're real-world proper nouns /
  // catalog data values, not UI chrome, consistent with how book titles,
  // author names, and category filter values are handled everywhere else.
  const MENUS = [
    { href: "/", icon: "home", label: tr("homeWord") },
    {
      href: "/books", icon: "compass", label: tr("navDiscover"),
      items: [
        { href: "/books?sort=rating", icon: "trendingUp", label: tr("trendingWord") },
        { href: "/books?sort=new", icon: "clock", label: tr("newReleases") },
        { href: "/books?sort=rating", icon: "star", label: tr("topRated") },
        { href: "/collections", icon: "layers", label: labels.collections },
        ...myGenres.map((g) => ({ href: `/books?category=${encodeURIComponent(g)}`, icon: "heart", label: g })),
      ],
    },
    {
      href: "/books", icon: "book", label: tr("navBrowse"),
      items: [
        { href: "/books", icon: "book", label: tr("allBooksMenu") },
        { href: "/categories", icon: "grid", label: tr("genresAndCategories") },
        { href: "/tags", icon: "hash", label: labels.tags },
        { href: "/comics", icon: "zap", label: labels.comics },
      ],
    },
    { href: "/authors", icon: "feather", label: labels.authors },
    {
      href: "/publications", icon: "building", label: labels.publishers,
      items: [
        { href: "/publications", icon: "building", label: tr("allPublishersMenu") },
        { href: "/publications/penguin-random-house", icon: "book", label: "Penguin Random House" },
        { href: "/publications/harpercollins", icon: "book", label: "HarperCollins" },
      ],
    },
    { href: "/community", icon: "users", label: tr("navCommunity") },
    { href: "/leaderboard", icon: "trophy", label: tr("navBookwormRanking") },
  ];

  // Multi-column mega menu ("More") — enterprise-style grouped catalog entry
  // points. Section titles and the generic first group are translated; the
  // category/country/collection/format NAMES below are catalog data values
  // that also appear literally in the query string they link to (e.g.
  // category=Philosophy) — translating just the label would desync it from
  // the filter it points at, so those stay in their stored English form,
  // same rule as everywhere else data values are shown.
  const MEGA = [
    {
      title: tr("bestSellers"),
      links: [
        [tr("topRated"), "/books?sort=rating"],
        [tr("trendingNow"), "/books?sort=rating"],
        [tr("newReleases"), "/books?sort=new"],
        [tr("allBooksMenu"), "/books"],
        [tr("editorsChoice"), "/books?sort=rating&rating=4.5"],
      ],
    },
    {
      title: tr("literatureTypes"),
      links: [
        ["Philosophy", "/books?category=Philosophy"],
        ["History", "/books?category=History"],
        ["Fiction", "/books?category=Fiction"],
        ["Psychology", "/books?category=Psychology"],
        ["Self-Help", "/books?category=Self-Help"],
        ["Business", "/books?category=Business"],
        ["Finance", "/books?category=Finance"],
      ],
    },
    {
      title: tr("booksByCountry"),
      links: [
        ["India", "/books?country=India"],
        ["USA", "/books?country=USA"],
        ["UK", "/books?country=UK"],
        ["Israel", "/books?country=Israel"],
        ["Germany", "/books?country=Germany"],
        ["Japan", "/books?country=Japan"],
        ["Russia", "/books?country=Russia"],
      ],
    },
    {
      title: tr("specialCollections"),
      links: [
        ["Harari Collection", "/collections/Harari%20Collection"],
        ["Stoic Classics", "/collections/Stoic%20Classics"],
        ["Dystopian Classics", "/collections/Dystopian%20Classics"],
        ["Revolutionary Classics", "/collections/Revolutionary%20Classics"],
        [tr("allCollectionsMenu"), "/collections"],
      ],
    },
    {
      title: tr("byFormat"),
      links: [
        ["Paperback", "/books?format=Paperback"],
        ["Hardcover", "/books?format=Hardcover"],
        ["EBook", "/books?format=EBook"],
        [labels.comics, "/comics"],
      ],
    },
  ];

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    router.refresh();
  };
  // Language is now a real URL segment (see middleware.js) — switching it
  // means navigating to the same path with that segment swapped, not just
  // setting a cookie. A cookie-only switch would silently no-op here:
  // middleware treats the URL as authoritative and rewrites the `lang`
  // cookie to match it on every request, so reloading the *same* URL after
  // setting the cookie would just have middleware immediately overwrite it
  // back. A full navigation (not router.push) so every part of the site —
  // not just the current route's server tree — re-renders in the new
  // language on the very next paint, matching what a returning visit would
  // look like instead of leaving some already-mounted client state behind
  // in the old language.
  const switchLang = (code) => {
    const parts = pathname.split("/");
    parts[1] = code;
    window.location.href = parts.join("/") || `/${code}`;
  };
  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const currentLang = languages.find((l) => l.code === lang) || languages[0];
  // Every href in MENUS/MEGA/etc. below is written unprefixed on purpose —
  // this one helper adds the current language segment at render time, so
  // the route data itself doesn't need to duplicate `lang` into every entry.
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;
  // pathname is now lang-prefixed (e.g. "/hi/compare") — strip that segment
  // back off before comparing against the unprefixed reference paths used
  // for active-link highlighting below.
  const relPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return (
    <header ref={headerRef} className="border-line bg-surface/85 relative z-50 border-b shadow-sm backdrop-blur-xl lg:sticky lg:top-0">
      {/* brand accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700" />
      {/* Row 1 */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        {/* aria-label because the visible "BookQubit" text beside the mark is
            `hidden` below the sm breakpoint and LogoMark is aria-hidden — so
            on a phone this link had no accessible name at all, which is what
            Lighthouse reported as "links do not have a discernible name" on
            mobile only. The label also covers the icon-only rendering for
            screen-reader users on any width. */}
        <Link href={withLang("/")} prefetch={false} aria-label="BookQubit — home" className="flex shrink-0 items-center gap-2">
          <LogoMark size={36} />
          <span className="hidden text-xl font-extrabold tracking-tight sm:inline">
            Book<span className="text-brand-600">Qubit</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 px-4 md:block">
          <div className="mx-auto max-w-xl">
            <SearchBar lang={lang} placeholder={labels.search} big />
          </div>
        </div>
        <div className="flex-1 md:hidden" />

        {/* Surprise me — fresh random book on every click */}
        <button
          onClick={surpriseMe} disabled={surprising}
          className={`${iconBtn} hidden sm:grid disabled:opacity-50`}
          aria-label={labels.surpriseMe} title={labels.surpriseMe}
        >
          <Icon name="zap" size={17} />
        </button>

        {/* Notifications */}
        <Link href={withLang("/notifications")} prefetch={false} className={`${iconBtn} relative hidden sm:grid`} aria-label={labels.notifications} title={labels.notifications}>
          <Icon name="bell" size={17} />
          {notifCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>

        {/* Liked books */}
        <Link href={withLang("/liked")} prefetch={false} className={`${iconBtn} hidden sm:grid`} aria-label={labels.likedBooks} title={labels.likedBooks}>
          <Icon name="heart" size={17} />
        </Link>

        {/* Theme picker */}
        <div className="hidden sm:block">
          <Dropdown
            width="w-44"
            button={(toggle) => (
              <button onClick={toggle} className={iconBtn} title={`${labels.theme}: ${currentTheme.name}`} aria-label={labels.theme}>
                <Icon name="palette" size={17} />
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">{labels.theme}</p>
            {themes.map((t) => (
              <button key={t.id} onClick={() => setCookie("theme", t.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${t.id === theme ? "font-bold text-brand-600" : ""}`}>
                <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: t.swatch }} />
                {t.name}
                {t.id === theme && <Icon name="check" size={14} className="ml-auto text-brand-600" />}
              </button>
            ))}
            <button onClick={() => setShowCustomTheme(true)}
              className={`border-line flex w-full items-center gap-3 border-t px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${theme === "custom" ? "font-bold text-brand-600" : ""}`}>
              <Icon name="palette" size={14} className="text-brand-600" />
              {tr("customThemeLabel")}
              {theme === "custom" && <Icon name="check" size={14} className="ml-auto text-brand-600" />}
            </button>
          </Dropdown>
        </div>

        {/* Language picker */}
        <div className="hidden sm:block">
          <Dropdown
            width="w-48"
            button={(toggle) => (
              <button onClick={toggle}
                className="border-line bg-surface flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold shadow-sm transition hover:scale-105 hover:border-brand-500 hover:shadow-md"
                aria-label={labels.language}>
                🌐 <span className="uppercase">{currentLang.code}</span>
                <span className="text-[9px] opacity-50">▼</span>
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">{labels.language}</p>
            <div className="max-h-72 overflow-auto">
              {languages.map((l) => (
                <button key={l.code} onClick={() => switchLang(l.code)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${l.code === lang ? "font-bold text-brand-600" : ""}`}>
                  <span className="text-muted w-7 text-xs font-bold uppercase">{l.code}</span> {l.name}
                  {l.code === lang && <span className="ml-auto text-brand-600">✓</span>}
                </button>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="shrink-0 whitespace-nowrap"><AuthButton labels={labels} /></div>

        <button onClick={() => setOpen(!open)} className={`${iconBtn} lg:hidden`} aria-label={labels.menu}>☰</button>
      </div>

      {/* Mobile search row — full width, never squeezed */}
      <div className="border-line border-t px-4 py-2 md:hidden">
        <SearchBar lang={lang} placeholder={labels.search} big />
      </div>

      {/* Row 2 */}
      <div className="border-line relative hidden border-t lg:block">
        <nav className="mx-auto flex max-w-7xl items-center justify-center px-4">
          {MENUS.map((m) => {
            const active = m.href === "/" ? relPath === "/" : relPath.startsWith(m.href.split("?")[0]);
            return (
              <div key={m.label} className="group relative">
                <Link href={withLang(m.href)} prefetch={false}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition hover:text-brand-600 ${active ? "text-brand-600" : ""}`}>
                  <Icon name={m.icon} size={14} className="opacity-70" /> {m.label}
                  {m.items && <Icon name="chevronDown" size={11} className="opacity-40 transition group-hover:rotate-180" />}
                  <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
                {m.items && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="bg-surface border-line overflow-hidden rounded-2xl border shadow-2xl">
                      {m.items.map((it) => (
                        <Link key={it.label} href={withLang(it.href)} prefetch={false}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5">
                          <Icon name={it.icon} size={14} className="text-muted" /> {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* More — full mega menu */}
          <div className="group">
            <button className="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition hover:text-brand-600">
              <Icon name="grid" size={14} className="opacity-70" /> {tr("moreWord")}
              <Icon name="chevronDown" size={11} className="opacity-40 transition group-hover:rotate-180" />
              <span className="absolute inset-x-3 bottom-0 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform group-hover:scale-x-100" />
            </button>
            <div className="invisible absolute inset-x-0 top-full z-50 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="bg-surface border-line mx-auto max-w-7xl overflow-hidden rounded-b-2xl border border-t-0 shadow-2xl">
                <div className="grid grid-cols-6 gap-6 p-8">
                  {MEGA.map((col) => (
                    <div key={col.title}>
                      <p className="border-line mb-3 border-b pb-2 text-sm font-bold">{col.title}</p>
                      <ul className="space-y-1.5">
                        {col.links.map(([label, href]) => (
                          <li key={label}>
                            <Link href={withLang(href)} prefetch={false} className="text-muted block text-[13px] transition hover:translate-x-0.5 hover:text-brand-600">
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <p className="border-line mb-3 border-b pb-2 text-sm font-bold">{tr("byLanguageLabel")}</p>
                    <ul className="max-h-52 space-y-1.5 overflow-auto pr-1">
                      {languages.map((l) => (
                        <li key={l.code}>
                          <button onClick={() => switchLang(l.code)}
                            className={`block text-[13px] transition hover:translate-x-0.5 hover:text-brand-600 ${l.code === lang ? "font-bold text-brand-600" : "text-muted"}`}>
                            {l.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-line flex justify-center gap-3 border-t p-4">
                  <Link href={withLang("/categories")} prefetch={false} className="btn-primary !py-2 text-sm">
                    Browse All Categories <Icon name="arrowRight" size={14} />
                  </Link>
                  <Link href={withLang("/request-a-book")} prefetch={false} className="btn-ghost !py-2 text-sm">
                    <Icon name="bookmark" size={14} /> Request a Book
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link href={withLang("/compare")} prefetch={false}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition hover:text-brand-600 ${relPath === "/compare" || relPath.startsWith("/compare/") ? "text-brand-600" : ""}`}>
            <Icon name="layers" size={14} className="opacity-70" /> {tr("compareWord")}
            <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${relPath === "/compare" || relPath.startsWith("/compare/") ? "scale-x-100" : "scale-x-0 hover:scale-x-100"}`} />
          </Link>

          <Link href={withLang("/about")} prefetch={false}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition hover:text-brand-600 ${relPath === "/about" ? "text-brand-600" : ""}`}>
            <Icon name="shieldCheck" size={14} className="opacity-70" /> {tr("aboutWord")}
            <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${relPath === "/about" ? "scale-x-100" : "scale-x-0 hover:scale-x-100"}`} />
          </Link>
        </nav>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="border-line border-t px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {MENUS.map((m) => (
              <Link key={m.label} href={withLang(m.href)} prefetch={false} onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
                <Icon name={m.icon} size={15} className="text-muted" /> {m.label}
              </Link>
            ))}
            <Link href={withLang("/notifications")} prefetch={false} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="bell" size={15} className="text-muted" /> {tr("notificationsWord")} {notifCount > 0 && <span className="text-brand-600">({notifCount})</span>}
            </Link>
            <Link href={withLang("/liked")} prefetch={false} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="heart" size={15} className="text-muted" /> {tr("likedBooksWord")}
            </Link>
            <Link href={withLang("/compare")} prefetch={false} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="layers" size={15} className="text-muted" /> {tr("compareWord")}
            </Link>
            <button onClick={() => { setOpen(false); surpriseMe(); }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="zap" size={15} className="text-muted" /> {tr("navSurpriseMe")}
            </button>
            <Link href={withLang("/about")} prefetch={false} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="shieldCheck" size={15} className="text-muted" /> {tr("aboutWord")}
            </Link>
            <Link href={withLang("/login")} prefetch={false} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="user" size={15} className="text-muted" /> {labels.signIn}
            </Link>
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">{tr("exploreSectionLabel")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[[tr("topRated"), "/books?sort=rating"], [tr("newReleases"), "/books?sort=new"], ["Philosophy", "/books?category=Philosophy"], ["History", "/books?category=History"], ["India", "/books?country=India"], [labels.collections, "/collections"], [labels.tags, "/tags"]].map(([label, href]) => (
              <Link key={label} href={withLang(href)} prefetch={false} onClick={() => setOpen(false)} className="pill">{label}</Link>
            ))}
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">{tr("navTheme")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {themes.map((t) => (
              <button key={t.id} onClick={() => setCookie("theme", t.id)}
                className={`pill ${t.id === theme ? "!bg-brand-600 !text-white" : ""}`}>
                {t.icon} {t.name}
              </button>
            ))}
            <button onClick={() => setShowCustomTheme(true)}
              className={`pill ${theme === "custom" ? "!bg-brand-600 !text-white" : ""}`}>
              🎨 {tr("customThemeLabel")}
            </button>
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">{tr("navLanguage")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((l) => (
              <button key={l.code} onClick={() => switchLang(l.code)}
                className={`pill ${l.code === lang ? "!bg-brand-600 !text-white" : ""}`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCustomTheme && <CustomThemeModal onClose={() => setShowCustomTheme(false)} />}
    </header>
  );
}
