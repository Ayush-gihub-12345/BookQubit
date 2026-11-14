"use client";

// Book Page v3 hero: cover-tinted backdrop, tilting cover, title, authors, rating, at-a-glance facts, moods, and the
// one-tap actions (get the book, shelf split-button, summary, listen, like, wishlist, compare, share).
// Every figure is real: counts come from our own shelf data, and a fact with no value is simply not shown.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import BookCover from "@/components/BookCover";
import StarRow from "./StarRow";
import { useBookCtx } from "./BookActionsProvider";
import { usePlayer } from "@/components/player/PlayerProvider";

const SHELF = { want: "Want to read", reading: "Reading", read: "Read", paused: "Paused" };

function Fact({ icon, label, value }) {
  if (!value) return null;
  return (
    <li className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] px-3 py-2 backdrop-blur">
      <span className="text-[var(--muted)]"><Icon name={icon} size={15} /></span>
      <span><span className="block text-[10.5px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</span><b className="text-sm">{value}</b></span>
    </li>
  );
}

function Chip({ icon, label, on, onClick, href, tone, filled }) {
  const cls = `inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${on
    ? (tone === "marker" ? "border-[var(--color-marker)] text-[var(--color-marker)]" : "border-[var(--ring)] text-brand-700")
    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--fg)]"}`;
  const inner = <><Icon name={icon} size={16} filled={filled} />{label}</>;
  return href ? <Link href={href} prefetch={false} className={cls}>{inner}</Link> : <button type="button" aria-pressed={on} onClick={onClick} className={cls}>{inner}</button>;
}

/** Shelf split-button: the main part toggles "Want to read", the arrow opens every shelf. */
export function ShelfButton({ a, compact = false }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const saved = !!a.status;
  const size = compact ? "" : "btn-lg";
  return (
    <div ref={box} className="relative flex">
      <button type="button" disabled={a.busy} onClick={() => a.setShelf(saved ? a.status : "want", { toggle: false })}
        className={`${saved ? "btn-soft" : "btn-ghost"} ${size} !rounded-e-none`}>
        <Icon name={saved ? "check" : "bookmarkPlus"} size={18} className={saved ? "text-brand-700" : ""} /><span className={compact ? "max-[430px]:sr-only" : ""}>{SHELF[a.status] || "Want to read"}</span>
      </button>
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Choose shelf"
        className={`btn-ghost ${size} !rounded-s-none !border-s-0 !px-3`}><Icon name="chevronDown" size={18} /></button>
      {open && (
        <div role="menu" className={`panel animate-pop absolute z-30 w-56 p-1.5 ${compact ? "bottom-[calc(100%+8px)] start-0" : "start-0 top-[calc(100%+8px)]"}`}>
          {Object.entries(SHELF).map(([k, label]) => (
            <button key={k} type="button" role="menuitemradio" aria-checked={a.status === k} data-active={a.status === k} className="menu-item"
              onClick={() => { a.setShelf(k, { toggle: false }); setOpen(false); }}>{label}</button>
          ))}
          <Link href={`/${a.lang}/library`} prefetch={false} className="menu-item text-[var(--muted)]">+ Add to a custom shelf</Link>
          {saved && <button type="button" role="menuitem" className="menu-item text-[var(--color-marker)]" onClick={() => { a.removeFromShelf(); setOpen(false); }}>Remove from library</button>}
        </div>
      )}
    </div>
  );
}

function Cover3D({ book, editions }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
  };
  return (
    <div className="mx-auto w-[150px] sm:w-[220px] lg:w-full">
      <div ref={ref} onPointerMove={move} onPointerLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
        className="cover !rounded-[4px_14px_14px_4px] transition-transform duration-300 ease-out [box-shadow:0_2px_4px_rgb(0_0_0/.15),0_30px_60px_-12px_rgb(0_0_0/.45)] motion-reduce:transform-none">
        <BookCover title={book.title} author={book.author} cover_url={book.cover_url} priority />
      </div>
      {editions > 1 && <a href="#editions" className="mt-4 hidden text-center text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] sm:block">{editions} editions and translations</a>}
    </div>
  );
}

