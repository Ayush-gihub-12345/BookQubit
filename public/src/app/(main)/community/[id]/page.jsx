import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import ReplyForm from "@/components/ReplyForm";
import { getDiscussion } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const thread = await getDiscussion(id);
  return thread ? { title: thread.title } : { title: "Discussion Not Found" };
}

export default async function DiscussionPage({ params }) {
  const { id } = await params;
  const thread = await getDiscussion(id);
  if (!thread) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/community" className="text-muted mb-6 inline-flex items-center gap-1.5 text-sm hover:text-brand-600">
        <Icon name="arrowRight" size={13} className="rotate-180" /> Back to Community
      </Link>

      <div className="card p-6 hover:!translate-y-0">
        <div className="flex items-center gap-3">
          {thread.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thread.photo_url} alt="" className="h-11 w-11 rounded-full" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 font-bold text-white">
              {(thread.name || "R")[0].toUpperCase()}
            </span>
          )}
          <div>
            <Link href={`/readers/${thread.user_id}`} className="font-semibold hover:text-brand-600">{thread.name}</Link>
            <p className="text-muted text-xs">{thread.created_at?.slice(0, 10)}</p>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold">{thread.title}</h1>
        {thread.book_slug && (
          <Link href={`/books/${encodeURIComponent(thread.book_slug)}`} className="pill mt-2 inline-flex !text-xs">
            <Icon name="book" size={11} className="mr-1" /> {thread.book_title || thread.book_slug}
          </Link>
        )}
        <p className="mt-3 whitespace-pre-line leading-relaxed">{thread.body}</p>
      </div>

      <h2 className="text-muted mt-8 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider">
        <Icon name="bookOpen" size={14} /> {thread.posts.length} {thread.posts.length === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="mt-4 space-y-3">
        {thread.posts.map((p) => (
          <div key={p.id} className="card p-4 hover:!translate-y-0">
            <div className="flex items-center gap-2.5">
              {p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo_url} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {(p.name || "R")[0].toUpperCase()}
                </span>
              )}
              <Link href={`/readers/${p.user_id}`} className="text-sm font-semibold hover:text-brand-600">{p.name}</Link>
              <span className="text-muted text-xs">{p.created_at?.slice(0, 10)}</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <ReplyForm discussionId={thread.id} />
      </div>
    </div>
  );
}
