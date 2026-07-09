import Link from "next/link";
import Icon from "@/components/Icon";
import { getLeaderboard } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookworm Ranking — Top Readers" };

const MEDAL_STYLE = ["text-amber-400", "text-slate-400", "text-amber-700"];

export default async function LeaderboardPage() {
  const readers = await getLeaderboard(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
          <Icon name="trophy" size={26} />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Bookworm Ranking</h1>
        <p className="text-muted mx-auto mt-2 max-w-md text-sm">
          Ranked by real reading activity — books finished, reviews written, ratings given,
          and participation in discussions.
        </p>
        <div className="text-muted mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <span>+10 per book read</span>
          <span>+5 per review</span>
          <span>+3 per discussion started</span>
          <span>+2 per rating</span>
          <span>+1 per reply</span>
        </div>
      </div>

      {readers.length ? (
        <ol className="mt-10 space-y-2.5">
          {readers.map((r, i) => (
            <li key={r.id}>
              <Link href={`/readers/${r.id}`}
                className={`card flex items-center gap-4 p-4 hover:!translate-y-0 ${i < 3 ? "border-amber-400/40" : ""}`}>
                <span className={`flex w-9 shrink-0 items-center justify-center text-lg font-bold ${i < 3 ? MEDAL_STYLE[i] : "text-muted"}`}>
                  {i < 3 ? <Icon name="award" size={22} /> : `#${i + 1}`}
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
                    {r.level.icon} {r.level.name} · {r.reads} read · {r.reviews} reviews · {r.discussions} discussions
                  </p>
                </div>
                <span className="pill !text-sm">{r.points} pts</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted mt-16 text-center">
          No ranked readers yet — be the first. Sign in and mark a book as read.
        </p>
      )}
    </div>
  );
}
