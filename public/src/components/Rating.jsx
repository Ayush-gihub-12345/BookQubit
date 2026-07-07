export default function Rating({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber-400" aria-hidden>★</span>
      <span className="font-medium">{Number(value).toFixed(1)}</span>
    </span>
  );
}
