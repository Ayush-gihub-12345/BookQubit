export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row">
        <div className="skeleton h-24 w-24 shrink-0 rounded-full" />
        <div className="space-y-3">
          <div className="skeleton h-7 w-40 rounded-lg" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="skeleton mt-10 h-6 w-32 rounded" />
      <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
