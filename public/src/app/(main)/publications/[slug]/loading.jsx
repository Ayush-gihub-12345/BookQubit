export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="card p-8 hover:!translate-y-0">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="skeleton h-24 w-24 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-8 w-56 rounded-lg" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
