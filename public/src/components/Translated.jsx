"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/useLang";
import { translateText } from "@/lib/browserTranslate";

// Renders book content (title/description/summary/etc.) translated into the
// visitor's selected language, entirely in the browser — no server round
// trip. Shows the original English text immediately, then swaps in the
// translation once the free translation API resolves (or leaves it as-is on
// failure/English). Never wrap category, collection, or tag values in this —
// those double as filter/URL keys and must stay in their canonical form.
export default function Translated({ text, as: As = "span", className }) {
  const lang = useLang();
  const [out, setOut] = useState(text);

  useEffect(() => {
    setOut(text);
    if (!text || lang === "en") return;
    let alive = true;
    translateText(text, lang).then((t) => { if (alive) setOut(t); });
    return () => { alive = false; };
  }, [text, lang]);

  if (!text) return null;
  return <As className={className}>{out}</As>;
}
