"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import SearchBar from "./SearchBar";

export default function Navbar({ lang, theme, languages, themes, labels }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const NAV = [
    { href: "/books", label: labels.books },
    { href: "/collections", label: labels.collections },
    { href: "/categories", label: labels.categories },
    { href: "/authors", label: labels.authors },
    { href: "/publications", label: labels.publishers },
    { href: "/comics", label: labels.comics },
    { href: "/readers", label: "🏆" },
  ];

  const setCookie = (name, value) => {
    document.cookie = `${name}=${value};path=/;max-age=31536000`;
    router.refresh();
  };

  const nextTheme = () => {
    const i = themes.findIndex((t) => t.id === theme);
    setCookie("theme", themes[(i + 1) % themes.length].id);
  };
  const current = themes.find((t) => t.id === theme) || themes[0];

  return (
    <header className="border-line bg-surface/80 sticky top-0 z-50 border-b backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30">
            B
          </span>
          Book<span className="text-brand-600">Qubit</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5 ${
                pathname.startsWith(item.href) ? "text-brand-600" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <SearchBar lang={lang} placeholder={labels.search} />
        </div>

        <button
          onClick={nextTheme}
          className="btn-ghost hidden px-3 py-2 text-base sm:inline-flex"
          title={`Theme: ${current.name}`}
          aria-label="Switch theme"
        >
          {current.icon}
        </button>

        <select
          value={lang}
          onChange={(e) => setCookie("lang", e.target.value)}
          className="input hidden w-auto py-2 text-sm sm:block"
          aria-label="Language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>

        <AuthButton labels={labels} />

        <button onClick={() => setOpen(!open)} className="btn-ghost px-3 py-2 lg:hidden" aria-label="Menu">
          ☰
        </button>
      </nav>

      {open && (
        <div className="border-line border-t px-4 py-3 lg:hidden">
          <div className="mb-3">
            <SearchBar lang={lang} placeholder={labels.search} big onNavigate={() => setOpen(false)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-white/5">
              {labels.signIn}
            </Link>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={nextTheme} className="btn-ghost flex-1 py-2 text-sm">
              {current.icon} {current.name}
            </button>
            <select
              value={lang}
              onChange={(e) => setCookie("lang", e.target.value)}
              className="input flex-1 py-2 text-sm"
              aria-label="Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
