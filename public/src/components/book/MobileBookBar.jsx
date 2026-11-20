"use client";

// Phone-only action bar: once the hero has scrolled away, the three things a reader came to do stay one tap away:
// shelf the book, listen, get it. Sits above the tab bar, and above the mini player when one is open.
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { ShelfButton } from "@/components/book/v3/BookHero";
import { useBookCtx } from "@/components/book/v3/BookActionsProvider";
import { usePlayer } from "@/components/player/PlayerProvider";

export default function MobileBookBar({ book, buyHref }) {
  const p = usePlayer();
  const a = useBookCtx();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const id = `${book.slug}:${book.lang}:general`;
  const active = p?.track?.id === id;
  const playing = active && p.playing;
  async function listen() {
    if (!p || busy) return;
    if (active) { p.toggle(); return; }
    setBusy(true);
    await p.loadBook({ slug: book.slug, lang: book.lang, title: book.title, author: book.author, cover: book.cover_url });
    setBusy(false);
  }

  return (
    <div aria-hidden={!show} inert={!show}
      className={`fixed inset-x-0 z-[34] px-3 transition-all duration-300 lg:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      style={{ bottom: p?.track ? "calc(9.6rem + env(safe-area-inset-bottom))" : "calc(5.6rem + env(safe-area-inset-bottom))" }}>
      <div className="bg-[var(--surface)] mx-auto flex max-w-md items-center gap-2 rounded-full border border-[var(--line)] p-1.5 shadow-[var(--shadow-2)]">
        {a && <ShelfButton a={a} compact />}
        <button type="button" onClick={listen} aria-busy={busy} aria-label={playing ? "Pause" : "Listen"} className="btn-icon !border-transparent">
          {busy ? <span className="spinner" /> : <Icon name={playing ? "pause" : "headphones"} size={18} />}
        </button>
        {buyHref && <a href={buyHref} target="_blank" rel="noopener noreferrer sponsored" className="btn-primary !min-h-10 min-w-0 flex-1 !px-4 !text-sm"><Icon name="cart" size={16} />Get book</a>}
      </div>
    </div>
  );
}
