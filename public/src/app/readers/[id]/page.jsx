import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile, levelFor } from "@/lib/repo";
import BookCover from "@/components/BookCover";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const profile = await getUserProfile(id);
  return profile
    ? { title: `${profile.user.name} — Reader Profile`, robots: { index: false } }
    : { title: "Reader Not Found", robots: { index: false } };
}

export default async function ReaderProfilePage({ params }) {
  const { id } = await params;
  const profile = await getUserProfile(id);
  if (!profile) notFound();
  const { user, shelf } = profile;

  const read = shelf.filter((s) => s.status === "read");
  const reading = shelf.filter((s) => s.status === "reading");
  const rated = shelf.filter((s) => s.rating);
  const reviews = shelf.filter((s) => s.review);
  const points = read.length * 10 + rated.length * 2 + reviews.length * 5;
  const level = levelFor(points);

  const GROUPS = [
    ["📖 Currently Reading", reading],
    ["✅ Read", read],
    ["🔖 Want to Read", shelf.filter((s) => s.status === "want")],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row">
        {user.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo_url} alt="" className="h-24 w-24 rounded-full ring-4 ring-brand-500/30" />
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-full bg-brand-600 text-4xl font-bold text-white">
            {(user.name || "R")[0].toUpperCase()}
          </span>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted text-sm">Reader since {user.created_at?.slice(0, 10)}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="pill">{level.icon} {level.name}</span>
            <span className="pill">⚡ {points} pts</span>
            <span className="pill">✅ {read.length} read</span>
            <span className="pill">✍️ {reviews.length} reviews</span>
          </div>
        </div>
      </div>

      {GROUPS.map(([title, items]) =>
        items.length ? (
          <div key={title}>
            <h2 className="mt-10 text-xl font-bold">{title} <span className="text-muted text-sm font-normal">({items.length})</span></h2>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
              {items.map((s) => (
                <Link key={s.book_slug} href={`/books/${encodeURIComponent(s.book_slug)}`} className="card group overflow-hidden">
                  <div className="aspect-[2/3] overflow-hidden bg-black/5">
                    <BookCover title={s.title || s.book_slug} author={s.author} cover_url={s.cover_url}
                      imgClassName="transition group-hover:scale-105" />
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-1 text-xs font-semibold">{s.title || s.book_slug}</p>
                    {s.rating && <p className="text-[10px] text-amber-400">{"★".repeat(s.rating)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null
      )}

      {!shelf.length && <p className="text-muted mt-16 text-center">This reader's shelf is empty so far.</p>}
    </div>
  );
}
