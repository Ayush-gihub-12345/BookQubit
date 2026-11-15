"use client";

// An author's books on a time axis. Each book is a cover on the line at its publication year (alternating above and
// below so neighbours don't overlap); the birth year is marked when it falls in range. Selecting a book fills the side
// panel with the author's name and short bio, then the book's title, year, rating and a summary snippet.
// Pure layout over data the page already has: no extra queries.
import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/useLang";

export default function AuthorTimeline({ author, books, birthYear }) {
  const lang = useLang();
  const items = useMemo(() => books
    .map((b) => ({ ...b, year: parseInt(String(b.published || "").slice(0, 4), 10) }))
    .filter((b) => Number.isFinite(b.year) && b.year > 0)
    .sort((a, b) => a.year - b.year), [books]);
  const [i, setI] = useState(0);
  if (items.length < 2) return null;

  const first = items[0].year, last = items[items.length - 1].year;
  const lo = birthYear && birthYear < first && first - birthYear <= 90 ? birthYear : first;
  const span = Math.max(1, last - lo);
  const x = (y) => 4 + ((y - lo) / span) * 92;
  const cur = items[Math.min(i, items.length - 1)];
  const ticks = [...new Set([lo, Math.round(lo + span / 2), last])];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-9" aria-labelledby="tl-h">
      <p className="eyebrow">Timeline</p>
      <h2 id="tl-h" className="mt-1.5 text-2xl font-bold sm:text-[1.75rem]">{author.name} through the years</h2>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card overflow-x-auto p-4 hover:!translate-y-0">
          <div className="relative h-[210px] min-w-[620px]" role="list" aria-label="Books by year">
            <div aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(90deg, var(--color-brand-500), color-mix(in oklab, var(--color-brand-500) 60%, var(--color-qubit-500)))" }} />
            {birthYear && lo === birthYear && (
              <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ insetInlineStart: `${x(birthYear)}%` }}>
                <span className="block h-3 w-3 rounded-full border-2 border-[var(--fg)] bg-[var(--bg)]" title={`Born ${birthYear}`} />
                <span className="text-muted absolute start-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[11px]">Born {birthYear}</span>
              </span>
            )}
            {ticks.filter((t) => !(birthYear && t === birthYear)).map((t) => (
              <span key={t} aria-hidden className="text-muted absolute top-1/2 -translate-x-1/2 translate-y-3 text-[11px]" style={{ insetInlineStart: `${x(t)}%` }}>{t}</span>
            ))}
            {items.map((b, k) => {
              const up = k % 2 === 0, on = k === i;
              return (
                <button key={b.slug} type="button" role="listitem" onClick={() => setI(k)} aria-label={`${b.title}, ${b.year}`} aria-current={on ? "true" : undefined}
                  className="absolute -translate-x-1/2 outline-none" style={{ insetInlineStart: `${x(b.year)}%`, top: up ? "4%" : "auto", bottom: up ? "auto" : "4%" }}>
                  <span className={`cover !rounded-[3px] block w-9 transition-transform ${on ? "scale-125 ring-2 ring-[var(--color-brand-500)]" : "opacity-85 hover:scale-110"}`}>
                    {b.cover_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={b.cover_url} alt="" loading="lazy" />
                      : <span className="grid aspect-[2/3] place-items-center bg-[var(--surface-2)] text-[9px] font-bold">{b.title.slice(0, 2)}</span>}
                  </span>
                  <span aria-hidden className={`absolute start-1/2 w-px -translate-x-1/2 bg-[var(--line-strong)] ${up ? "top-full h-[calc(50%-1.5rem)]" : "bottom-full h-[calc(50%-1.5rem)]"}`} />
                  <span className={`text-muted absolute start-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] ${up ? "-bottom-4" : "-top-4"}`}>{b.year}</span>
                </button>
              );
            })}
          </div>
          <p className="text-muted mt-1 text-xs">Select a cover to read about the book.</p>
        </div>

        <aside className="card p-5 hover:!translate-y-0" aria-live="polite">
          <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
            {author.image_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={author.image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              : <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-2)] font-bold text-brand-700">{author.name[0]}</span>}
            <div className="min-w-0"><b className="block truncate">{author.name}</b><span className="text-muted block truncate text-xs">{[author.country, birthYear && `b. ${birthYear}`].filter(Boolean).join(" · ")}</span></div>
          </div>
          {author.bio && <p className="text-muted mt-3 line-clamp-3 text-[13px] leading-relaxed">{author.bio}</p>}
          <div className="mt-4 flex gap-3">
            <span className="cover !rounded-[3px] block w-16 shrink-0">
              {cur.cover_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={cur.cover_url} alt="" />
                : <span className="grid aspect-[2/3] place-items-center bg-[var(--surface-2)] text-xs font-bold">{cur.title.slice(0, 2)}</span>}
            </span>
            <div className="min-w-0">
              <p className="eyebrow !text-[10px]">{cur.year}</p>
              <b className="font-display line-clamp-3 text-lg leading-tight">{cur.title}</b>
              {cur.rating ? <p className="mt-1 flex items-center gap-1 text-sm"><Icon name="star" size={13} filled className="stars" />{Number(cur.rating).toFixed(1)}</p> : null}
            </div>
          </div>
          {cur.snippet && <p className="mt-3 text-[14px] leading-relaxed">{cur.snippet}</p>}
          <Link href={`/${lang}/books/${encodeURIComponent(cur.slug)}`} prefetch={false} className="btn-primary btn-sm mt-4 w-full">Open the book</Link>
          <div className="mt-3 flex justify-between text-xs">
            <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="text-muted hover:text-[var(--fg)] disabled:opacity-40">← Earlier</button>
            <span className="text-muted">{i + 1} of {items.length}</span>
            <button type="button" disabled={i >= items.length - 1} onClick={() => setI(i + 1)} className="text-muted hover:text-[var(--fg)] disabled:opacity-40">Later →</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
