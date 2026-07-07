"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";

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

  const MENUS = [
    { href: "/", icon: "🏠", label: "Home" },
    {
      href: "/books", icon: "📚", label: labels.books,
      items: [
        { href: "/books", label: "📖 All Books" },
        { href: "/books?sort=rating", label: "⭐ Top Rated" },
        { href: "/books?sort=new", label: "🆕 New Releases" },
        { href: "/categories", label: `🗃️ ${labels.categories}` },
        { href: "/tags", label: `#️⃣ ${labels.tags}` },
      ],
    },
    { href: "/collections", icon: "🗂️", label: labels.collections },
    { href: "/authors", icon: "✍️", label: labels.authors },
    { href: "/publications", icon: "🏢", label: labels.publishers },
    { href: "/comics", icon: "💥", label: labels.comics },
    { href: "/readers", icon: "🏆", label: "Readers" },
  ];

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    router.refresh();
  };
  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <header className="border-line bg-surface/85 sticky top-0 z-50 border-b shadow-sm backdrop-blur-xl">
      {/* Row 1 */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30">B</span>
          <span className="hidden sm:inline">Book<span className="text-brand-600">Qubit</span></span>
        </Link>

        <div className="min-w-0 flex-1 px-1 sm:px-4">
          <div className="mx-auto max-w-xl">
            <SearchBar lang={lang} placeholder={labels.search} big />
          </div>
        </div>

        {/* Theme picker */}
        <div className="hidden sm:block">
          <Dropdown
            width="w-44"
            button={(toggle) => (
              <button onClick={toggle} className={iconBtn} title={`Theme: ${currentTheme.name}`} aria-label="Theme">
                {currentTheme.icon}
              </button>
            )}
          >
            <p className="text-muted border-line border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wide">Theme</p>
            {themes.map((t) => (
              <button key={t.id} onClick={() => setCookie("theme", t.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${t.id === theme ? "font-bold text-brand-600" : ""}`}>
                <span>{t.icon}</span> {t.name}
                {t.id === theme && <span className="ml-auto text-brand-600">✓</span>}
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

      {/* Row 2 */}
      <div className="border-line hidden border-t lg:block">
        <nav className="mx-auto flex max-w-7xl items-center justify-center px-4">
          {MENUS.map((m) => {
            const active = m.href === "/" ? pathname === "/" : pathname.startsWith(m.href.split("?")[0]);
            return (
              <div key={m.label} className="group relative">
                <Link href={m.href}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition hover:text-brand-600 ${active ? "text-brand-600" : ""}`}>
                  <span className="text-xs">{m.icon}</span> {m.label}
                  {m.items && <span className="text-[8px] opacity-40 transition group-hover:rotate-180">▼</span>}
                  <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-transform ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
                {m.items && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="bg-surface border-line overflow-hidden rounded-2xl border shadow-2xl">
                      {m.items.map((it) => (
                        <Link key={it.label} href={it.href}
                          className="block px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5">
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="border-line border-t px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {MENUS.map((m) => (
              <Link key={m.label} href={m.href} onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
                {m.icon} {m.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              🔑 {labels.signIn}
            </Link>
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
