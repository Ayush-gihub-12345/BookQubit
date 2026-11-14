"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";
import Icon from "./Icon";
import { LogoMark } from "./Logo";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import CustomThemeModal from "./CustomThemeModal";
import { t } from "@/lib/i18n";

// One header row on every screen size.
//
//   [logo] Discover▾ Authors Collections Community   [ search ]   Library  🔔  Aa  (account)
//
// It used to be two rows with nine top-level items, three of them dropdowns
// that opened on hover only (so they could not be reached by keyboard or
// touch), a "More" mega menu, and six round icon buttons. The catalog now
// lives behind ONE "Discover" panel, the four places people go most are plain
// links, and everything personal sits in the account menu. Every panel opens
// on click, closes on Escape, outside click or navigation, and reports its
// state with aria-expanded.

// Outside-click and Escape handling for a button + panel pair. `refs` are the
// elements that count as "inside".
function useDismiss(open, close, refs, returnFocusTo) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (refs.some((r) => r.current?.contains(e.target))) return;
      close();
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      close();
      returnFocusTo?.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // refs are stable objects; listing them would re-bind on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

const iconBtn =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-brand-50 hover:text-brand-600";

export default function Navbar({ lang, theme, languages, themes, labels, genres = [], countries = [], collections = [] }) {
  const tr = t(lang);
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myGenres, setMyGenres] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [surprising, setSurprising] = useState(false);
  const [showCustomTheme, setShowCustomTheme] = useState(false);

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const discoverBtn = useRef(null);
  const discoverPanel = useRef(null);
  const prefsBox = useRef(null);
  const prefsBtn = useRef(null);
  const drawerPanel = useRef(null);
  const drawerBtn = useRef(null);

  useDismiss(discoverOpen, () => setDiscoverOpen(false), [discoverBtn, discoverPanel], discoverBtn);
  useDismiss(prefsOpen, () => setPrefsOpen(false), [prefsBox], prefsBtn);
  useDismiss(drawerOpen, () => setDrawerOpen(false), [drawerPanel, drawerBtn], drawerBtn);

  // Any navigation closes whatever was open, so a panel never lingers over
  // the page it just led to.
  useEffect(() => {
    setDiscoverOpen(false); setPrefsOpen(false); setDrawerOpen(false);
  }, [pathname]);

  // The mobile sheet covers the page: stop the page behind it scrolling and
  // move focus into the sheet.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerPanel.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // Signed-in extras: the reader's own genres (set in onboarding, editable on
  // the account page) and the unread notification count.
  useEffect(() => {
    if (!firebaseEnabled) return;
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) { setMyGenres([]); setNotifCount(0); return; }
      authFetch("/api/preferences", {}, u).then((r) => r.json())
        .then((d) => setMyGenres(d.genres || [])).catch(() => setMyGenres([]));
      authFetch("/api/notifications", {}, u).then((r) => r.json())
        .then((d) => setNotifCount((d.notifications || []).length)).catch(() => setNotifCount(0));
    });
  }, []);

  // A fresh random book on every click, from anywhere on the site.
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

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    router.refresh();
  };
  // Language is a URL segment (see middleware.js), so switching it means
  // going to the same path with that segment swapped. A full navigation, not
  // router.push, so every already-mounted client component re-renders in the
  // new language too.
  const switchLang = (code) => {
    const parts = pathname.split("/");
    parts[1] = code;
    window.location.href = parts.join("/") || `/${code}`;
  };

  const currentLang = languages.find((l) => l.code === lang) || languages[0];
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;
  // pathname carries the language prefix ("/hi/compare"); strip it before
  // comparing against the unprefixed paths below.
  const relPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const under = (...roots) => roots.some((r) => relPath === r || relPath.startsWith(`${r}/`));

  // Category, country and collection NAMES are catalog data and appear
  // literally in the query string they link to, so they are shown as stored;
  // only the group titles and the fixed entries are translated. All three
  // lists come from the catalog's own facet counts (see the layout), so no
  // link here can lead to an empty page, and an empty group is dropped.
  const GROUPS = [
    {
      title: tr("navStartHere"),
      links: [
        { label: tr("allBooksMenu"), href: "/books", icon: "book" },
        { label: tr("newReleases"), href: "/books?sort=new", icon: "clock" },
        { label: tr("topRated"), href: "/books?sort=rating", icon: "star" },
        { label: labels.comics, href: "/comics", icon: "zap" },
      ],
    },
    {
      title: tr("navGenres"),
      links: genres.map((g) => ({ label: g.label, href: `/books?category=${encodeURIComponent(g.category)}` })),
      all: { label: tr("navAllGenres"), href: "/categories" },
    },
    {
      title: labels.collections,
      links: collections.map((c) => ({ label: c.name, href: `/collections/${encodeURIComponent(c.name)}` })),
      all: { label: tr("allCollectionsMenu"), href: "/collections" },
    },
    {
      title: tr("booksByCountry"),
      links: countries.map((c) => ({ label: c.name, href: `/books?country=${encodeURIComponent(c.name)}` })),
    },
    {
      title: tr("navMoreWays"),
      links: [
        { label: labels.authors, href: "/authors", icon: "feather" },
        { label: labels.publishers, href: "/publications", icon: "building" },
        { label: labels.tags, href: "/tags", icon: "hash" },
        { label: tr("compareWord"), href: "/compare", icon: "layers" },
        { label: tr("requestABookTitle"), href: "/request-a-book", icon: "bookmark" },
      ],
    },
  ].filter((g) => g.links.length > 0 || g.all);

  const PRIMARY = [
    { label: labels.authors, href: "/authors", active: under("/authors") },
    { label: labels.collections, href: "/collections", active: under("/collections") },
    { label: tr("navCommunity"), href: "/community", active: under("/community", "/readers", "/leaderboard") },
  ];
  const discoverActive = under("/books", "/categories", "/tags", "/comics", "/publications", "/compare");

  const themeChoices = (
    <div className="grid grid-cols-4 gap-1.5">
      {themes.map((th) => (
        <button key={th.id} onClick={() => setCookie("theme", th.id)} aria-pressed={th.id === theme}
          className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium transition-colors ${th.id === theme ? "border-brand-600 text-brand-600" : "border-line hover:border-brand-600"}`}>
          <span className="h-5 w-5 rounded-full border border-black/15" style={{ background: th.swatch }} />
          {th.name}
        </button>
      ))}
      <button onClick={() => { setPrefsOpen(false); setDrawerOpen(false); setShowCustomTheme(true); }} aria-pressed={theme === "custom"}
        className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium transition-colors ${theme === "custom" ? "border-brand-600 text-brand-600" : "border-line hover:border-brand-600"}`}>
        <Icon name="palette" size={20} />
        {tr("customThemeLabel")}
      </button>
    </div>
  );

  return (
    <header className="border-line bg-surface/90 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4">
        {/* The wordmark is hidden on a phone and LogoMark is aria-hidden, so
            the link needs its own accessible name. */}
        <Link href={withLang("/")} prefetch={false} aria-label="BookQubit — home" className="flex min-h-11 shrink-0 items-center gap-2">
          <LogoMark size={34} />
          <span className="font-display hidden text-[1.35rem] font-semibold tracking-tight sm:inline">
            Book<span className="text-brand-600">Qubit</span>
          </span>
        </Link>

        <nav aria-label={tr("navPrimaryLabel")} className="ml-1 hidden items-center lg:flex">
          <button ref={discoverBtn} type="button" className="nav-link"
            aria-expanded={discoverOpen} aria-controls="discover-panel"
            aria-current={discoverActive ? "page" : undefined}
            onClick={() => setDiscoverOpen((o) => !o)}>
            {tr("navDiscover")}
            <Icon name="chevronDown" size={13} className={`opacity-60 transition-transform ${discoverOpen ? "rotate-180" : ""}`} />
          </button>
          {PRIMARY.map((p) => (
            <Link key={p.href} href={withLang(p.href)} prefetch={false} className="nav-link"
              aria-current={p.active ? "page" : undefined}>
              {p.label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-xl">
            <SearchBar lang={lang} placeholder={labels.search} big />
          </div>
        </div>

        <Link href={withLang("/account")} prefetch={false} className="nav-link max-lg:!hidden"
          aria-current={under("/account", "/liked") ? "page" : undefined}>
          <Icon name="bookmark" size={16} /> {tr("navLibrary")}
        </Link>

        {user && (
          <Link href={withLang("/notifications")} prefetch={false} className={`${iconBtn} hidden sm:grid`}
            aria-label={notifCount > 0 ? `${labels.notifications} (${notifCount})` : labels.notifications} title={labels.notifications}>
            <Icon name="bell" size={18} />
            {notifCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold"
                style={{ background: "var(--color-marker)", color: "var(--color-marker-ink)" }}>
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </Link>
        )}

        {/* Language and theme, together: both are "how the site looks to me". */}
        <div ref={prefsBox} className="relative hidden sm:block">
          <button ref={prefsBtn} type="button" onClick={() => setPrefsOpen((o) => !o)}
            aria-expanded={prefsOpen} aria-haspopup="dialog" aria-label={tr("navPreferences")} title={tr("navPreferences")}
            className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors hover:bg-brand-50 hover:text-brand-600">
            <Icon name="globe" size={17} /> <span className="uppercase">{currentLang.code}</span>
          </button>
          {prefsOpen && (
            <div role="dialog" aria-label={tr("navPreferences")} className="popover absolute right-0 top-full z-50 mt-2 w-80 p-3">
              <p className="text-muted px-1 pb-2 text-xs font-semibold">{labels.language}</p>
              <div className="grid max-h-56 grid-cols-2 gap-0.5 overflow-auto">
                {languages.map((l) => (
                  <button key={l.code} onClick={() => switchLang(l.code)} lang={l.code}
                    aria-current={l.code === lang ? "page" : undefined} className="menu-item !min-h-9 !gap-2 !px-2">
                    <span className="truncate">{l.name}</span>
                    {l.code === lang && <Icon name="check" size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
              <p className="text-muted border-line mt-3 border-t px-1 pb-2 pt-3 text-xs font-semibold">{labels.theme}</p>
              {themeChoices}
            </div>
          )}
        </div>

        <div className="hidden shrink-0 sm:block">
          <AuthButton labels={labels} notifCount={notifCount} />
        </div>

        <button ref={drawerBtn} type="button" onClick={() => setDrawerOpen((o) => !o)} className={`${iconBtn} lg:hidden`}
          aria-label={drawerOpen ? tr("navCloseMenu") : labels.menu} aria-expanded={drawerOpen} aria-controls="site-menu">
          <Icon name={drawerOpen ? "x" : "menu"} size={20} />
        </button>
      </div>

      {/* Discover: the whole catalog in one panel */}
      {discoverOpen && (
        <div id="discover-panel" ref={discoverPanel} className="absolute inset-x-0 top-full hidden px-4 lg:block">
          <div className="popover mx-auto max-w-7xl !rounded-t-none border-t-0 p-6">
            {myGenres.length > 0 && (
              <div className="border-line mb-5 flex flex-wrap items-center gap-2 border-b pb-5">
                <span className="text-muted mr-1 text-xs font-semibold">{tr("navYourGenres")}</span>
                {myGenres.map((g) => (
                  <Link key={g} href={withLang(`/books?category=${encodeURIComponent(g)}`)} prefetch={false} className="pill">{g}</Link>
                ))}
              </div>
            )}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-x-6 gap-y-4">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="text-muted px-3 pb-1 text-xs font-semibold">{g.title}</p>
                  <ul>
                    {g.links.map((l) => (
                      <li key={l.label}>
                        <Link href={withLang(l.href)} prefetch={false} className="menu-item">
                          {l.icon && <Icon name={l.icon} size={15} className="text-muted" />}
                          <span className="truncate">{l.label}</span>
                        </Link>
                      </li>
                    ))}
                    {g.all && (
                      <li>
                        <Link href={withLang(g.all.href)} prefetch={false} className="menu-item font-semibold text-brand-600">
                          {g.all.label}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-line mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-muted text-sm">{tr("navSurpriseHint")}</p>
              <button type="button" onClick={surpriseMe} disabled={surprising} className="btn-ghost !min-h-10 !py-2 text-sm disabled:opacity-50">
                <Icon name="zap" size={15} /> {labels.surpriseMe}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone and tablet: a full-height sheet with the same structure */}
      {drawerOpen && (
        <div className="absolute inset-x-0 top-full z-50 h-[calc(100dvh-3.5rem)] bg-black/40 sm:h-[calc(100dvh-4rem)] lg:hidden">
          <div id="site-menu" ref={drawerPanel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={labels.menu}
            className="bg-surface ml-auto flex h-full outline-none w-full max-w-sm flex-col overflow-y-auto overscroll-contain pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="px-2 pt-3">
              {!user && firebaseEnabled && (
                <Link href={withLang("/login")} prefetch={false} className="btn-primary mx-2 mb-2 mt-1 flex">{labels.signIn}</Link>
              )}
              <Link href={withLang("/account")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/account") ? "page" : undefined}>
                <Icon name="bookmark" size={17} className="text-muted" /> {tr("navLibrary")}
              </Link>
              {PRIMARY.map((p) => (
                <Link key={p.href} href={withLang(p.href)} prefetch={false} className="menu-item !min-h-11" aria-current={p.active ? "page" : undefined}>
                  <Icon name={p.href === "/authors" ? "feather" : p.href === "/collections" ? "layers" : "users"} size={17} className="text-muted" /> {p.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link href={withLang("/notifications")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/notifications") ? "page" : undefined}>
                    <Icon name="bell" size={17} className="text-muted" /> {labels.notifications}
                    {notifCount > 0 && <span className="tab-count ml-auto">{notifCount > 9 ? "9+" : notifCount}</span>}
                  </Link>
                  <Link href={withLang("/liked")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/liked") ? "page" : undefined}>
                    <Icon name="heart" size={17} className="text-muted" /> {labels.likedBooks}
                  </Link>
                </>
              )}
              <Link href={withLang("/leaderboard")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/leaderboard") ? "page" : undefined}>
                <Icon name="trophy" size={17} className="text-muted" /> {tr("navBookwormRanking")}
              </Link>
              <button type="button" onClick={() => { setDrawerOpen(false); surpriseMe(); }} disabled={surprising} className="menu-item !min-h-11">
                <Icon name="zap" size={17} className="text-muted" /> {labels.surpriseMe}
              </button>
            </div>

            <div className="border-line mt-2 border-t px-2 pt-2">
              {GROUPS.map((g, i) => (
                <details key={g.title} open={i === 0} className="group">
                  <summary className="menu-item !min-h-11 cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
                    {g.title}
                    <Icon name="chevronDown" size={15} className="text-muted ml-auto transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="pb-2 pl-3">
                    {g.links.map((l) => (
                      <li key={l.label}>
                        <Link href={withLang(l.href)} prefetch={false} className="menu-item !min-h-11">{l.label}</Link>
                      </li>
                    ))}
                    {g.all && (
                      <li><Link href={withLang(g.all.href)} prefetch={false} className="menu-item !min-h-11 font-semibold text-brand-600">{g.all.label}</Link></li>
                    )}
                  </ul>
                </details>
              ))}
            </div>

            <div className="border-line mt-2 border-t px-4 pt-4">
              <label htmlFor="drawer-lang" className="text-muted text-xs font-semibold">{labels.language}</label>
              <select id="drawer-lang" value={lang} onChange={(e) => switchLang(e.target.value)} className="input mt-1.5 !py-2 text-sm">
                {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
              <p className="text-muted mt-4 pb-2 text-xs font-semibold">{labels.theme}</p>
              {themeChoices}
              <div className="text-muted mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link href={withLang("/about")} prefetch={false} className="inline-flex min-h-11 items-center hover:text-brand-600">{tr("aboutWord")}</Link>
                <Link href={withLang("/contact")} prefetch={false} className="inline-flex min-h-11 items-center hover:text-brand-600">{tr("footerContact")}</Link>
                {user && (
                  <button type="button" onClick={async () => { await getFirebaseAuth().signOut(); setDrawerOpen(false); }}
                    className="inline-flex min-h-11 items-center hover:text-brand-600">{labels.signOut}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomTheme && <CustomThemeModal onClose={() => setShowCustomTheme(false)} />}
    </header>
  );
}
