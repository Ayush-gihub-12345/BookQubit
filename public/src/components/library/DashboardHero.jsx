"use client";

// The top of the reader dashboard: goal ring, streak, books read, what you're reading now, and one-tap "listen to my
// reading list". Counts come from the shelf already loaded by LibraryView; goal/streak from /api/library/stats, which
// is best-effort (a failure just hides those tiles, the rest still works).
import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { authFetch } from "@/lib/authFetch";
import { usePlayer } from "@/components/player/PlayerProvider";

function Ring({ pct = 0, size = 92, children }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, background: `conic-gradient(var(--color-brand-400) ${p * 3.6}deg, color-mix(in srgb, var(--fg) 10%, transparent) 0)`, boxShadow: "0 0 28px -6px var(--color-brand-400)" }}>
      <div className="grid place-items-center rounded-full bg-[var(--surface)] text-center" style={{ width: size - 14, height: size - 14 }}>{children}</div>
    </div>
  );
}

const Glass = ({ className = "", children }) => (
  <div className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-4 backdrop-blur-md ${className}`}
    style={{ boxShadow: "inset 0 1px 0 color-mix(in srgb, #fff 8%, transparent), 0 10px 30px -18px color-mix(in srgb, var(--color-brand-400) 55%, transparent)" }}>
    {children}
  </div>
);

export default function DashboardHero({ books, lang }) {
  const p = usePlayer();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let live = true;
    authFetch(`/api/library/stats?year=${new Date().getFullYear()}`)
      .then((r) => (r && r.ok ? r.json() : null)).then((s) => live && s && setStats(s)).catch(() => {});
    return () => { live = false; };
  }, []);

  const reading = books.filter((b) => b.status === "reading");
  const want = books.filter((b) => b.status === "want");
  const read = books.filter((b) => b.status === "read");
  const queue = [...reading, ...want].slice(0, 12).map((b) => ({ slug: b.book_slug, lang, title: b.title || b.book_slug, author: b.author || "", cover: b.cover_url || "" }));
  const goal = stats?.goal?.target ? stats.goal : null;

  return (
    <section aria-label="Dashboard" className="relative">
      <div aria-hidden className="pointer-events-none absolute -inset-x-6 -top-8 h-56 opacity-70 blur-2xl"
        style={{ background: "radial-gradient(40% 80% at 15% 0%, color-mix(in srgb, var(--color-brand-400) 28%, transparent), transparent 70%), radial-gradient(35% 70% at 90% 10%, color-mix(in srgb, var(--color-qubit-500, #6C83D9) 26%, transparent), transparent 70%)" }} />

      <div className="relative grid gap-3 sm:grid-cols-3">
        <Glass className="flex items-center gap-4">
          <Ring pct={goal ? goal.pct : Math.min(100, read.length * 10)}>
            <span className="font-display text-xl font-bold leading-none">{goal ? goal.finished : read.length}</span>
            <span className="text-muted text-[10px] leading-tight">{goal ? `of ${goal.target}` : "read"}</span>
          </Ring>
          <div className="min-w-0">
            <p className="eyebrow !text-[10px]">{new Date().getFullYear()} goal</p>
            <p className="mt-1 text-sm leading-snug">{goal ? goal.label : "No goal set yet. Pick one on your account page."}</p>
          </div>
        </Glass>

        <Glass className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: "linear-gradient(140deg, #F59E0B, #EF4444)", boxShadow: "0 0 26px -6px #F59E0B" }}><Icon name="zap" size={26} /></span>
          <div>
            <p className="font-display text-3xl font-bold leading-none">{stats?.streak?.current ?? "–"}<span className="text-muted ms-1 text-sm font-normal">days</span></p>
            <p className="text-muted mt-1 text-xs">{stats?.streak ? `Longest streak: ${stats.streak.longest}` : "Reading streak"}</p>
          </div>
        </Glass>

        <Glass>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[["Reading", reading.length], ["Want", want.length], ["Read", read.length]].map(([l, n]) => (
              <div key={l}><dd className="font-display text-2xl font-bold">{n}</dd><dt className="text-muted text-xs">{l}</dt></div>
            ))}
          </dl>
          <button type="button" disabled={!queue.length} onClick={() => p?.playQueue(queue)}
            className="btn-primary mt-3 w-full !min-h-10 !text-sm disabled:opacity-50">
            <Icon name="headphones" size={16} /> Listen to my reading list
          </button>
        </Glass>
      </div>

      {reading.length > 0 && (
        <div className="relative mt-5">
          <h2 className="eyebrow mb-2">Now reading</h2>
          <ul className="hscroll">
            {reading.slice(0, 8).map((b) => (
              <li key={b.book_slug} className="w-[min(280px,82vw)] shrink-0">
                <Link href={`/${lang}/books/${encodeURIComponent(b.book_slug)}`} className="block">
                  <Glass className="flex items-center gap-3 !p-3">
                    {b.cover_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={b.cover_url} alt="" className="h-20 w-14 shrink-0 rounded-md object-cover shadow-lg" loading="lazy" />
                      : <span className="h-20 w-14 shrink-0 rounded-md bg-[var(--surface-2)]" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.title || b.book_slug}</p>
                      <p className="text-muted truncate text-xs">{b.author}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]" role="progressbar" aria-valuenow={b.progress || 0} aria-valuemin={0} aria-valuemax={100} aria-label="Progress">
                        <div className="h-full rounded-full" style={{ width: `${b.progress || 0}%`, background: "linear-gradient(90deg, var(--color-brand-400), var(--color-qubit-500, #6C83D9))" }} />
                      </div>
                      <p className="text-muted mt-1 text-[11px] tabular-nums">{b.progress || 0}% complete</p>
                    </div>
                  </Glass>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
