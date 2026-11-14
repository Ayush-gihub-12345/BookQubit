"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import CommandPalette from "./search/CommandPalette";
import Icon from "./Icon";
import { LogoMark, Wordmark } from "./Logo";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import CustomThemeModal from "./CustomThemeModal";
import { t } from "@/lib/i18n";
import { SurpriseLink } from "./surprise/SurpriseMe";

// BookQubit UI v2 header: a 64px glass bar with a Discover menu (built from real catalog counts, so no link
// can lead to an empty page), a Community menu, search, Surprise me, Library, notifications, one
// Theme/Language popover, and the account button. Every panel opens on click, closes on Escape, outside
// click or navigation, and reports its state with aria-expanded.

// Outside-click and Escape handling for a button + panel pair. `refs` are the elements that count as "inside".
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

// A menu link: optional icon tile (the design's signature detail), label, optional NEW badge and hint.
function MenuLink({ href, label, icon, desc, badge, onClick }) {
  return (
    <Link href={href} prefetch={false} className="menu-item group" onClick={onClick}>
      {icon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-brand-700 transition-colors group-hover:bg-brand-400 group-hover:text-[var(--on-brand)]">
          <Icon name={icon} size={17} />
        </span>
      )}
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-semibold">{label}{badge && <span className="badge badge-marker !h-5 !text-[10px]">{badge}</span>}</span>
        {desc && <span className="text-muted block truncate text-xs">{desc}</span>}
      </span>
    </Link>
  );
}

