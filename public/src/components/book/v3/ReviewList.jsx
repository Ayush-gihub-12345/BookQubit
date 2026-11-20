"use client";

// Reader reviews with the filters a long list needs: by stars, newest / highest / lowest, and search inside the text.
// Spoiler reviews are blurred until revealed. All data is real (our own shelf reviews); there are no fake helpful votes.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import ReportContent from "@/components/ReportContent";
import Icon from "@/components/Icon";
import StarRow from "./StarRow";
import { useLang } from "@/lib/useLang";

// Helpful votes and replies for one review. Signed-out readers see the counts and replies; voting and replying need a sign-in.
function Social({ r, slug, social, me, onChange }) {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const helpful = social.helpful[r.user_id] || 0;
  const voted = social.voted.includes(r.user_id);
  const replies = social.replies[r.user_id] || [];
  const call = async (url, method, body) => {
    const u = getFirebaseAuth()?.currentUser;
    if (!u) { window.location.href = `/${lang}/login`; return null; }
    setBusy(true); setErr("");
    try {
      const res = await authFetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }, u);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || "Something went wrong."); return null; }
      return data;
    } finally { setBusy(false); }
  };
  const vote = async () => {
    const d = await call("/api/reviews/vote", "POST", { slug, authorId: r.user_id });
    if (d) onChange((x) => ({ ...x, helpful: { ...x.helpful, [r.user_id]: d.helpful }, voted: d.voted ? [...x.voted, r.user_id] : x.voted.filter((v) => v !== r.user_id) }));
  };
  const reply = async (e) => {
    e.preventDefault();
    const d = await call("/api/reviews/reply", "POST", { slug, authorId: r.user_id, body: text });
    if (d) {
      setText("");
      onChange((x) => ({ ...x, replies: { ...x.replies, [r.user_id]: [...(x.replies[r.user_id] || []), { id: d.id, user_id: me?.uid, user_name: me?.displayName || "You", body: d.body, created_at: new Date().toISOString() }] } }));
    }
  };
  const remove = async (id) => {
    const d = await call("/api/reviews/reply", "DELETE", { id });
    if (d?.deleted) onChange((x) => ({ ...x, replies: { ...x.replies, [r.user_id]: (x.replies[r.user_id] || []).filter((q) => q.id !== id) } }));
  };
  return (
    <div className="mt-3 border-t border-[var(--line)] pt-3">
      <div className="flex items-center gap-4 text-sm">
        <button type="button" onClick={vote} disabled={busy || me?.uid === r.user_id} aria-pressed={voted}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold disabled:opacity-50 ${voted ? "bg-[var(--brand-soft,rgba(255,255,255,.1))] text-brand-700" : "text-[var(--muted)] hover:text-brand-700"}`}>
          <Icon name="thumbsUp" size={15} />Helpful{helpful > 0 ? ` · ${helpful}` : ""}
        </button>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-[var(--muted)] hover:text-brand-700">
          <Icon name="message" size={15} />{replies.length ? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Reply"}
        </button>
      </div>
      {open && (
        <div className="mt-2 space-y-3">
          {replies.map((q) => (
            <div key={q.id} className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">
              <p className="font-semibold">{q.user_name || "Reader"} <time className="text-muted ms-1 text-xs font-normal">{String(q.created_at).slice(0, 10)}</time></p>
              <p className="whitespace-pre-line">{q.body}</p>
              <div className="mt-1 flex gap-3">
                {(me?.uid === q.user_id || me?.uid === r.user_id) && <button type="button" onClick={() => remove(q.id)} disabled={busy} className="text-muted text-xs hover:underline">Delete</button>}
                {me?.uid !== q.user_id && <ReportContent targetType="review_reply" targetId={q.id} />}
              </div>
            </div>
          ))}
          <form onSubmit={reply} className="flex gap-2">
            <label className="sr-only" htmlFor={`rp-${r.user_id}`}>Your reply</label>
            <input id={`rp-${r.user_id}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a reply" className="input !min-h-10 flex-1 !rounded-full" />
            <button className="btn-soft btn-sm" disabled={busy || text.trim().length < 2}>Reply</button>
          </form>
          {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
        </div>
      )}
    </div>
  );
}

