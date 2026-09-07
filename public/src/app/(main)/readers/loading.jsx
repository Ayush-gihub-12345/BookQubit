export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton h-8 w-32 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-56 rounded" />
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-9 w-32 rounded-full" />
        <div className="skeleton h-9 w-36 rounded-full" />
      </div>
      <div className="mt-6 space-y-2.5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-[68px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
