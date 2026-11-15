"use client";

// Listen controls for the home pick card: a round play button over the cover and a labelled button beside Summary.
// Both load the book's audio summary into the global player and toggle it.
import { useState } from "react";
import Icon from "@/components/Icon";
import { usePlayer } from "@/components/player/PlayerProvider";

function useListen(book) {
  const p = usePlayer();
  const [busy, setBusy] = useState(false);
  const active = p?.track?.id === `${book.slug}:${book.lang}:general`;
  const playing = active && p.playing;
  async function toggle(e) {
    e?.preventDefault(); e?.stopPropagation();
    if (!p || busy) return;
    if (active) { p.toggle(); return; }
    setBusy(true);
    await p.loadBook({ slug: book.slug, lang: book.lang, title: book.title, author: book.author, cover: book.cover_url });
    setBusy(false);
  }
  return { playing, busy, toggle };
}

export function CoverPlay({ book }) {
  const { playing, busy, toggle } = useListen(book);
  return (
    <button type="button" onClick={toggle} aria-label={`${playing ? "Pause" : "Listen to"} ${book.title}`} aria-busy={busy}
      className="absolute bottom-2 end-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-[var(--on-brand)] shadow-lg transition hover:scale-105">
      {busy ? <span className="spinner" /> : <Icon name={playing ? "pause" : "play"} size={17} filled />}
    </button>
  );
}

export function ListenButton({ book, label = "Listen" }) {
  const { playing, busy, toggle } = useListen(book);
  return (
    <button type="button" onClick={toggle} aria-busy={busy} className="btn-ghost btn-sm">
      {busy ? <span className="spinner" /> : <Icon name={playing ? "pause" : "headphones"} size={16} />}{playing ? "Pause" : label}
    </button>
  );
}
