"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import BookCard from "./BookCard";
import HScrollRow from "./HScrollRow";
import { t } from "@/lib/i18n";

// Real personalization: the heavy lifting (scoring against the reader's
// full shelf history + onboarding genre picks, not just one random "seed"
// book) happens server-side in getRecommendations(). This just renders the
// ranked result, plus the per-book `reason` it came with.
//
// `fallbackBooks` (server-fetched, already cached, see page.jsx) covers
// anonymous visitors and signed-in readers with no shelf history yet. It is
// rendered as "Popular right now" rather than personalized picks, since it
// genuinely isn't personalized: mislabeling it would be a small but real trust
// cost on exactly the section meant to build trust in the recommendations.
//
// The fallback shelf renders IMMEDIATELY, as part of the server-rendered
// page. This component used to render nothing until Firebase finished
// checking the sign-in state, to avoid flashing popular books and then
// swapping them for personalized ones. That protected the minority (signed-in
// readers with history) at the expense of the majority: every signed-out
// visitor saw an empty gap for however long the auth check took, then the
// whole shelf popped in and pushed the page down (measured on a cold load:
// the section arrived tens of seconds late and added ~2,700px of height).
// Now the swap happens inside a row of the same height, so personalizing
// changes what is shown but moves nothing.
export default function ForYou({ lang, fallbackBooks = [] }) {
  const tr = t(lang);
  const [data, setData] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setData(null); return; }
      try {
        const res = await authFetch(`/api/recommendations?lang=${lang}&limit=12`, {}, u).then((r) => r.json());
        if (res.picks?.length) setData(res);
      } catch { /* keep showing the popular shelf */ }
    });
  }, [lang]);

  const personalized = data?.picks?.length > 0;
  if (!personalized && !fallbackBooks.length) return null;

  const items = personalized ? data.picks : fallbackBooks;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <div className="mb-5">
        <h2 className="text-xl font-bold sm:text-2xl">{personalized ? tr("pickedForYou") : tr("popularRightNow")}</h2>
        <p className="text-muted mt-1 text-sm">
          {personalized
            ? (data.basis ? <>{tr("basedOnReadingHistoryIn")} <span className="font-medium text-brand-600">{data.basis}</span> {tr("andMore")}</> : tr("basedOnReadingHistory"))
            : tr("highlyRatedEnjoying")}
        </p>
      </div>
      {/* One swipeable row, not a grid: twelve books in a two-column grid is
          six screens tall on a phone. */}
      <HScrollRow>
        {items.map((b) => (
          <div key={b.slug} className="w-36 sm:w-40">
            <BookCard book={b} note={b.reason} />
          </div>
        ))}
      </HScrollRow>
    </section>
  );
}