export default function BookHero({ book, crumbs, authors, rating, reading, facts, moods, summaryMinutes, editions = 0, hasSummary = true }) {
  const a = useBookCtx();
  const p = usePlayer();
  const [busy, setBusy] = useState(false);
  const trackId = `${book.slug}:${book.lang}:general`;
  const active = p?.track?.id === trackId;
  const playing = active && p.playing;
  async function listen() {
    if (!p || busy) return;
    if (active) { p.toggle(); return; }
    setBusy(true);
    await p.loadBook({ slug: book.slug, lang: book.lang, title: book.title, author: book.author, cover: book.cover_url });
    setBusy(false);
  }

  return (
    <div id="book-hero" className="relative isolate overflow-hidden border-b border-[var(--line)]">
      <div aria-hidden className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(70% 90% at 15% 0%, color-mix(in srgb, var(--color-brand-400) 30%, transparent), transparent 70%), radial-gradient(50% 70% at 100% 30%, color-mix(in srgb, var(--color-qubit-500, #6C83D9) 14%, transparent), transparent 70%), var(--bg)" }} />
      {book.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img aria-hidden alt="" src={book.cover_url} className="absolute -start-20 -top-20 -z-10 h-[140%] w-[60%] scale-125 object-cover opacity-[.14] blur-3xl" />
      )}
      <div className="container-bq pb-8 pt-4 sm:pb-14 sm:pt-6">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)] sm:mb-6">
          {crumbs.map((c, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {c.href ? <Link href={c.href} prefetch={false} className="hover:text-[var(--fg)]">{c.label}</Link> : <span className="truncate text-[var(--fg)]" aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
          <Cover3D book={book} editions={editions} />

          <div className="min-w-0 max-lg:text-center">
            <h1 className="font-display text-[1.9rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{book.title}</h1>
            <p className="mt-3 text-lg">
              <span className="text-[var(--muted)]">by </span>
              {authors.map((au, i) => (
                <span key={au.name}>{i > 0 && <span className="opacity-60">, </span>}
                  <Link href={au.href} prefetch={false} className="font-bold hover:text-brand-700">{au.name}</Link></span>
              ))}
              {book.publisherName && <span className="text-sm text-[var(--muted)]"> · {book.publisherHref ? <Link href={book.publisherHref} prefetch={false} className="hover:text-[var(--fg)]">{book.publisherName}</Link> : book.publisherName}</span>}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 max-lg:justify-center">
              {rating.value ? (
                <a href="#reviews" className="group flex items-center gap-2">
                  <span className="font-display text-4xl font-bold leading-none">{Number(rating.value).toFixed(1)}</span>
                  <span className="text-start"><StarRow value={rating.value} size={17} /><span className="block text-xs text-[var(--muted)] group-hover:text-[var(--fg)]">{rating.label}</span></span>
                </a>
              ) : <span className="text-sm text-[var(--muted)]">No ratings yet. Be the first.</span>}
              {reading > 0 && <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]"><Icon name="trendingUp" size={16} className="text-[var(--color-success)]" /><b className="text-[var(--fg)]">{reading.toLocaleString()}</b> reading now</span>}
            </div>

            <ul className="mt-5 flex flex-wrap gap-2 max-lg:justify-center" aria-label="At a glance">
              {facts.map((f) => <Fact key={f.label} {...f} />)}
            </ul>

            {moods.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 max-lg:justify-center">
                {moods.slice(0, 4).map((m) => <Link key={m.name} href={m.href} prefetch={false} className="badge badge-qubit !h-7 !px-3 !text-[12.5px]">{m.name}</Link>)}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2.5 max-lg:justify-center">
              {book.buyUrl && <a href={book.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-primary btn-lg max-sm:w-full"><Icon name="cart" size={19} />Get book</a>}
              <ShelfButton a={a} />
              {hasSummary && <a href="#summary" className="btn-ghost btn-lg max-sm:hidden"><Icon name="bookOpen" size={19} />{summaryMinutes ? `${summaryMinutes}-min summary` : "Summary"}</a>}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 max-lg:justify-center">
              <Chip on={playing} onClick={listen} icon={playing ? "pause" : "headphones"} label={playing ? "Pause" : busy ? "Loading…" : "Listen"} />
              <Chip on={a.liked} onClick={a.toggleLike} icon="heart" filled={a.liked} tone="marker" label={`${a.liked ? "Liked" : "Like"}${a.likeCount ? ` · ${a.likeCount}` : ""}`} />
              <Chip on={a.wishlisted} onClick={a.toggleWishlist} icon="sparkles" label={a.wishlisted ? "On wishlist" : "Wishlist"} />
              <Chip href={`/${a.lang}/compare?books=${book.slug}`} icon="gitCompare" label="Compare" />
              <Chip onClick={a.share} icon={a.shared ? "check" : "share"} label={a.shared ? "Link copied" : "Share"} />
            </div>

            {a.status === "reading" && (
              <div className="card mt-5 max-w-lg p-4 max-lg:mx-auto max-lg:text-start">
                <div className="flex items-center justify-between text-sm"><b>Your progress</b>
                  <span className="text-[var(--muted)]">{a.progress}%{book.pages ? ` · page ${Math.round((book.pages * a.progress) / 100)} of ${book.pages}` : ""}</span></div>
                <input aria-label="Reading progress" type="range" min={0} max={100} value={a.progress} onChange={(e) => a.saveProgress(Number(e.target.value))} className="accent-brand-600 mt-3 w-full" />
                {a.progress === 100 && <button type="button" className="btn-primary btn-sm mt-3" onClick={() => a.setShelf("read", { toggle: false })}><Icon name="check" size={15} />Mark as read</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
