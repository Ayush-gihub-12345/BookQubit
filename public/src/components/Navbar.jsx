"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/books", label: "Books" },
  { href: "/collections", label: "Collections" },
  { href: "/categories", label: "Categories" },
  { href: "/authors", label: "Authors" },
  { href: "/publications", label: "Publishers" },
  { href: "/comics", label: "Comics" },
  { href: "/tags", label: "Tags" },
];

export default function Navbar({ lang, languages }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) router.push(`/books?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const setLang = (code) => {
    document.cookie = `lang=${code};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-[#0b1220]/80">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
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
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800 ${
                pathname.startsWith(item.href) ? "text-brand-600" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <form onSubmit={search} className="hidden md:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books, authors…"
            className="input w-56 py-2 text-sm"
          />
        </form>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="input hidden w-auto py-2 text-sm sm:block"
          aria-label="Language"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>

        <button
          onClick={() => setOpen(!open)}
          className="btn-ghost px-3 py-2 lg:hidden"
          aria-label="Menu"
        >
          ☰
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
          <form onSubmit={search} className="mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books, authors…"
              className="input"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50 dark:hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="input mt-3 sm:hidden"
            aria-label="Language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
}
