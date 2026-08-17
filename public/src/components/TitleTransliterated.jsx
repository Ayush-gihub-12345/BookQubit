"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/useLang";
import { transliterateTitle } from "@/lib/browserTransliterate";

// Book TITLES ONLY — phonetic transliteration into the visitor's script
// ("Atomic Habits" -> "एटॉमिक हैबिट्स" in Hindi), not a translation of
// meaning. Description/summary/key_points intentionally keep using the
// separate <Translated> component (real translation) — titles are the one
// exception, by design, because readers recognize an English book by how
// its name sounds, not by a translated paraphrase of it.
export default function TitleTransliterated({ text, as: As = "span", className }) {
  const lang = useLang();
  const [out, setOut] = useState(text);

  useEffect(() => {
    setOut(text);
    if (!text || lang === "en") return;
    let alive = true;
    transliterateTitle(text, lang).then((t) => { if (alive) setOut(t); });
    return () => { alive = false; };
  }, [text, lang]);

  if (!text) return null;
  return <As className={className}>{out}</As>;
}
