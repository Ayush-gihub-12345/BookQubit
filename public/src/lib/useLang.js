"use client";

import { usePathname } from "next/navigation";
import { LANGUAGES } from "./languages";

// Language is now a real URL segment (see middleware.js + lib/lang.js), so
// the client-side value is derived straight from the current path instead of
// a cookie — updates automatically and correctly on every client-side
// transition via usePathname()'s own reactivity, with no event plumbing
// needed (this replaces an earlier cookie+custom-event version whose
// "bq:langchange" event was never actually dispatched anywhere).
export function useLang() {
  const pathname = usePathname();
  const first = pathname.split("/")[1];
  return LANGUAGES.some((l) => l.code === first) ? first : "en";
}
