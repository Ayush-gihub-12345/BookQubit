"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "../AuthButton";
import SearchBar from "../SearchBar";
import Icon from "../Icon";
import { LogoMark } from "../Logo";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { useT } from "@/context/TranslationContext";
import NavDrawer from "../layout/NavDrawer";

function Dropdown({ button, children, width = "w-48" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      {button(() => setOpen(!open), open)}
      {open && (
        <div
          className={`bg-surface border-line absolute right-0 top-full z-50 mt-2 ${width} overflow-hidden rounded-2xl border shadow-2xl`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-base shadow-sm transition hover:scale-105 hover:border-brand-500 hover:shadow-md";

export default function Navbar({ lang, theme, languages, themes }) {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [myGenres, setMyGenres] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [surprising, setSurprising] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef(null);

  const surpriseMe = async () => {
    setSurprising(true);
    try {
      const r = await fetch(`/api/random-book?lang=${lang}`);
      const d = await r.json();
      if (d.slug) router.push(`/books/${encodeURIComponent(d.slug)}`);
    } finally {
      setSurprising(false);
    }
  };

  useEffect(() => {
    if (!firebaseEnabled) return;
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged((u) => {
      if (!u) {
        setMyGenres([]);
        setNotifCount(0);
        return;
      }
      fetch(`/api/preferences?uid=${u.uid}`)
        .then((r) => r.json())
        .then((d) => setMyGenres(d.genres || []))
        .catch(() => setMyGenres([]));
      fetch(`/api/notifications?uid=${u.uid}`)
        .then((r) => r.json())
        .then((d) => setNotifCount((d.notifications || []).length))
        .catch(() => setNotifCount(0));
    });
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (!headerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, []);

  const MENUS = [
    { href: "/feed", icon: "star", label: t("nav.forYou") },
    { href: "/", icon: "home", label: t("nav.home") },
    {
      href: "/books",
      icon: "compass",
      label: t("nav.discover"),
      items: [
        {
          href: "/books?sort=rating",
          icon: "trendingUp",
          label: t("discover.trending"),
        },
        {
          href: "/books?sort=new",
          icon: "clock",
          label: t("discover.newReleases"),
        },
        {
          href: "/books?sort=rating",
          icon: "star",
          label: t("discover.topRated"),
        },
        {
          href: "/collections",
          icon: "layers",
          label: t("discover.collections"),
        },
        ...myGenres.map((g) => ({
          href: `/books?category=${encodeURIComponent(g)}`,
          icon: "heart",
          label: g,
        })),
      ],
    },

    { href: "/authors", icon: "feather", label: t("nav.authors") },
    {
      href: "/publications",
      icon: "building",
      label: t("nav.publishers"),
      items: [
        {
          href: "/publications",
          icon: "building",
          label: t("publishers.allPublishers"),
        },
        {
          href: "/publications/penguin-random-house",
          icon: "book",
          label: "Penguin Random House",
        },
        {
          href: "/publications/harpercollins",
          icon: "book",
          label: "HarperCollins",
        },
      ],
    },
    { href: "/community", icon: "users", label: t("nav.community") },
    { href: "/leaderboard", icon: "trophy", label: t("nav.leaderboard") },
  ];

  const MEGA = [
    {
      title: t("mega.bestSellers"),
      links: [
        [t("discover.topRated"), "/books?sort=rating"],
        [t("mega.trendingNow"), "/books?sort=rating"],
        [t("discover.newReleases"), "/books?sort=new"],
        [t("browse.allBooks"), "/books"],
        [t("mega.editorsChoice"), "/books?sort=rating&rating=4.5"],
      ],
    },
    {
      title: t("mega.literatureTypes"),
      links: [
        [t("mega.philosophy"), "/books?category=Philosophy"],
        [t("mega.history"), "/books?category=History"],
        [t("mega.fiction"), "/books?category=Fiction"],
        [t("mega.psychology"), "/books?category=Psychology"],
        [t("mega.selfHelp"), "/books?category=Self-Help"],
        [t("mega.business"), "/books?category=Business"],
        [t("mega.finance"), "/books?category=Finance"],
      ],
    },
    {
      title: t("mega.booksByCountry"),
      links: [
        [t("mega.countryIndia"), "/books?country=India"],
        [t("mega.countryUSA"), "/books?country=USA"],
        [t("mega.countryUK"), "/books?country=UK"],
        [t("mega.countryIsrael"), "/books?country=Israel"],
        [t("mega.countryGermany"), "/books?country=Germany"],
        [t("mega.countryJapan"), "/books?country=Japan"],
        [t("mega.countryRussia"), "/books?country=Russia"],
      ],
    },
    {
      title: t("mega.specialCollections"),
      links: [
        [t("mega.harariCollection"), "/collections/Harari%20Collection"],
        [t("mega.stoicClassics"), "/collections/Stoic%20Classics"],
        [t("mega.dystopianClassics"), "/collections/Dystopian%20Classics"],
        [
          t("mega.revolutionaryClassics"),
          "/collections/Revolutionary%20Classics",
        ],
        [t("mega.allCollections"), "/collections"],
      ],
    },
    {
      title: t("mega.byFormat"),
      links: [
        [t("mega.paperback"), "/books?format=Paperback"],
        [t("mega.hardcover"), "/books?format=Hardcover"],
        [t("mega.ebook"), "/books?format=EBook"],
        [t("browse.comics"), "/comics"],
      ],
    },
  ];

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    if (name === "lang") {
      window.location.reload();
      return;
    }
    router.refresh();
  };
  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const currentLang = languages.find((l) => l.code === lang) || languages[0];
  const themeLabel = (id, fallback) => {
    const key = `themeNames.${id}`;
    const out = t(key);
    return out === key ? fallback : out;
  };

  return (
    <header
      ref={headerRef}
      className="border-line bg-surface/85 relative z-50 border-b shadow-sm backdrop-blur-xl lg:sticky lg:top-0"
    >
      <div className="h-0.5 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link
          href="/"
          prefetch={false}
          aria-label={t("a11y.brandHome")}
          className="flex shrink-0 items-center gap-2"
        >
          <LogoMark size={36} />
          <span className="hidden text-xl font-extrabold tracking-tight sm:inline">
            Book<span className="text-brand-600">Qubit</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 px-4 md:block">
          <div className="mx-auto max-w-xl">
            <SearchBar lang={lang} placeholder={t("nav.search")} big />
          </div>
        </div>
        <div className="flex-1 md:hidden" />

        <button
          onClick={surpriseMe}
          disabled={surprising}
          className={`${iconBtn} hidden sm:grid disabled:opacity-50`}
          aria-label={t("nav.surpriseMe")}
          title={t("nav.surpriseMe")}
        >
          <Icon name="zap" size={17} />
        </button>

        <Link
          href="/notifications"
          prefetch={false}
          className={`${iconBtn} relative hidden sm:grid`}
          aria-label={t("nav.notifications")}
          title={t("nav.notifications")}
        >
          <Icon name="bell" size={17} />
          {notifCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>

        <Link
          href="/liked"
          prefetch={false}
          className={`${iconBtn} hidden sm:grid`}
          aria-label={t("nav.likedBooks")}
          title={t("nav.likedBooks")}
        >
          <Icon name="heart" size={17} />
        </Link>

        <div className="hidden sm:block">
          <Dropdown
            width="w-44"
            button={(toggle) => (
              <button
                onClick={toggle}
                className={iconBtn}
                title={`${t("nav.theme")}: ${themeLabel(currentTheme.id, currentTheme.name)}`}
                aria-label={t("nav.theme")}
              >
                <Icon name="palette" size={17} />
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">
              {t("nav.theme")}
            </p>
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => setCookie("theme", th.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${th.id === theme ? "font-bold text-brand-600" : ""}`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{
                    background: {
                      light: "#fff",
                      dark: "#0b1220",
                      sepia: "#b07d2f",
                      midnight: "#7c3aed",
                      ocean: "#0891b2",
                      forest: "#059669",
                      rose: "#e11d48",
                    }[th.id],
                  }}
                />
                {themeLabel(th.id, th.name)}
                {th.id === theme && (
                  <Icon
                    name="check"
                    size={14}
                    className="ml-auto text-brand-600"
                  />
                )}
              </button>
            ))}
          </Dropdown>
        </div>

        <div className="hidden sm:block">
          <Dropdown
            width="w-48"
            button={(toggle) => (
              <button
                onClick={toggle}
                className="border-line bg-surface flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold shadow-sm transition hover:scale-105 hover:border-brand-500 hover:shadow-md"
                aria-label={t("nav.language")}
              >
                🌐 <span className="uppercase">{currentLang.code}</span>
                <span className="text-[9px] opacity-50">▼</span>
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">
              {t("nav.language")}
            </p>
            <div className="max-h-72 overflow-auto">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setCookie("lang", l.code)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${l.code === lang ? "font-bold text-brand-600" : ""}`}
                >
                  <span className="text-muted w-7 text-xs font-bold uppercase">
                    {l.code}
                  </span>{" "}
                  {l.name}
                  {l.code === lang && (
                    <span className="ml-auto text-brand-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="shrink-0 whitespace-nowrap">
          <AuthButton />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className={`${iconBtn} lg:hidden`}
          aria-label={t("nav.menu")}
        >
          ☰
        </button>
      </div>

      <div className="border-line border-t px-4 py-2 md:hidden">
        <SearchBar lang={lang} placeholder={t("nav.search")} big />
      </div>

      {/* ── Row 2 — laptop+ — flat nav + ☰ at left opens NavDrawer ── */}
      <div className="border-line relative hidden border-t lg:block">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-center px-2 xl:px-4">
          {/* Left hamburger — opens the drawer */}
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={t("nav.more")}
            aria-expanded={drawerOpen}
            className="border-line bg-surface hover:border-brand-500 mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full border shadow-sm transition hover:scale-105 hover:shadow-md"
          >
            <span className="text-sm leading-none">☰</span>
          </button>

          {MENUS.map((m) => {
            const active =
              m.href === "/"
                ? pathname === "/"
                : pathname.startsWith(m.href.split("?")[0]);
            return (
              <div key={m.label} className="group relative">
                <Link
                  href={m.href}
                  prefetch={false}
                  className={`relative flex items-center gap-1.5 px-2.5 py-3 text-sm font-medium transition hover:text-brand-600 xl:px-4 ${active ? "text-brand-600" : ""}`}
                >
                  <Icon name={m.icon} size={14} className="opacity-70" />{" "}
                  {m.label}
                  {m.items && (
                    <Icon
                      name="chevronDown"
                      size={11}
                      className="opacity-40 transition group-hover:rotate-180"
                    />
                  )}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  />
                </Link>
                {m.items && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="bg-surface border-line overflow-hidden rounded-2xl border shadow-2xl">
                      {m.items.map((it) => (
                        <Link
                          key={it.label}
                          href={it.href}
                          prefetch={false}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5"
                        >
                          <Icon
                            name={it.icon}
                            size={14}
                            className="text-muted"
                          />{" "}
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="group">
            <button className="relative flex items-center gap-1.5 px-2.5 py-3 text-sm font-medium transition hover:text-brand-600 xl:px-4">
              <Icon name="grid" size={14} className="opacity-70" />{" "}
              {t("nav.more")}
              <Icon
                name="chevronDown"
                size={11}
                className="opacity-40 transition group-hover:rotate-180"
              />
              <span className="absolute inset-x-3 bottom-0 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform group-hover:scale-x-100" />
            </button>
            <div className="invisible absolute inset-x-0 top-full z-50 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="bg-surface border-line mx-auto max-w-7xl overflow-hidden rounded-b-2xl border border-t-0 shadow-2xl">
                <div className="grid grid-cols-6 gap-6 p-8">
                  {MEGA.map((col) => (
                    <div key={col.title}>
                      <p className="border-line mb-3 border-b pb-2 text-sm font-bold">
                        {col.title}
                      </p>
                      <ul className="space-y-1.5">
                        {col.links.map(([label, href]) => (
                          <li key={label}>
                            <Link
                              href={href}
                              prefetch={false}
                              className="text-muted block text-[13px] transition hover:translate-x-0.5 hover:text-brand-600"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <p className="border-line mb-3 border-b pb-2 text-sm font-bold">
                      {t("mega.byLanguage")}
                    </p>
                    <ul className="max-h-52 space-y-1.5 overflow-auto pr-1">
                      {languages.map((l) => (
                        <li key={l.code}>
                          <button
                            onClick={() => setCookie("lang", l.code)}
                            className={`block text-[13px] transition hover:translate-x-0.5 hover:text-brand-600 ${l.code === lang ? "font-bold text-brand-600" : "text-muted"}`}
                          >
                            {l.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-line flex justify-center gap-3 border-t p-4">
                  <Link
                    href="/categories"
                    prefetch={false}
                    className="btn-primary !py-2 text-sm"
                  >
                    {t("mega.browseAllCategories")}{" "}
                    <Icon name="arrowRight" size={14} />
                  </Link>
                  <Link
                    href="/request-a-book"
                    prefetch={false}
                    className="btn-ghost !py-2 text-sm"
                  >
                    <Icon name="bookmark" size={14} /> {t("mega.requestBook")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/compare"
            prefetch={false}
            className={`relative flex items-center gap-1.5 px-2.5 py-3 text-sm font-medium transition hover:text-brand-600 xl:px-4 ${pathname === "/compare" || pathname.startsWith("/compare/") ? "text-brand-600" : ""}`}
          >
            <Icon name="layers" size={14} className="opacity-70" />{" "}
            {t("nav.compare")}
            <span
              className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${pathname === "/compare" || pathname.startsWith("/compare/") ? "scale-x-100" : "scale-x-0 hover:scale-x-100"}`}
            />
          </Link>

          <Link
            href="/about"
            prefetch={false}
            className={`relative flex items-center gap-1.5 px-2.5 py-3 text-sm font-medium transition hover:text-brand-600 xl:px-4 ${pathname === "/about" ? "text-brand-600" : ""}`}
          >
            <Icon name="shieldCheck" size={14} className="opacity-70" />{" "}
            {t("nav.about")}
            <span
              className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${pathname === "/about" ? "scale-x-100" : "scale-x-0 hover:scale-x-100"}`}
            />
          </Link>
        </nav>

        <NavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          mega={MEGA}
          languages={languages}
          lang={lang}
          onPickLang={(code) => setCookie("lang", code)}
          t={t}
        />
      </div>

      {open && (
        <div className="border-line border-t px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {MENUS.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
              >
                <Icon name={m.icon} size={15} className="text-muted" />{" "}
                {m.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <Icon name="bell" size={15} className="text-muted" />{" "}
              {t("nav.notifications")}{" "}
              {notifCount > 0 && (
                <span className="text-brand-600">({notifCount})</span>
              )}
            </Link>
            <Link
              href="/liked"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <Icon name="heart" size={15} className="text-muted" />{" "}
              {t("nav.likedBooks")}
            </Link>
            <Link
              href="/compare"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <Icon name="layers" size={15} className="text-muted" />{" "}
              {t("nav.compare")}
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                surpriseMe();
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <Icon name="zap" size={15} className="text-muted" />{" "}
              {t("nav.surpriseMe")}
            </button>
            <Link
              href="/about"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <Icon name="shieldCheck" size={15} className="text-muted" />{" "}
              {t("nav.about")}
            </Link>
            <Link
              href="/login"
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <Icon name="user" size={15} className="text-muted" />{" "}
              {t("nav.signIn")}
            </Link>
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">
            {t("mobile.explore")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              [t("discover.topRated"), "/books?sort=rating"],
              [t("discover.newReleases"), "/books?sort=new"],
              [t("mega.philosophy"), "/books?category=Philosophy"],
              [t("mega.history"), "/books?category=History"],
              [t("mega.countryIndia"), "/books?country=India"],
              [t("discover.collections"), "/collections"],
              [t("browse.tags"), "/tags"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className="pill"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">
            {t("mobile.theme")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => setCookie("theme", th.id)}
                className={`pill ${th.id === theme ? "!bg-brand-600 !text-white" : ""}`}
              >
                {th.icon} {themeLabel(th.id, th.name)}
              </button>
            ))}
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">
            {t("mobile.language")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setCookie("lang", l.code)}
                className={`pill ${l.code === lang ? "!bg-brand-600 !text-white" : ""}`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
