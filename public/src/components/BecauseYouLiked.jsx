"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import BookCard from "./BookCard";
import HScrollRow from "./HScrollRow";
import TitleTransliterated from "./TitleTransliterated";

// "Because you liked X": signed-in only, renders nothing until there is a seed book and at least 3 picks.
export default function BecauseYouLiked({ lang }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setData(null); return; }
      try {
        const res = await authFetch(`/api/recommendations/because?lang=${lang}`, {}, u).then((r) => r.json());
        setData(res.picks?.length >= 3 ? res : null);
      } catch { setData(null); }
    });
  }, [lang]);
  if (!data) return null;
  const why = (b) => (b.why?.shared?.length ? `Both about ${b.why.shared.slice(0, 2).join(" and ")}` : b.why?.sameAuthor ? "Same author" : undefined);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="text-xl font-bold sm:text-2xl">
        Because you liked <Link href={`/${lang}/books/${encodeURIComponent(data.seed.slug)}`} className="text-brand-700 hover:underline"><TitleTransliterated text={data.seed.title} /></Link>
      </h2>
      <p className="text-muted mt-1 text-sm">Books that share its themes, with the reason under each one.</p>
      <div className="mt-5">
        <HScrollRow>
          {data.picks.map((b) => (
            <div key={b.id} className="w-[142px] shrink-0 sm:w-[158px]"><BookCard book={b} hrefBase={`/${lang}/books`} note={why(b)} /></div>
          ))}
        </HScrollRow>
      </div>
    </section>
  );
}
