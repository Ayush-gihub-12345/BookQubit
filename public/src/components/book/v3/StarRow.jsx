import Icon from "@/components/Icon";

// Stars with partial fill (4.6 shows four full stars and 60% of the fifth). Server-safe: no state.
export default function StarRow({ value = 0, size = 15 }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - n + 1));
        return (
          <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
            <Icon name="star" size={size} filled className="absolute inset-0 text-[var(--surface-3)]" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}><Icon name="star" size={size} filled className="stars" /></span>
          </span>
        );
      })}
    </span>
  );
}
