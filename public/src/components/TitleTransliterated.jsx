"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/useLang";
import { transliterateTitle } from "@/lib/browserTransliterate";

// Phonetic transliteration of an English proper noun — book title, author
// name, publisher name — into the visitor's script ("Atomic Habits" ->
// "एटॉमिक हैबिट्स" in Hindi), not a translation of meaning.
// Description/summary/key_points intentionally keep using the separate
// <Translated> component (real translation) — proper nouns are the
// exception, by design, because readers recognize an English name by how it
// sounds, not by a translated paraphrase of it.
//
// The `title` attribute (native browser tooltip) always carries the real
// English text. Phonetic transliteration of English is inherently
// approximate for some words (see browserTransliterate.js's header comment
// for why) — the tooltip is the safety net: hovering (or long-pressing on
// mobile) always shows the reader the actual name, so a rendering that looks
// off is never a dead end.
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
  return <As className={className} title={out !== text ? text : undefined}>{out}</As>;
}
