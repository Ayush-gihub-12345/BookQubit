export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <div className="skeleton aspect-[2/3] rounded-2xl" />
          <div className="mt-5 space-y-3">
            <div className="skeleton h-11 rounded-xl" />
            <div className="skeleton h-11 rounded-xl" />
          </div>
        </div>
        <div>
          <div className="skeleton h-9 w-2/3 rounded-lg" />
          <div className="skeleton mt-3 h-4 w-1/3 rounded" />
          <div className="mt-5 flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
          <div className="mt-8 flex gap-2.5">
            <div className="skeleton h-11 w-32 rounded-full" />
            <div className="skeleton h-11 w-28 rounded-full" />
            <div className="skeleton h-11 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
