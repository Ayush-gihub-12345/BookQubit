import Link from "next/link";
import Icon from "@/components/Icon";
import NewDiscussionForm from "@/components/NewDiscussionForm";
import { listDiscussions, getRecentActivity } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Community" };

const ACTION = { read: "finished reading", reading: "started reading" };

export default async function CommunityPage({ searchParams }) {
  const sp = await searchParams;
  const [discussions, activity] = await Promise.all([listDiscussions(30), getRecentActivity(10)]);
  const presetTitle = sp.title ? decodeURIComponent(sp.title) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted mt-1 text-sm">Discussions, reviews, and activity from fellow readers</p>
        </div>
        <Link href="/leaderboard" className="btn-ghost text-sm">
          <Icon name="trophy" size={15} /> Bookworm Ranking
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-6">
            <NewDiscussionForm presetBookSlug={sp.book} presetBookTitle={presetTitle} autoOpen={Boolean(sp.book)} />
          </div>

          {discussions.length ? (
            <div className="space-y-3">
              {discussions.map((d) => (
                <Link key={d.id} href={`/community/${d.id}`} className="card flex gap-4 p-4 hover:!translate-y-0">
                  {d.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full" />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {(d.name || "R")[0].toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-1 font-semibold hover:text-brand-600">{d.title}</h2>
                    <p className="text-muted line-clamp-1 text-sm">{d.body}</p>
                    <p className="text-muted mt-1.5 text-xs">
                      {d.name} · {d.created_at?.slice(0, 10)}
                      {d.book_title && <> · on <span className="text-brand-600">{d.book_title}</span></>}
                    </p>
                  </div>
                  <div className="text-muted flex shrink-0 items-center gap-1.5 self-center text-sm">
                    <Icon name="bookOpen" size={14} /> {d.replies || 0}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center hover:!translate-y-0">
              <Icon name="feather" size={28} className="text-muted mx-auto" />
              <p className="mt-3 font-semibold">No discussions yet</p>
              <p className="text-muted mt-1 text-sm">Be the first to start a conversation.</p>
            </div>
          )}
        </div>

        <aside>
          <p className="text-muted mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
            <Icon name="trendingUp" size={13} /> Recent Activity
          </p>
          <div className="space-y-2.5">
            {activity.map((a, i) => (
              <div key={i} className="card p-3 text-sm hover:!translate-y-0">
                <p className="min-w-0 truncate">
                  <Link href={`/readers/${a.user_id}`} className="font-semibold hover:text-brand-600">{a.name}</Link>
                  <span className="text-muted"> {ACTION[a.status] || "reviewed"} </span>
                  <Link href={`/books/${encodeURIComponent(a.book_slug)}`} className="font-medium hover:text-brand-600">
                    {a.title || a.book_slug}
                  </Link>
                </p>
                {a.rating && <span className="text-xs text-amber-400">{"★".repeat(a.rating)}</span>}
                <p className="text-muted mt-0.5 text-[11px]">{a.updated_at?.slice(0, 10)}</p>
              </div>
            ))}
            {!activity.length && <p className="text-muted text-sm">No activity yet.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
