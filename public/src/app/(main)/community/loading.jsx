export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="skeleton h-7 w-40 rounded-lg" />
          <div className="skeleton mt-2 h-4 w-56 rounded" />
        </div>
        <div className="skeleton h-9 w-36 rounded-full" />
      </div>
      <div className="card grid overflow-hidden hover:!translate-y-0 lg:grid-cols-[320px_1fr]" style={{ height: "70vh" }}>
        <div className="border-line space-y-1 border-b p-3 lg:border-b-0 lg:border-r">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2">
              <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden place-items-center lg:grid">
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
