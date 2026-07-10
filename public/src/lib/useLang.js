"use client";

import { useEffect, useState } from "react";

// Reads the same `lang` cookie the server uses for i18n (see lib/lang.js),
// but from the browser — so client components can react to a language
// switch without needing `lang` threaded down as a prop through every book
// card, carousel, and detail page. Navbar dispatches "bq:langchange" right
// after writing the cookie so mounted components pick up the new value.
function readLangCookie() {
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "en";
}

export function useLang() {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    setLang(readLangCookie());
    const onChange = () => setLang(readLangCookie());
    window.addEventListener("bq:langchange", onChange);
    return () => window.removeEventListener("bq:langchange", onChange);
  }, []);
  return lang;
}
