"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";
import Icon from "./Icon";
import { LogoMark } from "./Logo";

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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef(null);

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

  const MENUS = [
    { href: "/", icon: "home", label: "Home" },
    {
      href: "/books", icon: "compass", label: "Discover",
      items: [
        { href: "/books?sort=rating", icon: "trendingUp", label: "Trending" },
        { href: "/books?sort=new", icon: "clock", label: "New Releases" },
        { href: "/books?sort=rating", icon: "star", label: "Top Rated" },
        { href: "/collections", icon: "layers", label: labels.collections },
      ],
    },
    {
      href: "/books", icon: "book", label: "Browse",
      items: [
        { href: "/books", icon: "book", label: "All Books" },
        { href: "/categories", icon: "grid", label: "Genres & Categories" },
        { href: "/tags", icon: "hash", label: labels.tags },
        { href: "/comics", icon: "zap", label: labels.comics },
      ],
    },
    { href: "/authors", icon: "feather", label: labels.authors },
    {
      href: "/publications", icon: "building", label: labels.publishers,
      items: [
        { href: "/publications", icon: "building", label: "All Publishers" },
        { href: "/publications/penguin-random-house", icon: "book", label: "Penguin Random House" },
        { href: "/publications/harpercollins", icon: "book", label: "HarperCollins" },
      ],
    },
    { href: "/community", icon: "users", label: "Community" },
    { href: "/leaderboard", icon: "trophy", label: "Bookworm Ranking" },
  ];

  // Multi-column mega menu ("More") — enterprise-style grouped catalog entry points
  const MEGA = [
    {
      title: "Best Sellers",
      links: [
        ["Top Rated", "/books?sort=rating"],
        ["Trending Now", "/books?sort=rating"],
        ["New Releases", "/books?sort=new"],
        ["All Books", "/books"],
        ["Editors' Choice", "/books?sort=rating&rating=4.5"],
      ],
    },
    {
      title: "Literature Types",
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
      title: "Books by Country",
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
      title: "Special Collections",
      links: [
        ["Harari Collection", "/collections/Harari%20Collection"],
        ["Stoic Classics", "/collections/Stoic%20Classics"],
        ["Dystopian Classics", "/collections/Dystopian%20Classics"],
        ["Revolutionary Classics", "/collections/Revolutionary%20Classics"],
        ["All Collections", "/collections"],
      ],
    },
    {
      title: "By Format",
      links: [
        ["Paperback", "/books?format=Paperback"],
        ["Hardcover", "/books?format=Hardcover"],
        ["EBook", "/books?format=EBook"],
        ["Comics", "/comics"],
      ],
    },
  ];

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    router.refresh();
  };
  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header ref={headerRef} className="border-line bg-surface/85 relative z-50 border-b shadow-sm backdrop-blur-xl lg:sticky lg:top-0">
      {/* brand accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-700" />
      {/* Row 1 */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
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

        {/* Theme picker */}
        <div className="hidden sm:block">
          <Dropdown
            width="w-44"
            button={(toggle) => (
              <button onClick={toggle} className={iconBtn} title={`Theme: ${currentTheme.name}`} aria-label="Theme">
                <Icon name="palette" size={17} />
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">Theme</p>
            {themes.map((t) => (
              <button key={t.id} onClick={() => setCookie("theme", t.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${t.id === theme ? "font-bold text-brand-600" : ""}`}>
                <span className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ background: { light: "#fff", dark: "#0b1220", sepia: "#b07d2f", midnight: "#7c3aed", ocean: "#0891b2", forest: "#059669", rose: "#e11d48" }[t.id] }} />
                {t.name}
                {t.id === theme && <Icon name="check" size={14} className="ml-auto text-brand-600" />}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Language picker */}
        <div className="hidden sm:block">
          <Dropdown
            width="w-48"
            button={(toggle) => (
              <button onClick={toggle}
                className="border-line bg-surface flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold shadow-sm transition hover:scale-105 hover:border-brand-500 hover:shadow-md"
                aria-label="Language">
                🌐 <span className="uppercase">{currentLang.code}</span>
                <span className="text-[9px] opacity-50">▼</span>
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">Language</p>
            <div className="max-h-72 overflow-auto">
              {languages.map((l) => (
                <button key={l.code} onClick={() => setCookie("lang", l.code)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${l.code === lang ? "font-bold text-brand-600" : ""}`}>
                  <span className="text-muted w-7 text-xs font-bold uppercase">{l.code}</span> {l.name}
                  {l.code === lang && <span className="ml-auto text-brand-600">✓</span>}
                </button>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="shrink-0 whitespace-nowrap"><AuthButton labels={labels} /></div>

        <button onClick={() => setOpen(!open)} className={`${iconBtn} lg:hidden`} aria-label="Menu">☰</button>
      </div>

      {/* Mobile search row — full width, never squeezed */}
      <div className="border-line border-t px-4 py-2 md:hidden">
        <SearchBar lang={lang} placeholder={labels.search} big />
      </div>

      {/* Row 2 */}
      <div className="border-line relative hidden border-t lg:block">
        <nav className="mx-auto flex max-w-7xl items-center justify-center px-4">
          {MENUS.map((m) => {
            const active = m.href === "/" ? pathname === "/" : pathname.startsWith(m.href.split("?")[0]);
            return (
              <div key={m.label} className="group relative">
                <Link href={m.href}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition hover:text-brand-600 ${active ? "text-brand-600" : ""}`}>
                  <Icon name={m.icon} size={14} className="opacity-70" /> {m.label}
                  {m.items && <Icon name="chevronDown" size={11} className="opacity-40 transition group-hover:rotate-180" />}
                  <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
                {m.items && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="bg-surface border-line overflow-hidden rounded-2xl border shadow-2xl">
                      {m.items.map((it) => (
                        <Link key={it.label} href={it.href}
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
              <Icon name="grid" size={14} className="opacity-70" /> More
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
                            <Link href={href} className="text-muted block text-[13px] transition hover:translate-x-0.5 hover:text-brand-600">
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <p className="border-line mb-3 border-b pb-2 text-sm font-bold">By Language</p>
                    <ul className="max-h-52 space-y-1.5 overflow-auto pr-1">
                      {languages.map((l) => (
                        <li key={l.code}>
                          <button onClick={() => setCookie("lang", l.code)}
                            className={`block text-[13px] transition hover:translate-x-0.5 hover:text-brand-600 ${l.code === lang ? "font-bold text-brand-600" : "text-muted"}`}>
                            {l.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-line border-t p-4 text-center">
                  <Link href="/categories" className="btn-primary !py-2 text-sm">
                    Browse All Categories <Icon name="arrowRight" size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="border-line border-t px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {MENUS.map((m) => (
              <Link key={m.label} href={m.href} onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
                <Icon name={m.icon} size={15} className="text-muted" /> {m.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name="user" size={15} className="text-muted" /> {labels.signIn}
            </Link>
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">Explore</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[["Top Rated", "/books?sort=rating"], ["New Releases", "/books?sort=new"], ["Philosophy", "/books?category=Philosophy"], ["History", "/books?category=History"], ["India", "/books?country=India"], ["Collections", "/collections"], ["Tags", "/tags"]].map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setOpen(false)} className="pill">{label}</Link>
            ))}
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">Theme</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {themes.map((t) => (
              <button key={t.id} onClick={() => setCookie("theme", t.id)}
                className={`pill ${t.id === theme ? "!bg-brand-600 !text-white" : ""}`}>
                {t.icon} {t.name}
              </button>
            ))}
          </div>
          <p className="text-muted mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">Language</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((l) => (
              <button key={l.code} onClick={() => setCookie("lang", l.code)}
                className={`pill ${l.code === lang ? "!bg-brand-600 !text-white" : ""}`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
