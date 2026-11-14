"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { whenSignedIn } from "@/lib/authFetch";
import { useLang } from "@/lib/useLang";

const TABS = [
  ["", "Shelves"],
  ["/stats", "Stats"],
  ["/import", "Import"],
];
// MindSpace lives at /mindspace (outside /library); listed here so mobile readers can reach it.
const EXTRA = [["mindspace", "MindSpace"], ["listen", "Listen"]];

// Shared frame for /library, /library/stats, /library/import: tab bar + sign-in gate.
// `children` is a render function receiving the signed-in Firebase user.
export default function LibraryShell({ children }) {
  const lang = useLang();
  const pathname = usePathname();
  const [user, setUser] = useState(undefined); // undefined = still checking
  useEffect(() => { whenSignedIn().then(setUser); }, []);
  const base = `/${lang}/library`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <h1 className="font-editorial text-2xl font-semibold sm:text-3xl">Your library</h1>
      <nav aria-label="Library sections" className="border-line hscroll mt-3 gap-6 border-b sm:mt-4 [&>*]:shrink-0">
        {TABS.map(([path, label]) => {
          const active = pathname.replace(/\/$/, "") === base + path;
          return (
            <Link key={label} href={base + path} aria-current={active ? "page" : undefined}
              className={`-mb-px border-b-2 pb-2 text-sm font-medium ${active ? "border-brand-600 text-brand-700" : "text-muted hover:text-fg border-transparent"}`}>
              {label}
            </Link>
          );
        })}
        {EXTRA.map(([path, label]) => (
          <Link key={label} href={`/${lang}/${path}`} className="text-muted hover:text-fg -mb-px border-b-2 border-transparent pb-2 text-sm font-medium">{label}</Link>
        ))}
      </nav>
      <div className="mt-6">
        {user === undefined && <div className="skeleton h-40 w-full" aria-hidden />}
        {user === null && (
          <div className="border-line bg-surface rounded-2xl border p-8 text-center">
            <p className="font-editorial text-xl">Sign in to see your library</p>
            <p className="text-muted mt-1 text-sm">Your shelves, progress and stats are saved to your account.</p>
            <Link href={`/${lang}/login`} className="btn-primary mt-4 inline-flex">Sign in</Link>
          </div>
        )}
        {user && children(user)}
      </div>
    </div>
  );
}
