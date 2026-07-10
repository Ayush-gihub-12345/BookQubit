import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getPlatformStats } from "@/lib/repo";

export const metadata = {
  title: "About",
  description: "BookQubit is a reading platform for finding your next great book faster — summaries, key takeaways, community reviews, reading tracking, and a Bookworm Ranking, in 21 languages.",
  alternates: { canonical: "/about" },
};

const FEATURES = [
  { icon: "bookOpen", title: "5-minute summaries", desc: "Every book comes with a concise summary and key takeaways, so you can decide in minutes whether it's worth your time." },
  { icon: "star", title: "Real community reviews", desc: "Ratings, written reviews, and mood/pace tags from actual readers — not just a star average with no context." },
  { icon: "bookmark", title: "A shelf that remembers", desc: "Track what you want to read, what you're reading now (with progress), and what you've finished — all synced to your account." },
  { icon: "trophy", title: "Bookworm Ranking", desc: "Earn points for books read, reviews written, and community participation. Climb the leaderboard as you read." },
  { icon: "users", title: "Community discussions", desc: "Start a discussion tied to any book, reply to other readers, and build a public reading profile." },
  { icon: "globe", title: "21 languages", desc: "The entire interface — navigation, search, book pages, dashboard — is translated, including major Indian languages." },
];

export default async function AboutPage() {
  const stats = await getPlatformStats().catch(() => null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-6 flex justify-center"><Logo size={44} /></div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">About BookQubit</h1>
        <p className="text-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
          A reading platform built around one idea: help you find your next great book faster,
          and give you a real reading life around it — not just a static catalog.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[[stats.books, "Books"], [stats.authors, "Authors"], [stats.reviews, "Reader Reviews"], [stats.readers, "Readers"]].map(([n, label]) => (
            <div key={label} className="card p-5 text-center hover:!translate-y-0">
              <p className="text-3xl font-extrabold text-brand-600">{n.toLocaleString()}+</p>
              <p className="text-muted mt-1 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mission */}
      <div className="mx-auto mt-14 max-w-2xl">
        <h2 className="text-2xl font-bold">Why we built this</h2>
        <p className="text-muted mt-3 leading-relaxed">
          Most book sites are either a static catalog with no depth, or a review platform stuck in
          the past decade with cluttered pages and no real discovery tools. We wanted something
          different: a platform where you can decide about a book in five minutes, track your
          reading honestly, and actually connect with other readers — not just leave a star rating
          into the void.
        </p>
        <p className="text-muted mt-3 leading-relaxed">
          Every book page is built around getting you to a decision fast: a real summary, key
          takeaways, community sentiment (ratings, moods, pace), and a direct path to buy or listen
          — followed by tools to track your progress and write your own review once you've read it.
        </p>
      </div>

      {/* Feature grid */}
      <div className="mt-14">
        <h2 className="text-center text-2xl font-bold">What you can do here</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 hover:!translate-y-0">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
                <Icon name={f.icon} size={18} />
              </span>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="text-muted mt-1.5 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Growing */}
      <div className="tint-brand mx-auto mt-14 max-w-2xl rounded-2xl p-6 text-center">
        <p className="font-semibold text-brand-600">Actively growing</p>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          BookQubit is available in 21 languages — including English, Hindi, Bengali, Telugu,
          Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, and Urdu, alongside Spanish,
          French, German, Portuguese, Italian, Russian, Chinese, Japanese, Korean, and Arabic — and
          new books, authors, and features are added regularly.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-14 text-center">
        <h2 className="text-2xl font-bold">Ready to find your next book?</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/books" className="btn-primary">Browse Books</Link>
          <Link href="/community" className="btn-ghost">Join the Community</Link>
        </div>
      </div>
    </div>
  );
}
