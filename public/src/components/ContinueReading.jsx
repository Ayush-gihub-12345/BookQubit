"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import BookCover from "./BookCover";
import HScrollRow from "./HScrollRow";
import TitleTransliterated from "./TitleTransliterated";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export default function ContinueReading() {
  const lang = useLang();
  const tr = t(lang);
  const [items, setItems] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setItems(null); return; }
      const r = await authFetch("/api/shelf", {}, u);
      if (!r.ok) { setItems(null); return; }
      const data = await r.json();
      setItems((data.shelf || []).filter((s) => s.status === "reading").slice(0, 4));
    });
  }, []);

  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{tr("continueReadingTitle")}</h2>
          <p className="text-muted mt-1 text-sm">{tr("pickUpWhereLeftOff")}</p>
        </div>
        <Link href={`/${lang}/account`} className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-brand-700 hover:underline">{tr("myShelfLink")}</Link>
      </div>
      <HScrollRow>
        {items.map((s) => (
          <Link key={s.book_slug} href={`/${lang}/books/${encodeURIComponent(s.book_slug)}`}
            className="card flex w-[min(256px,78vw)] shrink-0 gap-3 p-3 sm:w-72 sm:gap-4 sm:p-4">
            <div className="cover h-24 w-16 shrink-0">
              <BookCover title={s.title || s.book_slug} author={s.author} cover_url={s.cover_url} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold"><TitleTransliterated text={s.title || s.book_slug} /></p>
              <p className="text-muted line-clamp-1 text-xs"><TitleTransliterated text={s.author} /></p>
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--fg)_14%,transparent)]">
                  <div className="h-full rounded-full bg-marker"
                    style={{ width: `${s.progress || 0}%` }} />
                </div>
                <p className="text-muted mt-1 text-[11px]">{tr("percentComplete", { pct: s.progress || 0 })}</p>
              </div>
            </div>
          </Link>
        ))}
      </HScrollRow>
    </section>
  );
}
