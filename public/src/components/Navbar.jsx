"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";

export default function Navbar({ lang, theme, languages, themes, labels }) {
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const MENUS = [
    { href: "/", icon: "🏠", label: "Home" },
    {
      href: "/books", icon: "📚", label: labels.books,
      items: [
        { href: "/books", label: "All Books" },
        { href: "/books?sort=rating", label: "Top Rated" },
        { href: "/books?sort=new", label: "New Releases" },
        { href: "/categories", label: labels.categories },
        { href: "/tags", label: labels.tags },
      ],
    },
    {
      href: "/collections", icon: "🗂️", label: labels.collections,
      items: [{ href: "/collections", label: "All Collections" }],
    },
    {
      href: "/authors", icon: "✍️", label: labels.authors,
      items: [{ href: "/authors", label: "All Authors" }],
    },
    {
      href: "/publications", icon: "🏢", label: labels.publishers,
      items: [{ href: "/publications", label: "All Publishers" }],
    },
    {
      href: "/comics", icon: "💥", label: labels.comics,
      items: [{ href: "/comics", label: "All Comics" }],
    },
    { href: "/readers", icon: "🏆", label: "Readers" },
  ];

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    router.refresh();
  };
  const current = themes.find((t) => t.id === theme) || themes[0];

  return (
    <header className="border-line bg-surface/85 sticky top-0 z-50 border-b backdrop-blur-xl">
      {/* Row 1: logo · search · theme · language · auth */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30">B</span>
          Book<span className="text-brand-600">Qubit</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-xl"><SearchBar lang={lang} placeholder={labels.search} big /></div>
        </div>

        {/* Theme picker */}
        <div className="relative hidden sm:block">
          <button onClick={() => setThemeOpen(!themeOpen)} className="btn-ghost px-3 py-2 text-base" title={`Theme: ${current.name}`} aria-label="Theme">
            {current.icon}
          </button>
          {themeOpen && (
            <div className="bg-surface border-line absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border shadow-2xl">
              {themes.map((t) => (
                <button key={t.id}
                  onClick={() => { setCookie("theme", t.id); setThemeOpen(false); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5 ${t.id === theme ? "font-bold text-brand-600" : ""}`}>
                  <span className="text-base">{t.icon}</span> {t.name}
                  {t.id === theme && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <select value={lang} onChange={(e) => setCookie("lang", e.target.value)}
          className="input hidden w-auto py-2 text-sm sm:block" aria-label="Language">
          {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>

        <AuthButton labels={labels} />

        <button onClick={() => setOpen(!open)} className="btn-ghost px-3 py-2 lg:hidden" aria-label="Menu">☰</button>
      </div>

      {/* Row 2: nav links with dropdowns */}
      <div className="border-line hidden border-t lg:block">
        <nav className="mx-auto flex max-w-7xl items-center px-4">
          {MENUS.map((m) => (
            <div key={m.label} className="group relative">
              <Link href={m.href}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium transition hover:text-brand-600 ${
                  (m.href === "/" ? pathname === "/" : pathname.startsWith(m.href.split("?")[0])) ? "text-brand-600" : ""
                }`}>
                <span className="text-xs">{m.icon}</span> {m.label}
                {m.items && <span className="text-[9px] opacity-50">▼</span>}
              </Link>
              {m.items && (
                <div className="bg-surface border-line invisible absolute left-0 top-full z-50 w-52 translate-y-1 rounded-xl border opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {m.items.map((it) => (
                    <Link key={it.label} href={it.href}
                      className="block px-4 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5">
                      {it.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="border-line border-t px-4 py-3 lg:hidden">
          <div className="mb-3">
            <SearchBar lang={lang} placeholder={labels.search} big onNavigate={() => setOpen(false)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MENUS.map((m) => (
              <Link key={m.label} href={m.href} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
                {m.icon} {m.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              🔑 {labels.signIn}
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {themes.map((t) => (
              <button key={t.id} onClick={() => setCookie("theme", t.id)}
                className={`pill ${t.id === theme ? "!bg-brand-600 !text-white" : ""}`}>
                {t.icon} {t.name}
              </button>
            ))}
          </div>
          <select value={lang} onChange={(e) => setCookie("lang", e.target.value)}
            className="input mt-3" aria-label="Language">
            {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      )}
    </header>
  );
}
