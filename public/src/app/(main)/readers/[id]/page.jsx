import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile, levelFor, getAchievements, getQuotesByUser } from "@/lib/repo";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";
import { FollowButton } from "@/components/FollowButton";

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
  const [achievements, quotes] = await Promise.all([getAchievements(user.id), getQuotesByUser(user.id, 6)]);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  const read = shelf.filter((s) => s.status === "read");
  const reading = shelf.filter((s) => s.status === "reading");
  const rated = shelf.filter((s) => s.rating);
  const reviews = shelf.filter((s) => s.review);
  const points = read.length * 10 + rated.length * 2 + reviews.length * 5;
  const level = levelFor(points);

  const GROUPS = [
    ["bookOpen", "Currently Reading", reading],
    ["check", "Read", read],
    ["bookmark", "Want to Read", shelf.filter((s) => s.status === "want")],
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
            <span className="pill"><Icon name={level.icon} size={13} /> {level.name}</span>
            <span className="pill"><Icon name="zap" size={13} /> {points} pts</span>
            <span className="pill"><Icon name="check" size={13} /> {read.length} read</span>
            <span className="pill"><Icon name="feather" size={13} /> {reviews.length} reviews</span>
          </div>
          <div className="mt-4 flex justify-center sm:justify-start">
            <FollowButton type="reader" id={user.id} label="Follow" />
          </div>
        </div>
      </div>

      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
            <Icon name="award" size={18} className="text-brand-600" /> Achievements <span className="text-muted text-sm font-normal">({unlockedAchievements.length})</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {unlockedAchievements.map((a) => (
              <span key={a.id} className="pill !bg-brand-600/10 !text-brand-600" title={a.desc}>
                <Icon name={a.icon} size={13} /> {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {quotes.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
            <Icon name="feather" size={18} className="text-brand-600" /> Favorite Quotes
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quotes.map((q) => (
              <Link key={q.id} href={`/books/${encodeURIComponent(q.book_slug)}`}
                className="card !border-brand-500/20 bg-brand-600/5 p-4 hover:!translate-y-0">
                <p className="whitespace-pre-line text-sm italic leading-relaxed">"{q.text}"</p>
                <p className="text-muted mt-2 text-xs">— {q.title || q.book_slug}{q.page ? `, p. ${q.page}` : ""}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {GROUPS.map(([icon, title, items]) =>
        items.length ? (
          <div key={title}>
            <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
              <Icon name={icon} size={18} className="text-brand-600" /> {title} <span className="text-muted text-sm font-normal">({items.length})</span>
            </h2>
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
