// More home content that never depends on catalog size: ready-made shelves to start from, and honest answers to the
// questions a first-time visitor has. Server components; every link is a route that always has content.
import Link from "next/link";
import Icon from "@/components/Icon";

export function StartShelves({ lang }) {
  const tiles = [
    { icon: "trophy", title: "Bestsellers", text: "What most readers buy", href: "/books?shelf=bestsellers", from: "#E0AE34", to: "#C9521B" },
    { icon: "star", title: "Top rated", text: "4.5 stars and above", href: "/books?shelf=top", from: "#8B6CFF", to: "#D9577A" },
    { icon: "feather", title: "Classics", text: "Written before 1980", href: "/books?shelf=classics", from: "#2F8F5B", to: "#0AA2C0" },
    { icon: "sparkles", title: "New arrivals", text: "Just added to the library", href: "/books?sort=new", from: "#D9577A", to: "#C9521B" },
    { icon: "headphones", title: "Listen now", text: "Audio summaries, one tap", href: "/listen", from: "#4FA3C7", to: "#6C83D9" },
    { icon: "layers", title: "Comics", text: "Comics and manga", href: "/comics", from: "#B8823A", to: "#8B6CFF" },
  ];
  return (
    <section className="container-bq py-6 sm:py-9" aria-labelledby="start-h">
      <p className="eyebrow">Not sure where to begin?</p>
      <h2 id="start-h" className="mt-1.5 text-2xl font-bold sm:text-[1.75rem]">Start with a shelf</h2>
      <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.title}>
            <Link href={`/${lang}${t.href}`} prefetch={false} className="card-hover group relative flex h-full min-h-[104px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] p-4 text-white sm:min-h-[120px] sm:p-5"
              style={{ background: `linear-gradient(140deg, ${t.from}, ${t.to})` }}>
              <Icon name={t.icon} size={54} className="absolute -end-1 -top-1 opacity-20 transition-transform duration-300 group-hover:scale-110 rtl:end-auto rtl:start-0" />
              <b className="font-display relative text-lg leading-tight sm:text-xl">{t.title}</b>
              <span className="relative text-[13px] opacity-90">{t.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const FAQ = [
  ["What is a key-idea summary?", "A short, plain-language summary of a book's main ideas. It helps you decide whether to read the whole book, and remember it afterwards. It never replaces the book."],
  ["Can I listen instead of reading?", "Yes. Press play on any cover and the summary is read aloud, using generated audio where it exists and your device's voice otherwise. Queue a whole shelf and keep browsing."],
  ["Is BookQubit free?", "Browsing, summaries, listening, shelves and quotes are free. Buy links go to the store; if you buy through them we may earn a commission, which never changes ratings or rankings."],
  ["Which languages are supported?", "The site works in 21 languages, including right-to-left scripts. A book appears in a language when it has an edition in that language."],
  ["Where do ratings and reviews come from?", "From readers like you. Ratings, moods and reviews are what people record on their own shelves. We show a rating only when there is a real one."],
];

export function HomeFaq() {
  return (
    <section className="container-bq py-6 sm:py-9" aria-labelledby="faq-h">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2 id="faq-h" className="mt-1.5 text-2xl font-bold sm:text-[1.75rem]">Questions, answered</h2>
          <p className="text-muted mt-2 text-sm leading-relaxed">The short version of how BookQubit works and what it costs.</p>
        </div>
        <div className="divide-y divide-[var(--line)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)]">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{q}</span>
                <Icon name="chevronDown" size={17} className="text-[var(--muted)] transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-muted px-5 pb-4 text-[15px] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
