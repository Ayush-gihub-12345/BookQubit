"use client";

// Reader reviews with the filters a long list needs: by stars, newest / highest / lowest, and search inside the text.
// Spoiler reviews are blurred until revealed. All data is real (our own shelf reviews); there are no fake helpful votes.
import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import StarRow from "./StarRow";
import { useLang } from "@/lib/useLang";

function Review({ r, hide }) {
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
    </li>
  );
}

export default function ReviewList({ reviews }) {
  const [stars, setStars] = useState(null);
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");
  const [hide, setHide] = useState(true);
  const list = useMemo(() => reviews
    .filter((r) => stars == null || Math.round(r.rating) === stars)
    .filter((r) => !q || (r.review || "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "high" ? b.rating - a.rating : sort === "low" ? a.rating - b.rating : String(b.updated_at).localeCompare(String(a.updated_at))),
  [reviews, stars, sort, q]);
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
          <option value="new">Newest</option><option value="high">Highest rated</option><option value="low">Lowest rated</option>
        </select>
        <label className="ms-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="accent-brand-600" />Hide spoilers</label>
      </div>
      {reviews.length > 4 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reviews" aria-label="Search reviews" className="input mt-3 !rounded-full" />}
      <ul className="mt-5 space-y-4">{list.map((r) => <Review key={`${r.user_id}-${r.updated_at}`} r={r} hide={hide} />)}</ul>
      {!list.length && <p className="py-10 text-center text-[var(--muted)]">No reviews match these filters.</p>}
    </div>
  );
}
