// Renders the real cover image, or a designed placeholder "cover" with the
// book's title and author on a gradient picked deterministically from the title.
const GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#4a7ba6)",
  "linear-gradient(135deg,#5f1e3a,#a64a6b)",
  "linear-gradient(135deg,#3a5f1e,#6ba64a)",
  "linear-gradient(135deg,#4a1e5f,#8a4aa6)",
  "linear-gradient(135deg,#5f4a1e,#a6894a)",
  "linear-gradient(135deg,#1e5f5a,#4aa69e)",
  "linear-gradient(135deg,#37474f,#78909c)",
  "linear-gradient(135deg,#4e342e,#a1887f)",
];

const hash = (s = "") => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function BookCover({ title, author, cover_url, className = "", imgClassName = "" }) {
  if (cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={cover_url} alt={`${title} cover`} loading="lazy"
        className={`h-full w-full object-cover ${imgClassName}`} />
    );
  }
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden p-[8%] text-white ${className}`}
      style={{ background: GRADIENTS[hash(title) % GRADIENTS.length], containerType: "inline-size" }}
      role="img"
      aria-label={`${title} cover`}
    >
      {/* spine + sheen */}
      <span className="absolute inset-y-0 left-0 w-[6%] bg-black/25" />
      <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />
      <span className="mt-[10%] block border-y border-white/40 py-[6%] text-center font-[var(--font-display)] font-bold leading-snug [font-size:clamp(10px,10cqw,20px)]">
        <span className="line-clamp-4">{title}</span>
      </span>
      {author && (
        <span className="block truncate pl-[8%] text-center italic opacity-90 [font-size:clamp(8px,7cqw,13px)]">
          {author}
        </span>
      )}
    </div>
  );
}
