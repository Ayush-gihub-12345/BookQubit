import { getLeaderboard } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Top Readers — Bookworm Leaderboard" };

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function ReadersPage() {
  const readers = await getLeaderboard(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <p className="text-5xl">🏆</p>
        <h1 className="mt-3 text-3xl font-bold">Bookworm Leaderboard</h1>
        <p className="text-muted mt-1 text-sm">
          Earn points: +10 per book read · +5 per review · +2 per rating
        </p>
      </div>

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
                <p className="truncate font-semibold">{r.name}</p>
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