function Review({ r, hide, slug, social, me, onChange }) {
  const lang = useLang();
  const [reveal, setReveal] = useState(false);
  const [more, setMore] = useState(false);
  const blur = r.spoiler && hide && !reveal;
  const long = (r.review || "").length > 420;
  return (
    <li className="card p-5 hover:!translate-y-0">
      <div className="flex items-start gap-3">
        {r.photo_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={r.photo_url} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
          : <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface-3)] font-bold">{(r.name || "R")[0].toUpperCase()}</span>}
        <div className="min-w-0 flex-1">
          <Link href={`/${lang}/readers/${r.slug || r.user_id}`} prefetch={false} className="font-bold hover:text-brand-700">{r.name}</Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            {r.rating > 0 && <StarRow value={r.rating} size={13} />}
            {r.updated_at && <time>{String(r.updated_at).slice(0, 10)}</time>}
            {r.spoiler ? <span className="badge !h-5 bg-[var(--surface-2)] !text-[10px]">Spoilers</span> : null}
          </div>
        </div>
      </div>
      <div className="relative mt-3">
        <p className={`whitespace-pre-line leading-relaxed ${blur ? "select-none blur-[6px]" : ""} ${long && !more && !blur ? "line-clamp-5" : ""}`}>{r.review}</p>
        {blur && <button type="button" onClick={() => setReveal(true)} className="absolute inset-0 grid place-items-center"><span className="btn-soft btn-sm"><Icon name="eye" size={15} />Show spoiler</span></button>}
      </div>
      {long && !blur && <button type="button" onClick={() => setMore(!more)} className="mt-1 text-sm font-semibold text-brand-700">{more ? "Show less" : "Read more"}</button>}
      {slug && social && r.user_id && <Social r={r} slug={slug} social={social} me={me} onChange={onChange} />}
    </li>
  );
}

export default function ReviewList({ reviews, bookSlug }) {
  const [social, setSocial] = useState({ helpful: {}, replies: {}, voted: [] });
  const [me, setMe] = useState(null);
  useEffect(() => {
    if (!bookSlug) return;
    const auth = getFirebaseAuth();
    const load = async (u) => {
      setMe(u || null);
      try {
        const res = await (u ? authFetch(`/api/reviews/social?slug=${encodeURIComponent(bookSlug)}`, {}, u) : fetch(`/api/reviews/social?slug=${encodeURIComponent(bookSlug)}`));
        if (res.ok) setSocial(await res.json());
      } catch { /* reviews still render without the social layer */ }
    };
    if (!auth) { load(null); return; }
    return auth.onAuthStateChanged(load);
  }, [bookSlug]);
  const [stars, setStars] = useState(null);
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");
  const [hide, setHide] = useState(true);
  const list = useMemo(() => reviews
    .filter((r) => stars == null || Math.round(r.rating) === stars)
    .filter((r) => !q || (r.review || "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "helpful" ? (social.helpful[b.user_id] || 0) - (social.helpful[a.user_id] || 0) : sort === "high" ? b.rating - a.rating : sort === "low" ? a.rating - b.rating : String(b.updated_at).localeCompare(String(a.updated_at))),
  [reviews, stars, sort, q, social.helpful]);
  if (!reviews.length) return null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="pill" data-active={stars == null} onClick={() => setStars(null)}>All</button>
        {[5, 4, 3, 2, 1].map((n) => (
          <button key={n} type="button" className="pill" data-active={stars === n} onClick={() => setStars(stars === n ? null : n)}>{n}<Icon name="star" size={13} filled className="stars" /></button>
        ))}
        <label className="sr-only" htmlFor="rv-sort">Sort reviews</label>
        <select id="rv-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="input !min-h-9 !w-auto !rounded-full !py-1 text-sm">
          <option value="new">Newest</option><option value="helpful">Most helpful</option><option value="high">Highest rated</option><option value="low">Lowest rated</option>
        </select>
        <label className="ms-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="accent-brand-600" />Hide spoilers</label>
      </div>
      {reviews.length > 4 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reviews" aria-label="Search reviews" className="input mt-3 !rounded-full" />}
      <ul className="mt-5 space-y-4">{list.map((r) => <Review key={`${r.user_id}-${r.updated_at}`} r={r} hide={hide} slug={bookSlug} social={social} me={me} onChange={setSocial} />)}</ul>
      {!list.length && <p className="py-10 text-center text-[var(--muted)]">No reviews match these filters.</p>}
    </div>
  );
}
