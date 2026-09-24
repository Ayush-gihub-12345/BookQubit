import Link from "next/link";
import Icon from "@/components/Icon";
import { getLeaderboard, getPopularReaders, facets } from "@/lib/repo";
import { FollowButton } from "@/components/FollowButton";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Bookworm Ranking — Top Readers",
  description: "See who's reading the most on BookQubit — the Bookworm Ranking leaderboard of the platform's most active readers.",
  alternates: { canonical: "/leaderboard" },
};

const MEDAL_STYLE = ["text-amber-400", "text-muted", "text-amber-700"];
const CURRENT_YEAR = new Date().getFullYear();

export default async function LeaderboardPage({ searchParams }) {
  const lang = await getLang();
  const _ = t(lang);
  const sp = await searchParams;
  const mode = sp.mode === "popular" ? "popular" : "activity";
  const year = sp.year || "";
  const minBooks = sp.minBooks || "";
  const genre = sp.genre || "";

  const [readers, popular, f] = await Promise.all([
    mode === "activity" ? getLeaderboard({ limit: 50, year: year ? Number(year) : undefined, minBooks, genre }) : Promise.resolve([]),
    mode === "popular" ? getPopularReaders(50) : Promise.resolve([]),
    facets("en"),
  ]);

  const withParam = (patch) => {
    const params = new URLSearchParams({ mode, year, minBooks, genre, ...patch });
    for (const [k, v] of [...params]) if (!v) params.delete(k);
    return `/leaderboard?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
          <Icon name="trophy" size={26} />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{_("navBookwormRanking")}</h1>
        <p className="text-muted mx-auto mt-2 max-w-lg text-sm">
          {_("leaderboardSubtitle")}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={withParam({ mode: "activity" })}
            className={`pill !text-sm ${mode === "activity" ? "!bg-brand-600 !text-white" : ""}`}>
            <Icon name="trendingUp" size={14} /> {_("topReadersTab")}
          </Link>
          <Link href={withParam({ mode: "popular" })}
            className={`pill !text-sm ${mode === "popular" ? "!bg-brand-600 !text-white" : ""}`}>
            <Icon name="heart" size={14} /> {_("popularReadersTab")}
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          {mode === "activity" ? (
            readers.length ? (
              <ol className="space-y-2.5">
                {readers.map((r, i) => (
                  <li key={r.id}>
                    <div className={`card flex flex-col gap-3 p-4 hover:!translate-y-0 sm:flex-row sm:items-center ${i < 3 && !year && !minBooks && !genre ? "border-amber-400/40" : ""}`}>
                      <Link href={`/readers/${r.slug || r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                        <span className={`flex w-9 shrink-0 items-center justify-center text-lg font-bold ${i < 3 ? MEDAL_STYLE[i] : "text-muted"}`}>
                          {i < 3 ? <Icon name="award" size={22} /> : `#${i + 1}`}
                        </span>
                        {r.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.photo_url} alt="" className="h-11 w-11 shrink-0 rounded-full" />
                        ) : (
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
                            {(r.name || "R")[0].toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{r.name}</p>
                          <p className="text-muted text-xs">
                            <Icon name={r.level.icon} size={11} className="inline" /> {r.level.name} · {_("leaderboardBooksRead", { n: r.reads })}
                            {r.favoriteGenre && _("lovesGenreSuffix", { genre: r.favoriteGenre })}
                          </p>
                          {r.badges.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {r.badges.map((b) => (
                                <span key={b} className="pill !bg-brand-600/10 !px-2 !py-0.5 !text-[10px] !text-brand-600">{b}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="pill !text-sm">{_("ptsSuffix", { n: r.points })}</span>
                        <FollowButton type="reader" id={r.id} label={_("followLabel")} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted mt-16 text-center">
                {_("noReadersMatchFilters")}
              </p>
            )
          ) : popular.length ? (
            <ol className="space-y-2.5">
              {popular.map((r, i) => (
                <li key={r.id}>
                  <div className="card flex items-center gap-4 p-4 hover:!translate-y-0">
                    <Link href={`/readers/${r.slug || r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                      <span className={`flex w-9 shrink-0 items-center justify-center text-lg font-bold ${i < 3 ? MEDAL_STYLE[i] : "text-muted"}`}>
                        {i < 3 ? <Icon name="award" size={22} /> : `#${i + 1}`}
                      </span>
                      {r.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.photo_url} alt="" className="h-11 w-11 shrink-0 rounded-full" />
                      ) : (
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
                          {(r.name || "R")[0].toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{r.name}</p>
                        <p className="text-muted text-xs">{_("followersCountLabel", { n: r.followers })}</p>
                      </div>
                    </Link>
                    <FollowButton type="reader" id={r.id} label={_("followLabel")} />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted mt-16 text-center">{_("noOneFollowedYet")}</p>
          )}
        </div>

        {/* Filters — only relevant to the activity-based ranking */}
        {mode === "activity" && (
          <aside className="card h-fit space-y-5 p-5 hover:!translate-y-0">
            <p className="text-sm font-bold">{_("filterReadersHeading")}</p>
            <form action="/leaderboard" className="space-y-4">
              <input type="hidden" name="mode" value="activity" />
              <div>
                <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">{_("yearLabel")}</label>
                <select name="year" defaultValue={year} className="input w-full text-sm">
                  <option value="">{_("anyYearOption")}</option>
                  {Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">{_("minBooksReadLabel")}</label>
                <input type="number" name="minBooks" min="1" defaultValue={minBooks} placeholder={_("minBooksPlaceholder")} className="input w-full text-sm" />
              </div>
              <div>
                <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">{_("favoriteGenreLabel")}</label>
                <select name="genre" defaultValue={genre} className="input w-full text-sm">
                  <option value="">{_("anyGenreOption")}</option>
                  {f.categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full text-sm">{_("applyFiltersButton")}</button>
              {(year || minBooks || genre) && (
                <Link href="/leaderboard" className="text-muted block text-center text-xs hover:text-brand-600">{_("clearFiltersLink")}</Link>
              )}
            </form>
          </aside>
        )}
      </div>

      <div className="text-muted mt-10 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        <span>{_("pointsPerBookRead")}</span>
        <span>{_("pointsPerReview")}</span>
        <span>{_("pointsPerDiscussion")}</span>
        <span>{_("pointsPerRating")}</span>
        <span>{_("pointsPerReply")}</span>
      </div>
    </div>
  );
}
