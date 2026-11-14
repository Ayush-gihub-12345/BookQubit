"use client";

// Slim bar that slides in under the site header once the hero has scrolled away: cover, title, rating, scroll-spy section
// tabs and the buy button. Tabs only list sections this book really has.
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import BookCover from "@/components/BookCover";

export default function StickyBookBar({ book, rating, sections, buyHref }) {
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState(sections[0]?.[0]);

  useEffect(() => {
    const hero = document.getElementById("book-hero");
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    if (hero) io.observe(hero);
    const spy = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) spy.observe(el); });
    return () => { io.disconnect(); spy.disconnect(); };
  }, [sections]);

  return (
    <div aria-hidden={!stuck} inert={!stuck}
      className={`glass fixed inset-x-0 top-16 z-40 hidden border-b border-[var(--line)] transition-all duration-300 lg:block ${stuck ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}>
      <div className="container-bq flex h-14 items-center gap-3">
        <span className="cover !rounded-[3px] block w-7 shrink-0"><BookCover title={book.title} author={book.author} cover_url={book.cover_url} /></span>
        <div className="min-w-0 shrink-0 sm:max-w-[240px]">
          <b className="block truncate text-sm">{book.title}</b>
          {rating ? <span className="flex items-center gap-1 text-xs text-[var(--muted)]"><Icon name="star" size={11} filled className="stars" />{Number(rating).toFixed(1)} · {book.author}</span> : null}
        </div>
        <nav aria-label="Sections" className="mx-auto flex gap-1">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${active === id ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}>{label}</a>
          ))}
        </nav>
        {buyHref && <a href={buyHref} target="_blank" rel="noopener noreferrer sponsored" className="btn-primary btn-sm ms-auto shrink-0"><Icon name="cart" size={15} />Get book</a>}
      </div>
    </div>
  );
}
