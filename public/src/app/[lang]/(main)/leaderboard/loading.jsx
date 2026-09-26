export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <div className="skeleton mx-auto h-14 w-14 rounded-2xl" />
        <div className="skeleton mx-auto mt-4 h-8 w-64 rounded-lg" />
        <div className="skeleton mx-auto mt-3 h-4 w-96 max-w-full rounded" />
        <div className="mt-5 flex justify-center gap-2">
          <div className="skeleton h-9 w-32 rounded-full" />
          <div className="skeleton h-9 w-36 rounded-full" />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="space-y-2.5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-[68px] rounded-2xl" />
          ))}
        </div>
        <div className="skeleton hidden h-72 rounded-2xl lg:block" />
      </div>
    </div>
  );
}
