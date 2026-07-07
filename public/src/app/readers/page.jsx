import Link from "next/link";
import { getLeaderboard, getRecentActivity } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Top Readers — Bookworm Leaderboard" };

const MEDALS = ["🥇", "🥈", "🥉"];

const ACTION = {
  read: "finished reading",
  reading: "started reading",
  want: "wants to read",
};

export default async function ReadersPage() {
  const [readers, activity] = await Promise.all([getLeaderboard(50), getRecentActivity(10)]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <p className="text-5xl">🏆</p>
        <h1 className="mt-3 text-3xl font-bold">Bookworm Leaderboard</h1>
        <p className="text-muted mt-1 text-sm">
          Earn points: +10 per book read · +5 per review · +2 per rating
        </p>
      </div>

      {activity.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold">📣 Community Activity</h2>
          <div className="mt-3 space-y-2">
            {activity.map((a, i) => (
              <div key={i} className="card flex items-center gap-3 p-3 text-sm hover:!translate-y-0">
                {a.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photo_url} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {(a.name || "R")[0].toUpperCase()}
                  </span>
                )}
                <p className="min-w-0 flex-1 truncate">
                  <Link href={`/readers/${a.user_id}`} className="font-semibold hover:text-brand-600">{a.name}</Link>
                  <span className="text-muted"> {ACTION[a.status] || "updated"} </span>
                  <Link href={`/books/${encodeURIComponent(a.book_slug)}`} className="font-medium hover:text-brand-600">
                    {a.title || a.book_slug}
                  </Link>
                  {a.rating && <span className="text-amber-400"> {"★".repeat(a.rating)}</span>}
                </p>
                <span className="text-muted shrink-0 text-xs">{a.updated_at?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {readers.length ? (
        <ol className="mt-10 space-y-3">
          {readers.map((r, i) => (
            <li key={r.id} className={`card flex items-center gap-4 p-4 hover:!translate-y-0 ${i < 3 ? "border-amber-400/40" : ""}`}>
              <span className="w-10 text-center text-xl font-bold">
                {MEDALS[i] || `#${i + 1}`}
              </span>
              {r.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo_url} alt="" className="h-11 w-11 rounded-full" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 font-bold text-white">
                  {(r.name || "R")[0].toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/readers/${r.id}`} className="block truncate font-semibold hover:text-brand-600">{r.name}</Link>
                <p className="text-muted text-xs">
                  {r.level.icon} {r.level.name} · {r.reads} read · {r.ratings} rated
                </p>
              </div>
              <span className="pill !text-sm">⚡ {r.points}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted mt-16 text-center">
          No readers yet — be the first! Sign in and mark a book as read.
        </p>
      )}
    </div>
  );
}
