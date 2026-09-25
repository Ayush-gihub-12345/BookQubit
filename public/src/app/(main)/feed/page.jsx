import ForYou from "@/components/feed/ForYou";

export const metadata = {
  title: "For You — BookQubit",
  description: "Personalized book recommendations and reading feed.",
};

export default function FeedPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          For You
        </h1>
        <p className="text-muted mt-1 text-sm">
          Recommended books and updates, tailored to your reading.
        </p>
      </header>

      <ForYou />
    </main>
  );
}
