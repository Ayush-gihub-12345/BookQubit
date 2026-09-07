export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row sm:items-start">
        <div className="skeleton h-32 w-32 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-8 w-52 rounded-lg" />
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-9 w-32 rounded-full" />
            <div className="skeleton h-9 w-28 rounded-full" />
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
