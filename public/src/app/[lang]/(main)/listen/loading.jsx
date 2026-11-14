export default function Loading() {
  return (
    <div aria-hidden>
      <div className="border-b border-[var(--line)]">
        <div className="container-bq py-6 sm:py-12">
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton mt-3 h-8 w-4/5 max-w-md rounded-lg sm:h-12" />
          <div className="skeleton mt-3 h-4 w-full max-w-xl rounded" />
        </div>
      </div>
      {[0, 1].map((s) => (
        <div key={s} className="container-bq py-5 sm:py-7">
          <div className="mb-3 flex items-end justify-between">
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-9 w-24 rounded-full" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-[min(156px,40vw)] shrink-0">
                <div className="skeleton aspect-[2/3] rounded-md" />
                <div className="skeleton mt-2 h-4 w-11/12 rounded" />
                <div className="skeleton mt-1.5 h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
