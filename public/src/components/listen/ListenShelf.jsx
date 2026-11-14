"use client";

// One audiobook shelf (Spotify-style): a row of covers, each with its own play button, and "Play all" which queues the
// whole row into the global player. Tiles hold only a light descriptor; the script/audio is fetched when played.
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import HScrollRow from "@/components/HScrollRow";
import { usePlayer } from "@/components/player/PlayerProvider";

const desc = (b) => ({ slug: b.slug, lang: b.lang || "en", title: b.title, author: b.author || "", cover: b.cover_url || "" });

export function PlayTile({ book, lang, size = "md" }) {
  const p = usePlayer();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const id = `${book.slug}:${book.lang || lang}:general`;
  const active = p?.track?.id === id;
  const playing = active && p.playing;

  async function play() {
    if (!p || busy) return;
    if (active) { p.toggle(); return; }
    setBusy(true); setFailed(false);
    const ok = await p.loadBook(desc({ ...book, lang: book.lang || lang }));
    setBusy(false);
    if (!ok) setFailed(true);
  }

  return (
    <div className={size === "sm" ? "w-[min(132px,34vw)]" : "w-[min(156px,40vw)]"}>
      <div className="group relative">
        <Link href={`/${lang}/books/${encodeURIComponent(book.slug)}`} prefetch={false} className="cover block" aria-label={`${book.title} — book page`}>
          {book.cover_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={book.cover_url} alt="" loading="lazy" />
            : <span className="grid h-full w-full place-items-center bg-[var(--surface-2)] p-2 text-center text-xs font-semibold">{book.title}</span>}
        </Link>
        <button type="button" onClick={play} aria-label={`${playing ? "Pause" : "Play"} ${book.title}`} aria-busy={busy}
          className={`absolute bottom-2 end-2 grid h-11 w-11 place-items-center rounded-full bg-brand-400 text-[var(--on-brand)] shadow-lg transition
            ${active ? "opacity-100" : "sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"}`}>
          {busy ? <span className="spinner" /> : <Icon name={playing ? "pause" : "play"} size={17} filled />}
        </button>
      </div>
      <Link href={`/${lang}/books/${encodeURIComponent(book.slug)}`} prefetch={false} className="mt-2 block">
        <span className="line-clamp-2 block text-sm font-semibold leading-snug">{book.title}</span>
        <span className="text-muted line-clamp-1 block text-xs">{book.author}</span>
      </Link>
      {failed && <p role="status" className="mt-1 text-xs text-[var(--muted)]">No audio for this one yet.</p>}
    </div>
  );
}

export default function ListenShelf({ title, subtitle, books, lang, href, viewAll }) {
  const p = usePlayer();
  if (!books?.length) return null;
  return (
    <section className="container-bq py-5 sm:py-7" aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-muted truncate text-sm">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => p?.playQueue(books.map(desc))} className="btn-primary !min-h-9 !px-3.5 !text-sm">
            <Icon name="play" size={14} filled /> Play all
          </button>
          {href && <Link href={href} prefetch={false} className="text-sm font-semibold text-brand-700 hover:underline max-sm:hidden">{viewAll}</Link>}
        </div>
      </div>
      <HScrollRow>
        {books.map((b) => <PlayTile key={b.slug} book={b} lang={lang} />)}
      </HScrollRow>
    </section>
  );
}
