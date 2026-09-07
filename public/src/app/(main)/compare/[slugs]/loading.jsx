export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="skeleton mt-4 h-9 w-2/3 rounded-lg" />
      <div className="skeleton mt-3 h-4 w-full max-w-xl rounded" />

      <div className="mt-8 grid grid-cols-2 gap-6">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="card space-y-3 p-5 text-center hover:!translate-y-0">
            <div className="skeleton mx-auto aspect-[2/3] w-28 rounded-lg sm:w-32" />
            <div className="skeleton mx-auto h-4 w-2/3 rounded" />
          </div>
        ))}
      </div>

      <div className="skeleton mt-8 h-56 rounded-2xl" />
    </div>
  );
}
