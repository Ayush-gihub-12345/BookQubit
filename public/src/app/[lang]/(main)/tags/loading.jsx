export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="skeleton h-8 w-28 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-52 rounded" />
      <div className="mt-8 flex flex-wrap gap-3">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="skeleton h-9 rounded-full" style={{ width: 60 + (i % 5) * 18 }} />
        ))}
      </div>
    </div>
  );
}
