import Icon from "@/components/Icon";

// At-a-glance strip under the title (inspired by how summary apps lead with "what do I get?"): rating, how long the
// summary takes, how many key ideas, and the formats on offer. Every figure is derived from real data; a tile with
// no honest number is left out rather than filled with a placeholder.
export default function BookStats({ rating, minutes, ideas, hasAudio = true }) {
  const tiles = [
    rating ? { icon: "star", value: Number(rating).toFixed(1), label: "Rating", filled: true } : null,
    minutes ? { icon: "clock", value: `${minutes} min`, label: "Summary" } : null,
    ideas ? { icon: "layers", value: String(ideas), label: ideas === 1 ? "Key idea" : "Key ideas" } : null,
    { icon: hasAudio ? "headphones" : "book", value: hasAudio ? "Audio + text" : "Text", label: "Formats" },
  ].filter(Boolean);

  return (
    <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="card flex items-center gap-3 !rounded-xl px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-brand-700"><Icon name={t.icon} size={17} filled={t.filled} /></span>
          <div className="min-w-0">
            <dd className="truncate text-sm font-bold leading-tight">{t.value}</dd>
            <dt className="text-muted truncate text-xs">{t.label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}
