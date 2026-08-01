"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_IDS = ["G-2MX9WZ1SPL"];

// gtag's own script only fires a pageview on the initial full page load.
// Next.js App Router navigations (clicking between book/author pages, etc.)
// are client-side transitions that never reload the page, so without this
// every visit after the first would be invisible to Analytics. Firing our
// own page_view on every pathname/query change keeps per-book, per-author,
// per-category pages all tracked individually. useSearchParams() requires a
// Suspense boundary in the App Router, hence the wrapper below.
function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    GA_IDS.forEach((id) => window.gtag("config", id, { page_path: url }));
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
