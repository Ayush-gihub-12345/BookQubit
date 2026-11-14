// Book Page v3 sections that need no client state. Each returns null when it has no real data to show.
import Link from "next/link";
import Icon from "@/components/Icon";
import Translated from "@/components/Translated";
import StarRow from "./StarRow";

export const MOOD_COLORS = ["#8B6CFF", "#4FA3C7", "#6FBF73", "#E8792E", "#D9577A", "#C89B6D", "#6C83D9"];

export function SectionHead({ id, eyebrow, children, right }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 id={id ? `${id}-h` : undefined} className="font-display text-[1.45rem] font-bold leading-tight sm:text-3xl">{children}</h2>
      </div>
      {right}
    </div>
  );
}

/** Key ideas as numbered cards: scannable at a glance, one idea each. */
export function TakeawayCards({ ideas }) {
  if (!ideas?.length) return null;
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {ideas.slice(0, 10).map((idea, i) => (
        <li key={i} className="card card-hover relative overflow-hidden p-5">
          <span aria-hidden className="font-display absolute -end-2 -top-4 text-[5.5rem] font-black leading-none text-brand-400/15">{i + 1}</span>
          <span className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-brand-400 text-[var(--on-brand)]"><Icon name="lightbulb" size={18} /></span>
          <p className="font-display relative text-[1.05rem] font-semibold leading-snug"><Translated text={idea} /></p>
        </li>
      ))}
    </ol>
  );
}

/** How readers felt: a mood bar and pace, from the moods readers tagged on their own shelves. */
export function ReadersFelt({ moods, pace }) {
  const total = (moods || []).reduce((n, m) => n + m.n, 0);
  if (!total && !pace?.length) return null;
  const rows = (moods || []).slice(0, 7).map((m) => ({ name: m.name, pct: Math.max(1, Math.round((m.n / total) * 100)) }));
  return (
    <section id="readers" aria-labelledby="readers-h" className="scroll-mt-36">
      <SectionHead id="readers" eyebrow="From readers who shelved it">How readers felt</SectionHead>
      <div className="card p-5">
        {rows.length > 0 && (
          <>
            <b className="text-sm text-[var(--muted)]">Moods</b>
            <div className="mt-3 flex h-4 overflow-hidden rounded-full">{rows.map((m, i) => <i key={m.name} title={`${m.name} ${m.pct}%`} style={{ width: `${m.pct}%`, background: MOOD_COLORS[i % 7] }} />)}</div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {rows.map((m, i) => <li key={m.name} className="flex items-center gap-2"><i className="h-3 w-3 shrink-0 rounded" style={{ background: MOOD_COLORS[i % 7] }} /><span className="min-w-0 flex-1 truncate">{m.name}</span><b>{m.pct}%</b></li>)}
            </ul>
          </>
        )}
        {pace?.length > 0 && <p className={`flex items-center gap-2 text-sm ${rows.length ? "mt-5 border-t border-[var(--line)] pt-4" : ""}`}><Icon name="zap" size={15} className="text-[var(--muted)]" />Most readers found the pace <b>{pace[0].name.toLowerCase()}</b></p>}
      </div>
    </section>
  );
}

export function EditionsList({ editions, lang, languageName }) {
  if (!editions || editions.length < 2) return null;
  return (
    <section id="editions" aria-labelledby="editions-h" className="scroll-mt-36">
      <SectionHead id="editions" eyebrow={`${editions.length} languages`}>Translations</SectionHead>
      <ul className="card divide-y divide-[var(--line)] overflow-hidden">
        {editions.map((e) => (
          <li key={e.lang}>
            <Link href={`/${e.lang}/books/${encodeURIComponent(e.slug)}`} prefetch={false} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--surface-2)]">
              <Icon name="globe" size={17} className="text-[var(--muted)]" />
              <b className="flex-1">{languageName(e.lang)}</b>
              {e.lang === lang && <span className="badge badge-brand !h-5 !text-[10px]">You are here</span>}
              <Icon name="arrowRight" size={16} className="text-[var(--muted)] rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- sidebar cards ---------- */

export function RatingCard({ avg, count, distribution }) {
  if (!count) return null;
  return (
    <section className="card p-5" aria-labelledby="rate-h">
      <h2 id="rate-h" className="font-bold">Ratings</h2>
      <div className="mt-2 flex items-end gap-3">
        <span className="font-display text-5xl font-bold leading-none">{Number(avg).toFixed(1)}</span>
        <span className="pb-1"><StarRow value={avg} /><span className="block text-xs text-[var(--muted)]">{count} {count === 1 ? "rating" : "ratings"}</span></span>
      </div>
      <ul className="mt-4 space-y-1.5">
        {distribution.map((d) => {
          const pct = Math.round((d.n / count) * 100);
          return (
            <li key={d.star}>
              <a href="#reviews" className="grid grid-cols-[26px_1fr_34px] items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--fg)]">
                <span>{d.star}★</span>
                <span className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]"><i className="block h-full rounded-full bg-gradient-to-r from-brand-400 to-[var(--color-ember-500,#E8792E)]" style={{ width: `${pct}%` }} /></span>
                <span className="text-end">{pct}%</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ReadersCard({ reading, finished, want }) {
  const items = [["Reading now", reading], ["Finished", finished], ["Want to read", want]].filter(([, v]) => v > 0);
  if (!items.length) return null;
  return (
    <section className="card p-5" aria-labelledby="stats-h">
      <h2 id="stats-h" className="flex items-center gap-2 font-bold"><Icon name="users" size={17} />Readers</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        {items.map(([k, v]) => <div key={k} className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3"><dt className="text-[11px] text-[var(--muted)]">{k}</dt><dd className="font-display text-xl font-bold">{v.toLocaleString()}</dd></div>)}
      </dl>
    </section>
  );
}

export function AuthorCard({ profile, name, lang, moreHref }) {
  return (
    <section className="card p-5" aria-labelledby="auth-h">
      <h2 id="auth-h" className="sr-only">About the author</h2>
      <div className="flex items-center gap-3">
        {profile?.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={profile.image_url} alt="" className="h-14 w-14 rounded-full object-cover" loading="lazy" />
          : <span className="font-display grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-xl font-bold text-white">{(name || "?")[0]}</span>}
        <div className="min-w-0">
          {profile ? <Link href={`/${lang}/authors/${profile.slug}`} prefetch={false} className="font-bold hover:text-brand-700">{profile.name}</Link> : <b>{name}</b>}
          {profile?.country && <p className="text-xs text-[var(--muted)]">{profile.country}</p>}
        </div>
      </div>
      <Link href={moreHref} prefetch={false} className="btn-ghost btn-sm mt-4 w-full">More by this author</Link>
    </section>
  );
}
