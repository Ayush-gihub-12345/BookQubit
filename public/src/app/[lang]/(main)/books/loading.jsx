export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="skeleton h-9 w-56 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-24 rounded" />
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[2/3] rounded-2xl" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded" />
            <div className="skeleton mt-2 h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
