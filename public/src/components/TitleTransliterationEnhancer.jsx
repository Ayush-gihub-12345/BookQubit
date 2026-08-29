"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { transliterateTitle } from "@/lib/browserTransliterate";

// Replaces the old <TitleTransliterated> pattern, which rendered one
// Client Component instance per book title — fine on a single book page,
// but the homepage and browse grids render dozens of cards, and every
// "use client" instance embedded in server-rendered output becomes its own
// separately-streamed segment in React's Flight protocol. Verified live:
// on this Cloudflare Workers/OpenNext runtime, a page with dozens of these
// segments (BookCover had the same problem, fixed separately) fails to
// flush most of their reveal scripts, leaving the page's content
// permanently stuck behind a hidden Suspense boundary.
//
// This component is mounted exactly ONCE per page (see (main)/layout.jsx),
// not once per card — one small streamed segment regardless of how many
// titles are on the page. Titles render as plain English text server-side
// (marked with a data-translit-title attribute carrying the original
// English string), and this walks the DOM once on mount to swap each one
// in place. Same underlying API + localStorage cache as before
// (browserTransliterate.js is unchanged) — just one caller instead of many.
function readLangCookie() {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "en";
}

async function run() {
  const lang = readLangCookie();
  if (!lang || lang === "en") return;
  const nodes = document.querySelectorAll("[data-translit-title]");
  // Sequential, not Promise.all — this hits an external API per unique
  // title (cached after the first visit), so a page with 50 titles
  // shouldn't fire 50 concurrent requests at once.
  for (const el of nodes) {
    const original = el.getAttribute("data-translit-title");
    if (!original) continue;
    const translated = await transliterateTitle(original, lang);
    if (translated && translated !== original) el.textContent = translated;
  }
}

export default function TitleTransliterationEnhancer() {
  // Lives in the shared (main) layout, which persists across client-side
  // <Link> navigations — a plain useEffect(fn, []) would only ever run
  // once for the whole session and miss every page visited after the
  // first. `pathname` changes on every navigation (client-side or full
  // reload), so it re-runs the DOM walk each time new titles are on screen.
  const pathname = usePathname();
  useEffect(() => {
    run();
  }, [pathname]);

  // A language switch (Navbar) does a full page reload today, which this
  // already covers via the pathname/mount effect above — this listener is
  // just a defensive extra in case that ever changes to a soft update.
  useEffect(() => {
    window.addEventListener("bq:langchange", run);
    return () => window.removeEventListener("bq:langchange", run);
  }, []);
  return null;
}
