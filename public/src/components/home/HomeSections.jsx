// Homepage blocks (UI v2.1), as server components: QuickHub, DiscoverStrip, QuoteOfTheDay, CollectionCard, AuthorCard,
// TagCloud, NewsletterBanner. Only the interactive bits (quote actions, newsletter form, Surprise) are client components.
import Link from "next/link";
import Icon from "@/components/Icon";
import NewsletterForm from "@/components/NewsletterForm";
import QuoteActions from "./QuoteActions";
import { SurpriseLink } from "@/components/surprise/SurpriseMe";

const L = (lang, h) => `/${lang}${h}`;

export function QuickHub({ lang, labels, counts }) {
  const items = [
    { k: "library", t: labels.library, d: counts?.books ? `${counts.books.toLocaleString()} ${labels.books}` : labels.libraryHint, h: "/books", i: "book", c: "#E0AE34" },
    { k: "shelf", t: labels.shelf, d: labels.shelfHint, h: "/library", i: "bookmark", c: "#8B6CFF" },
    { k: "comics", t: labels.comics, d: counts?.comics ? `${counts.comics}` : labels.comicsHint, h: "/comics", i: "layers", c: "#D9577A" },
    { k: "community", t: labels.community, d: labels.communityHint, h: "/community", i: "users", c: "#4FA3C7" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ k, t, d, h, i, c }) => (
        <li key={k}>
          <Link href={L(lang, h)} prefetch={false} className="card card-hover group flex items-center gap-3.5 p-4 sm:p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-[var(--shadow-1)]" style={{ background: `linear-gradient(140deg, ${c}, color-mix(in srgb, ${c} 60%, #000))` }}><Icon name={i} size={22} /></span>
            <span className="min-w-0"><b className="block">{t}</b><span className="block truncate text-sm text-[var(--muted)]">{d}</span></span>
            <Icon name="arrowRight" size={18} className="ms-auto hidden shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-1 rtl:rotate-180 sm:block" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** "Discover your next great read": Browse, Surprise me and the ranking as one strong band. */
export function DiscoverStrip({ lang, labels }) {
  return (
    <div className="hero-glow card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="flex-1">
        <h2 className="text-2xl font-bold sm:text-3xl">{labels.title}</h2>
        <p className="mt-1 text-[var(--muted)]">{labels.sub}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={L(lang, "/books")} className="btn-ghost"><Icon name="compass" size={18} />{labels.browse}</Link>
        <SurpriseLink locale={lang} className="btn-primary"><Icon name="dice" size={18} />{labels.surprise}</SurpriseLink>
        <Link href={L(lang, "/leaderboard")} prefetch={false} className="btn-ghost"><Icon name="trophy" size={18} />{labels.ranking}</Link>
      </div>
    </div>
  );
}

export function QuoteOfTheDay({ lang, quote, label }) {
  return (
    <figure id="quote" className="card relative overflow-hidden px-6 py-10 text-center sm:px-14 sm:py-14">
      <span aria-hidden className="font-display pointer-events-none absolute -top-6 start-6 text-[10rem] leading-none text-brand-400/20">“</span>
      <p className="eyebrow">{label}</p>
      <blockquote className="font-display mx-auto mt-5 max-w-3xl text-2xl italic leading-snug sm:text-[2rem]">{quote.text}</blockquote>
      <figcaption className="mt-5 text-[var(--muted)]">
        {quote.author && <b className="text-[var(--fg)]">{quote.author}</b>}
        {quote.bookTitle && <>{quote.author ? " · " : ""}<Link href={L(lang, `/books/${encodeURIComponent(quote.bookSlug)}`)} prefetch={false} className="text-brand-700 hover:underline">{quote.bookTitle}</Link></>}
      </figcaption>
      <QuoteActions quote={quote} />
    </figure>
  );
}

// Collection tiles get a stable colour from the name (no extra data needed), so a rail of them doesn't look uniform.
const PALETTE = ["#6C83D9", "#D9577A", "#2F8F5B", "#B8823A", "#8B6CFF", "#0AA2C0", "#C9521B"];
const colorFor = (name) => PALETTE[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % PALETTE.length];

export function CollectionCard({ lang, c, booksLabel }) {
  const color = colorFor(c.name);
  return (
    <Link href={L(lang, `/collections/${encodeURIComponent(c.name)}`)} prefetch={false}
      className="card-hover group relative flex h-44 w-[240px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] p-5 text-white"
      style={{ background: `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 35%, #000))` }}>
      <Icon name="layers" size={64} className="absolute end-3 top-3 opacity-20 transition-transform duration-300 group-hover:scale-110" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
      <span className="relative">
        <b className="font-display block text-xl leading-tight">{c.name}</b>
        <span className="text-sm opacity-90">{c.count} {booksLabel}</span>
      </span>
    </Link>
  );
}

export function TagCloud({ lang, tags }) {
  if (!tags.length) return null;
  const max = Math.max(...tags.map((t) => t.count));
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t.name}>
          <Link href={L(lang, `/books?tag=${encodeURIComponent(t.name)}`)} prefetch={false} className="pill" style={{ fontSize: `${0.8 + (t.count / max) * 0.25}rem` }}>
            {t.name}<span className="text-[var(--muted)] opacity-80">{t.count.toLocaleString()}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NewsletterBanner({ lang, labels }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] p-7 sm:p-10"
      style={{ background: "radial-gradient(60% 120% at 100% 0%, color-mix(in srgb, var(--color-qubit-500) 22%, transparent), transparent 60%), linear-gradient(135deg, color-mix(in srgb, var(--color-brand-400) 16%, var(--surface)), var(--surface))" }}>
      <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow !text-[var(--color-qubit-500)]">{labels.kicker}</p>
          <h2 className="mt-2 text-3xl font-bold">{labels.title}</h2>
          <p className="mt-2 text-[var(--muted)]">{labels.sub}</p>
        </div>
        <NewsletterForm lang={lang} labels={{ placeholder: labels.placeholder, button: labels.button, success: labels.success }} />
      </div>
    </div>
  );
}
