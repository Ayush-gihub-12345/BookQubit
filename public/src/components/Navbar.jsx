"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import CommandPalette from "./search/CommandPalette";
import MobileChips from "./MobileChips";
import Icon from "./Icon";
import { LogoMark, Wordmark } from "./Logo";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import CustomThemeModal from "./CustomThemeModal";
import { t } from "@/lib/i18n";
import { SurpriseLink } from "./surprise/SurpriseMe";
import { countryFlag } from "@/lib/countryFlag";

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

// One mega-menu panel: link groups in columns, plus an optional feature card (Surprise me / collections / ranking).
function MegaPanel({ menu, withLang, lang, labels, tr, onClose }) {
  const cols = menu.groups.length + (menu.feature ? 1 : 0);
  const width = cols >= 4 ? "w-[min(1040px,calc(100vw-2rem))]" : cols === 3 ? "w-[min(800px,calc(100vw-2rem))]" : "w-[min(600px,calc(100vw-2rem))]";
  return (
    <div id={`${menu.key}-panel`} className="absolute left-0 top-full pt-2">
      <div className={`panel animate-pop grid gap-x-6 gap-y-4 p-5 ${width}`}
        style={{ gridTemplateColumns: `repeat(${menu.groups.length}, minmax(0,1fr))${menu.feature ? " 220px" : ""}` }}>
        {menu.groups.map((g) => (
          <div key={g.title} className="min-w-0">
            <p className="eyebrow mb-2 px-2 !text-[var(--muted)]">{g.title}</p>
            <ul className="space-y-0.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  {l.icon
                    ? <MenuLink href={withLang(l.href)} label={l.label} icon={l.icon} badge={l.badge} desc={l.desc} onClick={onClose} />
                    : <Link href={withLang(l.href)} prefetch={false} className="menu-item !py-2" onClick={onClose}>{l.flag && <span aria-hidden className="w-5 shrink-0 text-center">{l.flag}</span>}<span className="truncate">{l.label}</span></Link>}
                </li>
              ))}
              {g.all && <li><Link href={withLang(g.all.href)} prefetch={false} className="menu-item font-semibold text-brand-700" onClick={onClose}>{g.all.label}</Link></li>}
            </ul>
          </div>
        ))}
        {menu.feature === "surprise" && (
          <SurpriseLink locale={lang} onNavigate={onClose} className="hero-glow flex flex-col justify-end gap-2 rounded-[var(--radius-md)] border border-[var(--line)] p-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-400 text-[var(--on-brand)]"><Icon name="dice" size={22} /></span>
            <b className="font-display text-lg leading-tight">{tr("navSurpriseHint")}</b>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{labels.surpriseMe}<Icon name="arrowRight" size={15} /></span>
          </SurpriseLink>
        )}
        {menu.feature === "collection" && (
          <Link href={withLang("/collections")} prefetch={false} onClick={onClose} className="hero-glow flex flex-col justify-end gap-2 rounded-[var(--radius-md)] border border-[var(--line)] p-4">
            <Icon name="layers" size={24} className="text-brand-700" /><b className="font-display text-lg leading-tight">Curated by editors and readers</b>
            <span className="text-muted text-sm">Themed shelves worth working through.</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{tr("allCollectionsMenu")}<Icon name="arrowRight" size={15} /></span>
          </Link>
        )}
        {menu.feature === "ranking" && (
          <Link href={withLang("/leaderboard")} prefetch={false} onClick={onClose} className="hero-glow flex flex-col justify-end gap-2 rounded-[var(--radius-md)] border border-[var(--line)] p-4">
            <Icon name="trophy" size={24} className="text-brand-700" /><b className="font-display text-lg leading-tight">{tr("navBookwormRanking")}</b>
            <span className="text-muted text-sm">Earn points for reading, reviewing and helping others.</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">See the board<Icon name="arrowRight" size={15} /></span>
          </Link>
        )}
      </div>
    </div>
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

  const [open, setOpen] = useState(null); // which mega menu is open: discover | browse | collections | community
  const hoverT = useRef(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsTab, setPrefsTab] = useState("theme");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navBox = useRef(null);
  // Phones: the header and the chip row leave together when scrolling down and return as soon as you scroll up (like YouTube).
  const [hideBar, setHideBar] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const d = y - last;
      if (y < 80) setHideBar(false);
      else if (d > 8) setHideBar(true);
      else if (d < -8) setHideBar(false);
      if (Math.abs(d) > 8) last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const prefsBox = useRef(null);
  const prefsBtn = useRef(null);
  const drawerPanel = useRef(null);
  const drawerBtn = useRef(null);

  useDismiss(!!open, () => setOpen(null), [navBox]);
  useDismiss(prefsOpen, () => setPrefsOpen(false), [prefsBox], prefsBtn);
  useEffect(() => {
    const open = () => setDrawerOpen(true);
    window.addEventListener("bq:open-menu", open);
    return () => window.removeEventListener("bq:open-menu", open);
  }, []);
  useDismiss(drawerOpen, () => setDrawerOpen(false), [drawerPanel, drawerBtn], drawerBtn);

  // Any navigation closes whatever was open, so a panel never lingers over the page it just led to.
  useEffect(() => {
    setOpen(null); setPrefsOpen(false); setDrawerOpen(false);
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
        { label: "Bestsellers", href: "/books?shelf=bestsellers", icon: "trophy" },
        { label: "Classics", href: "/books?shelf=classics", icon: "feather" },
        { label: labels.comics, href: "/comics", icon: "layers" },
        { label: "Listen", href: "/listen", icon: "headphones", badge: "NEW" },
        { label: "Feed", href: "/feed", icon: "flame" },
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
      links: countries.map((c) => ({ label: c.name, href: `/books?country=${encodeURIComponent(c.name)}`, flag: countryFlag(c.name) })),
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
        { label: "Feed", href: "/feed", icon: "flame", desc: "Books, quotes and summaries" },
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
  // Four mega menus (UI v3): each group is built from real catalog data or fixed routes, and an empty group is dropped,
  // so no link can lead to an empty page.
  const MEGA = [
    {
      key: "discover", label: tr("navDiscover"), feature: "surprise", active: under("/listen", "/compare"),
      groups: [
        { title: tr("navStartHere"), links: [
          { label: tr("allBooksMenu"), href: "/books", icon: "book", desc: "The full library" },
          { label: tr("newReleases"), href: "/books?sort=new", icon: "sparkles", badge: "NEW", desc: "Fresh in the catalog" },
          { label: tr("topRated"), href: "/books?sort=rating", icon: "star", desc: "Highest rated first" },
          { label: "Bestsellers", href: "/books?shelf=bestsellers", icon: "trophy", desc: "What most people buy" },
          { label: "Classics", href: "/books?shelf=classics", icon: "feather", desc: "Published before 1980" },
        ] },
        { title: "Ways to discover", links: [
          { label: "Listen", href: "/listen", icon: "headphones", badge: "NEW", desc: "Audio summaries and queues" },
          { label: "Feed", href: "/feed", icon: "flame", desc: "Books, quotes and summaries" },
          { label: labels.comics, href: "/comics", icon: "layers", desc: "Comics and manga" },
          { label: tr("compareWord"), href: "/compare", icon: "gitCompare", desc: "Side by side" },
          { label: tr("requestABookTitle"), href: "/request-a-book", icon: "bookmark", desc: "Tell us what is missing" },
        ] },
      ],
    },
    {
      key: "browse", label: "Browse", active: under("/books", "/categories", "/tags", "/publications"),
      groups: [
        { title: tr("navGenres"), links: genres.map((g) => ({ label: g.label, href: `/books?category=${encodeURIComponent(g.category)}` })), all: { label: tr("navAllGenres"), href: "/categories" } },
        { title: tr("booksByCountry"), links: countries.map((c) => ({ label: c.name, href: `/books?country=${encodeURIComponent(c.name)}`, flag: countryFlag(c.name) })) },
        { title: "Directory", links: [
          { label: labels.authors, href: "/authors", icon: "feather" },
          { label: labels.publishers, href: "/publications", icon: "building" },
          { label: labels.tags, href: "/tags", icon: "hash" },
        ] },
      ],
    },
    {
      key: "authors", label: labels.authors, active: under("/authors"),
      groups: [
        { title: "Explore authors", links: [
          { label: "All authors", href: "/authors", icon: "feather", desc: "Browse every author" },
          { label: "World map", href: "/authors/explore?view=map", icon: "globe", desc: "Where authors come from" },
          { label: "Across genres", href: "/authors/explore?view=genres", icon: "layers", desc: "Genre-benders and specialists" },
          { label: "Co-author network", href: "/authors/explore?view=network", icon: "users", desc: "Who writes together" },
          { label: "Born in…", href: "/authors/explore?view=eras", icon: "calendar", desc: "By decade or century" },
        ] },
        { title: "Comics people", links: [
          { label: "Characters", href: "/comics/people?view=characters", icon: "users", desc: "Every comic they appear in" },
          { label: "Creators", href: "/comics/people?view=creators", icon: "feather", desc: "Writers and artists" },
        ] },
      ],
    },
    {
      key: "collections", label: labels.collections, feature: "collection", active: under("/collections"),
      groups: [{ title: labels.collections, links: collections.map((c) => ({ label: c.name, href: `/collections/${encodeURIComponent(c.name)}` })), all: { label: tr("allCollectionsMenu"), href: "/collections" } }],
    },
    {
      key: "community", label: tr("navCommunity"), feature: "ranking", active: under("/community", "/readers", "/leaderboard", "/feed", "/connect", "/mindspace"),
      groups: COMMUNITY.map((g) => ({ ...g })),
    },
  ].map((m) => ({ ...m, groups: m.groups.filter((g) => g.links.length > 0 || g.all) })).filter((m) => m.groups.length > 0);
  const enter = (k) => { clearTimeout(hoverT.current); hoverT.current = setTimeout(() => setOpen(k), 90); };
  const leave = () => { clearTimeout(hoverT.current); hoverT.current = setTimeout(() => setOpen(null), 180); };

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
    <header className={`glass sticky top-0 z-50 border-b border-[var(--line)] max-lg:!bg-[var(--bg)] max-lg:![backdrop-filter:none] max-lg:border-b-0 max-lg:transition-transform max-lg:duration-300 ${hideBar && !drawerOpen && !paletteOpen ? "max-lg:-translate-y-full" : ""}`}>
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-2 px-3 sm:gap-3 sm:px-5">
        {/* The wordmark is hidden on a phone and the mark is aria-hidden, so the link needs its own accessible name. */}
        <Link href={withLang("/")} prefetch={false} aria-label="BookQubit — home" className="flex min-h-11 shrink-0 items-center gap-2">
          <LogoMark size={32} />
          <Wordmark className="!text-[1.05rem] lg:hidden xl:inline" />
        </Link>

        <nav ref={navBox} aria-label={tr("navPrimaryLabel")} className="ml-1 hidden items-center gap-0.5 lg:flex">
          {MEGA.map((m) => (
            <div key={m.key} className="relative" onMouseEnter={() => enter(m.key)} onMouseLeave={leave}>
              <button type="button" className="nav-link" aria-expanded={open === m.key} aria-haspopup="true" aria-controls={`${m.key}-panel`}
                aria-current={m.active ? "page" : undefined}
                onClick={() => { clearTimeout(hoverT.current); setOpen(open === m.key ? null : m.key); }}
                onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(m.key); } }}>
                {m.label}
                <Icon name="chevronDown" size={15} className={`opacity-60 transition-transform duration-200 ${open === m.key ? "rotate-180" : ""}`} />
              </button>
              {open === m.key && <MegaPanel menu={m} withLang={withLang} lang={lang} labels={labels} tr={tr} onClose={() => setOpen(null)} />}
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-xl max-sm:hidden">
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

        <Link href={withLang("/liked")} prefetch={false} className="btn-icon hidden md:inline-flex" aria-label={labels.likedBooks} title={labels.likedBooks}>
          <Icon name="heart" size={18} />
        </Link>

        <Link href={withLang("/notifications")} prefetch={false} className="btn-icon"
          aria-label={notifCount > 0 ? `${labels.notifications} (${notifCount})` : labels.notifications} title={labels.notifications}>
          <Icon name="bell" size={18} />
          {notifCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-extrabold ring-2 ring-[var(--bg)]"
              style={{ background: "var(--color-marker)", color: "var(--color-marker-ink)" }}>
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>

        <Link href={withLang("/library")} prefetch={false} className="nav-link hidden !px-2.5 md:inline-flex"
          aria-label={tr("navLibrary")} title={tr("navLibrary")} aria-current={under("/library", "/account", "/liked") ? "page" : undefined}>
          <Icon name="bookmark" size={17} /><span className="hidden xl:inline">{tr("navLibrary")}</span>
        </Link>

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

        <button type="button" onClick={() => setPaletteOpen(true)} className="btn-icon sm:hidden" aria-label={labels.search} aria-haspopup="dialog">
          <Icon name="search" size={20} />
        </button>

        <div className="shrink-0">
          <AuthButton labels={labels} notifCount={notifCount} />
        </div>
      </div>

      <MobileChips />

      {/* Phone and tablet: a full-height sheet with the same structure */}
      {drawerOpen && (
        <div className="absolute inset-x-0 top-16 z-50 h-[calc(100dvh-4rem)] bg-black/50 backdrop-blur-sm lg:hidden">
          <div id="site-menu" ref={drawerPanel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={labels.menu}
            className="animate-pop flex h-full w-full max-w-sm flex-col overflow-y-auto overscroll-contain bg-[var(--surface)] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl outline-none">
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="font-display text-lg font-semibold">{labels.menu}</span>
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn-icon" aria-label={tr("navCloseMenu")}><Icon name="x" size={20} /></button>
            </div>
            <div className="px-3 pt-2">
              <Link href={withLang("/liked")} prefetch={false} className="menu-item !min-h-11" aria-current={under("/liked") ? "page" : undefined}>
                <Icon name="heart" size={17} className="text-brand-700" /> {labels.likedBooks}
              </Link>
            </div>

            <div className="mt-2 border-t border-[var(--line)] px-3 pt-2">
              {MEGA.map((m, i) => (
                <details key={m.key} open={i === 0} className="group">
                  <summary className="menu-item !min-h-12 cursor-pointer list-none font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {m.label}
                    <Icon name="chevronDown" size={16} className="text-muted ml-auto transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-2 pl-1">
                    {m.groups.map((g) => (
                      <div key={g.title} className="mb-2">
                        <p className="eyebrow px-3 py-1 !text-[var(--muted)]">{g.title}</p>
                        <ul>
                          {g.links.map((l) => (
                            <li key={l.label}>
                              <Link href={withLang(l.href)} prefetch={false} className="menu-item !min-h-11">
                                {l.flag ? <span aria-hidden className="w-5 text-center">{l.flag}</span> : l.icon && <Icon name={l.icon} size={17} className="text-brand-700" />}
                                {l.label}{l.badge && <span className="badge badge-marker ml-1 !h-5 !text-[10px]">{l.badge}</span>}
                              </Link>
                            </li>
                          ))}
                          {g.all && <li><Link href={withLang(g.all.href)} prefetch={false} className="menu-item !min-h-11 font-semibold text-brand-700">{g.all.label}</Link></li>}
                        </ul>
                      </div>
                    ))}
                  </div>
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