export default function Navbar({ lang, theme, languages, themes, labels, genres = [], countries = [], collections = [] }) {
  const tr = t(lang);
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myGenres, setMyGenres] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsTab, setPrefsTab] = useState("theme");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const discoverBox = useRef(null);
  const discoverPanel = useRef(null);
  const discoverBtn = useRef(null);
  const communityBox = useRef(null);
  const communityBtn = useRef(null);
  const prefsBox = useRef(null);
  const prefsBtn = useRef(null);
  const drawerPanel = useRef(null);
  const drawerBtn = useRef(null);

  useDismiss(discoverOpen, () => setDiscoverOpen(false), [discoverBox, discoverPanel], discoverBtn);
  useDismiss(communityOpen, () => setCommunityOpen(false), [communityBox], communityBtn);
  useDismiss(prefsOpen, () => setPrefsOpen(false), [prefsBox], prefsBtn);
  useDismiss(drawerOpen, () => setDrawerOpen(false), [drawerPanel, drawerBtn], drawerBtn);

  // Any navigation closes whatever was open, so a panel never lingers over the page it just led to.
  useEffect(() => {
    setDiscoverOpen(false); setCommunityOpen(false); setPrefsOpen(false); setDrawerOpen(false);
  }, [pathname]);

  // The mobile sheet covers the page: stop the page behind it scrolling and move focus into the sheet.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerPanel.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // Ctrl/Cmd+K opens search from anywhere; "/" does too unless the reader is typing in a field.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); return; }
      const el = document.activeElement;
      const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); setPaletteOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Signed-in extras: the reader's own genres and the unread notification count.
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

  // Theme is a cookie read on the server (no flash). "Match device" is applied right away too, because the
  // server renders light and only the inline script in <head> would otherwise fix it on the next load.
  const setTheme = (id) => {
    document.cookie = `theme=${id};path=/;max-age=31536000`;
    if (id === "system") document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    router.refresh();
  };
  // Language is a URL segment (see middleware.js): same path with that segment swapped. A full navigation,
  // not router.push, so every already-mounted client component re-renders in the new language too.
  const switchLang = (code) => {
    const parts = pathname.split("/");
    parts[1] = code;
    window.location.href = parts.join("/") || `/${code}`;
  };

  const currentLang = languages.find((l) => l.code === lang) || languages[0];
  const withLang = (href) => `/${lang}${href === "/" ? "" : href}`;
  // pathname carries the language prefix ("/hi/compare"); strip it before comparing against unprefixed paths.
  const relPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const under = (...roots) => roots.some((r) => relPath === r || relPath.startsWith(`${r}/`));

  // Category, country and collection NAMES are catalog data (shown as stored); group titles and the fixed
  // entries are translated. The three lists come from the catalog's own facet counts, so an empty group is dropped.
  const GROUPS = [
    {
      title: tr("navStartHere"),
      links: [
        { label: tr("allBooksMenu"), href: "/books", icon: "book" },
        { label: tr("newReleases"), href: "/books?sort=new", icon: "sparkles", badge: "NEW" },
        { label: tr("topRated"), href: "/books?sort=rating", icon: "star" },
        { label: labels.comics, href: "/comics", icon: "layers" },
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

  // Community: where the social and knowledge features live. Labels without a translation key fall back to English.
  const COMMUNITY = [
    {
      title: "Read together",
      links: [
        { label: "Feed", href: "/feed", icon: "newspaper", desc: "Books, quotes and summaries" },
        { label: tr("communityTitle"), href: "/community", icon: "users", desc: "Threads and book clubs" },
        { label: "Connect", href: "/connect", icon: "heart", desc: "Find readers like you" },
      ],
    },
    {
      title: "Grow",
      links: [
        { label: tr("navBookwormRanking"), href: "/leaderboard", icon: "trophy", desc: "Climb the leaderboard" },
        { label: "MindSpace", href: "/mindspace", icon: "layers", desc: "Notes, quotes and ideas" },
        { label: tr("navLibrary"), href: "/library", icon: "bookmark", desc: "Shelves, stats and goals" },
      ],
    },
  ];

  const PRIMARY = [
    { label: labels.authors, href: "/authors", active: under("/authors") },
    { label: labels.collections, href: "/collections", active: under("/collections") },
  ];
  const discoverActive = under("/books", "/categories", "/tags", "/comics", "/publications", "/compare");
  const communityActive = under("/community", "/readers", "/leaderboard", "/feed", "/connect", "/mindspace");

  const themeSwatches = (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((th) => (
        <button key={th.id} type="button" onClick={() => setTheme(th.id)} aria-pressed={th.id === theme}
          className={`group rounded-[var(--radius-md)] border p-2 text-left transition ${th.id === theme ? "border-[var(--ring)] ring-2 ring-[var(--ring)]/30" : "border-[var(--line)] hover:border-[var(--line-strong)]"}`}>
          <span className="mb-2 flex h-12 overflow-hidden rounded-lg border border-black/5" style={{ background: th.bg || th.swatch }}>
            <span className="m-1.5 flex flex-1 flex-col justify-end gap-1 rounded-md p-1.5" style={{ background: th.id === "system" ? "transparent" : th.surface }}>
              <i className="block h-1.5 w-3/4 rounded-full" style={{ background: th.dark ? "#ffffff55" : "#00000033" }} />
              <i className="block h-2 w-1/3 rounded-full" style={{ background: th.brand }} />
            </span>
          </span>
          <span className="flex items-center justify-between text-sm font-semibold">{th.name}{th.id === theme && <Icon name="check" size={15} className="text-brand-700" />}</span>
        </button>
      ))}
      <button type="button" onClick={() => { setPrefsOpen(false); setDrawerOpen(false); setShowCustomTheme(true); }} aria-pressed={theme === "custom"}
        className={`rounded-[var(--radius-md)] border p-2 text-left transition ${theme === "custom" ? "border-[var(--ring)] ring-2 ring-[var(--ring)]/30" : "border-[var(--line)] hover:border-[var(--line-strong)]"}`}>
        <span className="mb-2 grid h-12 place-items-center rounded-lg border border-dashed border-[var(--line-strong)] text-brand-700"><Icon name="palette" size={20} /></span>
        <span className="text-sm font-semibold">{tr("customThemeLabel")}</span>
      </button>
    </div>
  );

  return (
    <header className="glass sticky top-0 z-50 border-b border-[var(--line)]">
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <button ref={drawerBtn} type="button" onClick={() => setDrawerOpen((o) => !o)} className="btn-icon lg:hidden"
          aria-label={drawerOpen ? tr("navCloseMenu") : labels.menu} aria-expanded={drawerOpen} aria-controls="site-menu">
          <Icon name={drawerOpen ? "x" : "menu"} size={20} />
        </button>

        {/* The wordmark is hidden on a phone and the mark is aria-hidden, so the link needs its own accessible name. */}
        <Link href={withLang("/")} prefetch={false} aria-label="BookQubit — home" className="flex min-h-11 shrink-0 items-center gap-2">
          <LogoMark size={34} />
          <Wordmark className="hidden sm:inline" />
        </Link>

        <nav aria-label={tr("navPrimaryLabel")} className="ml-2 hidden items-center gap-0.5 lg:flex">
          <div ref={discoverBox} className="relative">
            <button ref={discoverBtn} type="button" className="nav-link" aria-expanded={discoverOpen} aria-haspopup="true"
              aria-controls="discover-panel" aria-current={discoverActive ? "page" : undefined}
              onClick={() => { setDiscoverOpen((o) => !o); setCommunityOpen(false); }}>
              {tr("navDiscover")}
              <Icon name="chevronDown" size={15} className={`opacity-60 transition-transform ${discoverOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          <div ref={communityBox} className="relative">
            <button ref={communityBtn} type="button" className="nav-link" aria-expanded={communityOpen} aria-haspopup="true"
              aria-controls="community-panel" aria-current={communityActive ? "page" : undefined}
              onClick={() => { setCommunityOpen((o) => !o); setDiscoverOpen(false); }}>
              {tr("navCommunity")}
              <Icon name="chevronDown" size={15} className={`opacity-60 transition-transform ${communityOpen ? "rotate-180" : ""}`} />
            </button>
            {communityOpen && (
              <div id="community-panel" className="absolute left-0 top-full pt-2">
                <div className="panel animate-pop grid w-[min(520px,calc(100vw-2rem))] gap-6 p-5 sm:grid-cols-2">
                  {COMMUNITY.map((g) => (
                    <div key={g.title}>
                      <p className="eyebrow mb-2 !text-[var(--muted)]">{g.title}</p>
                      <ul className="space-y-0.5">{g.links.map((l) => <li key={l.href}><MenuLink {...l} href={withLang(l.href)} /></li>)}</ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {PRIMARY.map((p) => (
            <Link key={p.href} href={withLang(p.href)} prefetch={false} className="nav-link" aria-current={p.active ? "page" : undefined}>{p.label}</Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-xl">
            <button type="button" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog" aria-keyshortcuts="Control+K"
              className="input flex !min-h-[42px] w-full items-center gap-3 !rounded-full !border-transparent !bg-[var(--surface-2)] !py-0 text-start text-[15px] text-[var(--muted)] hover:!bg-[var(--surface-3)]">
              <Icon name="search" size={18} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{labels.search}</span>
              <kbd className="kbd hidden sm:block">Ctrl K</kbd>
            </button>
          </div>
        </div>

        <SurpriseLink locale={lang} className="btn-icon hidden sm:inline-flex" aria-label={labels.surpriseMe} title={labels.surpriseMe}>
          <Icon name="dice" size={19} />
        </SurpriseLink>

        <Link href={withLang("/library")} prefetch={false} className="nav-link max-xl:!hidden"
          aria-current={under("/library", "/account", "/liked") ? "page" : undefined}>
          <Icon name="bookmark" size={16} /> {tr("navLibrary")}
        </Link>

        {user && (
          <Link href={withLang("/notifications")} prefetch={false} className="btn-icon hidden sm:inline-flex"
            aria-label={notifCount > 0 ? `${labels.notifications} (${notifCount})` : labels.notifications} title={labels.notifications}>
            <Icon name="bell" size={18} />
            {notifCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-extrabold"
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
            className="btn-icon !w-auto gap-1.5 px-3">
            <Icon name="globe" size={18} />
            <span className="text-xs font-bold uppercase">{currentLang.code}</span>
            <span aria-hidden className="ml-0.5 h-3.5 w-3.5 rounded-full border border-[var(--line-strong)]" style={{ background: "var(--color-brand-500)" }} />
          </button>
          {prefsOpen && (
            <div role="dialog" aria-label={tr("navPreferences")} className="panel animate-pop absolute right-0 top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-1.5rem))] overflow-hidden">
              <div role="tablist" className="flex border-b border-[var(--line)] p-1.5">
                {[["theme", labels.theme, "palette"], ["lang", `${labels.language} · ${currentLang.name}`, "globe"]].map(([id, text, icon]) => (
                  <button key={id} type="button" role="tab" aria-selected={prefsTab === id} onClick={() => setPrefsTab(id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] py-2 text-sm font-semibold ${prefsTab === id ? "bg-[var(--surface-2)] text-[var(--fg)]" : "text-[var(--muted)]"}`}>
                    <Icon name={icon} size={16} /><span className="truncate">{text}</span>
                  </button>
                ))}
              </div>
              {prefsTab === "theme" ? (
                <div className="p-3">{themeSwatches}</div>
              ) : (
                <ul className="grid max-h-[340px] grid-cols-2 gap-0.5 overflow-y-auto p-2">
                  {languages.map((l) => (
                    <li key={l.code}>
                      <button type="button" onClick={() => switchLang(l.code)} lang={l.code} data-active={l.code === lang} className="menu-item">
                        <span className="font-semibold">{l.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="hidden shrink-0 sm:block">
          <AuthButton labels={labels} notifCount={notifCount} />
        </div>
      </div>

      {/* Discover: the whole catalog in one panel */}
      {discoverOpen && (
        <div id="discover-panel" className="absolute inset-x-0 top-full hidden px-4 lg:block">
          <div ref={discoverPanel} className="panel animate-pop mx-auto max-w-[88rem] !rounded-t-none border-t-0 p-6">
            {myGenres.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-5">
                <span className="text-muted mr-1 text-xs font-semibold">{tr("navYourGenres")}</span>
                {myGenres.map((g) => (
                  <Link key={g} href={withLang(`/books?category=${encodeURIComponent(g)}`)} prefetch={false} className="pill">{g}</Link>
                ))}
              </div>
            )}
            <div className="grid gap-x-6 gap-y-4 lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))_240px]">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow mb-2 !text-[var(--muted)]">{g.title}</p>
                  <ul className="space-y-0.5">
                    {g.links.map((l) => (
                      <li key={l.label}>
                        {l.icon
                          ? <MenuLink href={withLang(l.href)} label={l.label} icon={l.icon} badge={l.badge} />
                          : <Link href={withLang(l.href)} prefetch={false} className="menu-item"><span className="truncate">{l.label}</span></Link>}
                      </li>
                    ))}
                    {g.all && (
                      <li><Link href={withLang(g.all.href)} prefetch={false} className="menu-item font-semibold text-brand-700">{g.all.label}</Link></li>
                    )}
                  </ul>
                </div>
              ))}
              <SurpriseLink locale={lang} onNavigate={() => setDiscoverOpen(false)} className="hero-glow flex flex-col justify-end gap-2 rounded-[var(--radius-md)] border border-[var(--line)] p-4">
                <Icon name="dice" size={22} className="text-brand-700" />
                <b className="font-display text-lg leading-tight">{tr("navSurpriseHint")}</b>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{labels.surpriseMe}<Icon name="arrowRight" size={15} /></span>
              </SurpriseLink>
            </div>
          </div>
        </div>
      )}

      {/* Phone and tablet: a full-height sheet with the same structure */}
      {drawerOpen && (
        <div className="absolute inset-x-0 top-full z-50 h-[calc(100dvh-4rem)] bg-black/50 backdrop-blur-sm lg:hidden">
          <div id="site-menu" ref={drawerPanel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={labels.menu}
            className="animate-pop flex h-full w-full max-w-sm flex-col overflow-y-auto overscroll-contain bg-[var(--surface)] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl outline-none">
            <div className="px-3 pt-3">
              <SurpriseLink locale={lang} onNavigate={() => setDrawerOpen(false)} className="btn-primary mb-3 w-full"><Icon name="dice" size={18} />{labels.surpriseMe}</SurpriseLink>
              {!user && firebaseEnabled && (
                <Link href={withLang("/login")} prefetch={false} className="btn-ghost mb-2 w-full">{labels.signIn}</Link>
              )}
              <Link href={withLang("/library")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/library", "/account") ? "page" : undefined}>
                <Icon name="bookmark" size={17} className="text-brand-700" /> {tr("navLibrary")}
              </Link>
              {PRIMARY.map((p) => (
                <Link key={p.href} href={withLang(p.href)} prefetch={false} className="menu-item !min-h-11" aria-current={p.active ? "page" : undefined}>
                  <Icon name={p.href === "/authors" ? "feather" : "layers"} size={17} className="text-brand-700" /> {p.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link href={withLang("/notifications")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/notifications") ? "page" : undefined}>
                    <Icon name="bell" size={17} className="text-brand-700" /> {labels.notifications}
                    {notifCount > 0 && <span className="tab-count ml-auto">{notifCount > 9 ? "9+" : notifCount}</span>}
                  </Link>
                  <Link href={withLang("/liked")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/liked") ? "page" : undefined}>
                    <Icon name="heart" size={17} className="text-brand-700" /> {labels.likedBooks}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-2 border-t border-[var(--line)] px-3 pt-2">
              {[...COMMUNITY, ...GROUPS].map((g, i) => (
                <details key={g.title} open={i === 0} className="group">
                  <summary className="menu-item !min-h-11 cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
                    {g.title}
                    <Icon name="chevronDown" size={15} className="text-muted ml-auto transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="pb-2 pl-3">
                    {g.links.map((l) => (
                      <li key={l.label}><Link href={withLang(l.href)} prefetch={false} className="menu-item !min-h-11">{l.label}</Link></li>
                    ))}
                    {g.all && (
                      <li><Link href={withLang(g.all.href)} prefetch={false} className="menu-item !min-h-11 font-semibold text-brand-700">{g.all.label}</Link></li>
                    )}
                  </ul>
                </details>
              ))}
            </div>

            <div className="mt-2 border-t border-[var(--line)] px-4 pt-4">
              <label htmlFor="drawer-lang" className="text-muted text-xs font-semibold">{labels.language}</label>
              <select id="drawer-lang" value={lang} onChange={(e) => switchLang(e.target.value)} className="input mt-1.5 !py-2 text-sm">
                {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
              <p className="text-muted mt-4 pb-2 text-xs font-semibold">{labels.theme}</p>
              {themeSwatches}
              <div className="text-muted mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link href={withLang("/about")} prefetch={false} className="inline-flex min-h-11 items-center hover:text-brand-700">{tr("aboutWord")}</Link>
                <Link href={withLang("/contact")} prefetch={false} className="inline-flex min-h-11 items-center hover:text-brand-700">{tr("footerContact")}</Link>
                {user && (
                  <button type="button" onClick={async () => { await getFirebaseAuth().signOut(); setDrawerOpen(false); }}
                    className="inline-flex min-h-11 items-center hover:text-brand-700">{labels.signOut}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CommandPalette lang={lang} open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {showCustomTheme && <CustomThemeModal onClose={() => setShowCustomTheme(false)} />}
    </header>
  );
}
