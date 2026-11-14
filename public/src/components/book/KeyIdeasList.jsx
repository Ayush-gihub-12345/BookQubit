import Translated from "@/components/Translated";

// "Summary of N key ideas": a numbered table of contents for the book's takeaways, so a reader can judge the book at a
// glance before committing to the full summary. Each idea is a plain sentence from the stored/generated summary.
export default function KeyIdeasList({ ideas, title = "Key ideas" }) {
  if (!ideas?.length) return null;
  return (
    <section id="takeaways" aria-labelledby="ideas-h" className="mt-8 scroll-mt-32">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ideas-h" className="text-lg font-bold sm:text-xl">{title}</h2>
        <p className="text-muted text-sm">{ideas.length} {ideas.length === 1 ? "idea" : "ideas"}</p>
      </div>
      <ol className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)]">
        {ideas.slice(0, 10).map((idea, i) => (
          <li key={i} className="flex items-start gap-3.5 px-4 py-3.5">
            <span aria-hidden className="font-display w-7 shrink-0 text-2xl font-bold leading-none text-brand-400">{i + 1}</span>
            <p className="min-w-0 text-[15px] leading-snug"><Translated text={idea} /></p>
          </li>
        ))}
      </ol>
    </section>
  );
}
