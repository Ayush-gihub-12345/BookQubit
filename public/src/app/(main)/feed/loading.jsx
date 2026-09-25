export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <div className="bg-muted/20 h-8 w-40 animate-pulse rounded-lg" />
        <div className="bg-muted/20 mt-2 h-4 w-72 animate-pulse rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-muted/20 h-64 animate-pulse rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
