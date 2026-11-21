// Extra home blocks that give the page rhythm: a facts strip under the hero and a three-step "how it works" band.
// Server components, no data of their own: every number is passed in from real catalog facets.
import Link from "next/link";
import Icon from "@/components/Icon";

export function FactsStrip({ items }) {
  const shown = items.filter((i) => i.value);
  if (!shown.length) return null;
  return (
    <section className="container-bq pt-5 sm:pt-6" aria-label="At a glance">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {shown.map((i) => (
          <li key={i.label} className="card flex items-center gap-3 !rounded-2xl px-3.5 py-3 hover:!translate-y-0">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--on-brand)]" style={{ background: "linear-gradient(135deg, var(--color-brand-500), color-mix(in oklab, var(--color-brand-500) 62%, var(--color-qubit-500)))" }}><Icon name={i.icon} size={18} /></span>
            <span className="min-w-0"><b className="font-display block text-xl leading-none">{i.value}</b><span className="text-muted block truncate text-xs">{i.label}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HowItWorks({ lang }) {
  const steps = [
    { icon: "compass", title: "Discover", text: "Browse by genre, mood or country, or let Surprise me pick something great.", href: "/books", cta: "Browse books" },
    { icon: "lightbulb", title: "Get the key ideas", text: "Read or skim a short summary and the key ideas to decide if a book is for you.", href: "/books?sort=rating", cta: "Top rated" },
    { icon: "headphones", title: "Listen anywhere", text: "Press play on a cover, queue a whole shelf, set a sleep timer and go.", href: "/listen", cta: "Open Listen" },
    { icon: "bookmark", title: "Keep and share", text: "Shelve books, track progress, save quotes to MindSpace and join discussions.", href: "/library", cta: "Your library" },
  ];
  return (
    <section className="border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_55%,transparent)]" aria-labelledby="how-h">
      <div className="container-bq py-6 sm:py-9">
        <p className="eyebrow">How it works</p>
        <h2 id="how-h" className="mt-1 text-lg font-bold leading-snug sm:text-[1.5rem]">From “what should I read?” to “I’ve got this” in minutes</h2>
        <ol className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          {steps.map((s) => (
            <li key={s.title} className="card relative flex flex-col p-3.5 hover:!translate-y-0">
              <span className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-[var(--surface-2)] text-brand-700"><Icon name={s.icon} size={18} /></span>
              <b className="font-display text-[15px] leading-tight">{s.title}</b>
              <p className="text-muted mt-1 line-clamp-3 flex-1 text-[12.5px] leading-snug">{s.text}</p>
              <Link href={`/${lang}${s.href}`} prefetch={false} className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline">{s.cta}<Icon name="arrowRight" size={13} className="rtl:rotate-180" /></Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
