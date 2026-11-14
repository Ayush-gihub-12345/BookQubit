"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { usePlayer } from "@/components/player/PlayerProvider";
import SaveToMindSpace from "@/components/mindspace/SaveToMindSpace";
import { shareQuoteImage } from "@/lib/quote-image";
import { useLang } from "@/lib/useLang";

const card = "border-line bg-surface rounded-2xl border";

export function BookFeedCard({ b }) {
  const lang = useLang();
  const player = usePlayer();
  const href = `/${lang}/books/${encodeURIComponent(b.slug)}`;
  const trackId = `${b.slug}:${b.lang}:general`;
  const active = player?.track?.id === trackId;
  const playing = active && player.playing;
  const listen = () => {
    if (!player) return;
    if (active) return player.toggle();
    player.load({ id: trackId, slug: b.slug, lang: b.lang, title: b.title, subtitle: b.author, cover: b.cover_url, src: null, text: b.script });
  };
  return (
    <article className={`${card} flex gap-4 p-4`}>
      <Link href={href} className="block h-32 w-[5.25rem] shrink-0 overflow-hidden rounded-lg bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {b.cover_url ? <img src={b.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="bg-brand-100 block h-full w-full" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="font-editorial line-clamp-2 text-lg font-semibold leading-snug hover:underline">{b.title}</Link>
        <p className="text-muted mt-0.5 truncate text-sm">{b.author}</p>
        <p className="text-muted mt-1 flex flex-wrap items-center gap-x-2 text-xs">
          {b.rating ? <span>★ {Number(b.rating).toFixed(1)}</span> : null}
          <span className="border-line rounded border px-1.5 uppercase">{b.lang}</span>
          {b.category && <Link href={`/${lang}/books?category=${encodeURIComponent(b.category)}`} className="hover:text-brand-600 truncate">{b.category}</Link>}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {b.hasSummary && (
            <button type="button" onClick={listen} className="bg-brand-600 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-white" aria-label={`${playing ? "Pause" : "Listen to"} the 1-minute summary of ${b.title}`}>
              <Icon name={playing ? "pause" : "headphones"} size={14} /> {playing ? "Pause" : "1 min"}
            </button>
          )}
          <Link href={href} className="text-brand-700 text-sm font-medium hover:underline">Read</Link>
        </div>
      </div>
    </article>
  );
}

export function QuoteCard({ q }) {
  const lang = useLang();
  const [done, setDone] = useState("");
  const flash = (m) => { setDone(m); setTimeout(() => setDone(""), 2000); };
  async function copy() {
    try { await navigator.clipboard.writeText(`“${q.text}” — ${q.book.title}${q.book.author ? `, ${q.book.author}` : ""}`); flash("Copied"); } catch { flash("Couldn't copy"); }
  }
  return (
    <article className={`${card} bg-brand-50 p-5`}>
      <blockquote className="font-editorial text-xl leading-snug">&ldquo;{q.text}&rdquo;</blockquote>
      <p className="text-muted mt-3 text-sm">
        <Link href={`/${lang}/books/${encodeURIComponent(q.book.slug)}`} className="hover:text-brand-700 font-medium underline-offset-2 hover:underline">{q.book.title}</Link>
        {q.book.author ? <> · {q.book.author}</> : null}
      </p>
      <div className="text-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={copy} className="hover:text-brand-600 inline-flex items-center gap-1.5"><Icon name="check" size={14} /> Copy</button>
        <SaveToMindSpace node={{ kind: "quote", body: q.text, bookSlug: q.book.slug, title: q.book.title }} label="Save" />
        <button type="button" onClick={async () => flash((await shareQuoteImage({ text: q.text, title: q.book.title, author: q.book.author })) ? "Ready to share" : "")} className="hover:text-brand-600 inline-flex items-center gap-1.5"><Icon name="share" size={14} /> Share as image</button>
        <span role="status" className="text-brand-700 text-xs">{done}</span>
      </div>
    </article>
  );
}

export function AuthorCard({ a }) {
  const lang = useLang();
  return (
    <Link href={`/${lang}/authors/${encodeURIComponent(a.slug)}`} className={`${card} hover:border-brand-500 flex items-center gap-4 p-4 transition`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {a.image_url ? <img src={a.image_url} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover" /> : <span className="bg-brand-100 flex h-14 w-14 shrink-0 items-center justify-center rounded-full"><Icon name="feather" size={20} /></span>}
      <span className="min-w-0">
        <span className="font-editorial block truncate text-lg font-semibold">{a.name}</span>
        <span className="text-muted block truncate text-sm">{a.famous_work ? `Known for ${a.famous_work}` : "Author"}{a.country ? ` · ${a.country}` : ""}</span>
      </span>
    </Link>
  );
}

export function ComicCard({ c }) {
  const lang = useLang();
  return (
    <Link href={`/${lang}/comics/${encodeURIComponent(c.slug)}`} className={`${card} hover:border-brand-500 flex gap-4 p-4 transition`}>
      <span className="block h-24 w-16 shrink-0 overflow-hidden rounded-md bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {c.cover_url && <img src={c.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </span>
      <span className="min-w-0"><span className="font-editorial block truncate text-lg font-semibold">{c.title}</span><span className="text-muted block truncate text-sm">Comic{c.publisher ? ` · ${c.publisher}` : ""}</span></span>
    </Link>
  );
}

export function AffiliateCard({ a }) {
  return (
    <article className={`${card} flex gap-4 p-4`} aria-label="Sponsored">
      <span className="block h-24 w-16 shrink-0 overflow-hidden rounded-md bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {a.cover_url && <img src={a.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </span>
      <div className="min-w-0">
        <span className="border-line text-muted inline-block rounded border px-1.5 py-0.5 text-[11px] font-semibold">Sponsored · Affiliate link</span>
        <p className="font-editorial mt-1 truncate text-lg font-semibold">{a.title}</p>
        <a href={a.href} target="_blank" rel="noopener noreferrer sponsored" className="text-brand-700 mt-1 inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
          <Icon name="cart" size={14} /> Get the book
        </a>
      </div>
    </article>
  );
}
