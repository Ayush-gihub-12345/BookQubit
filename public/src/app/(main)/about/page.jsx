import Logo from "@/components/Logo";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="mb-6"><Logo size={36} /></div>
      <h1 className="text-3xl font-bold">About BookQubit</h1>
      <p className="text-muted mt-4 leading-relaxed">
        BookQubit is a reading platform built around one idea: help people find their next great
        book faster, and give them a real reading life around it — shelves, ratings, reviews,
        reading goals, and a community of fellow readers — instead of just a static catalog.
      </p>
      <p className="text-muted mt-4 leading-relaxed">
        Every book page includes a summary and key takeaways so you can decide in minutes whether
        a book is right for you, plus community ratings, reviews, and mood tags from real readers.
      </p>
      <p className="text-muted mt-4 leading-relaxed">
        BookQubit is available in multiple languages and is actively growing — new books, authors,
        and features are added regularly.
      </p>
    </div>
  );
}
