"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { BarChart, Heatmap, Ring, ShareBars } from "@/components/charts";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const Card = ({ title, children, className = "" }) => (
  <section className={`border-line bg-surface rounded-2xl border p-5 ${className}`}>
    <h2 className="font-editorial text-lg font-semibold">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

export default function StatsView() {
  const year = new Date().getFullYear();
  const [s, setS] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    authFetch(`/api/library/stats?year=${year}`)
      .then((r) => (r && r.ok ? r.json() : Promise.reject()))
      .then(setS)
      .catch(() => setError(true));
  }, [year]);

  if (error) return <p role="alert" className="text-muted">Couldn&apos;t load your stats. Refresh to try again.</p>;
  if (!s) return <div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-44" aria-hidden />)}</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card title={`${year} reading goal`}>
        {s.goal.target ? (
          <div className="flex items-center gap-5">
            <Ring pct={s.goal.pct}>
              <span className="font-editorial text-2xl font-semibold">{s.goal.finished}</span>
              <span className="text-muted text-xs">of {s.goal.target}</span>
            </Ring>
            <p className="text-sm">{s.goal.label}</p>
          </div>
        ) : <p className="text-muted text-sm">You haven&apos;t set a goal for {year}. Set one from your account page and it will show here.</p>}
      </Card>

      <Card title="Streak">
        <div className="flex gap-8">
          <div><p className="font-editorial text-4xl font-semibold">{s.streak.current}</p><p className="text-muted text-sm">current days</p></div>
          <div><p className="font-editorial text-4xl font-semibold">{s.streak.longest}</p><p className="text-muted text-sm">longest</p></div>
        </div>
      </Card>

      <Card title="Books finished per month" className="sm:col-span-1">
        <BarChart values={s.monthly.books} labels={MONTHS} ariaLabel="Books finished per month" />
      </Card>
      <Card title="Pages per month">
        <BarChart values={s.monthly.pages} labels={MONTHS} unit=" pages" ariaLabel="Pages read per month" />
      </Card>
      <Card title="Audio minutes per month">
        {s.activityAvailable ? <BarChart values={s.monthly.audioMinutes} labels={MONTHS} unit=" min" ariaLabel="Audio minutes per month" />
          : <p className="text-muted text-sm">Activity tracking isn&apos;t switched on yet.</p>}
      </Card>
      <Card title="Totals">
        <dl className="grid grid-cols-3 gap-3 text-center">
          <div><dd className="font-editorial text-2xl font-semibold">{s.totals.booksRead}</dd><dt className="text-muted text-xs">books read</dt></div>
          <div><dd className="font-editorial text-2xl font-semibold">{s.totals.pages.toLocaleString()}</dd><dt className="text-muted text-xs">pages</dt></div>
          <div><dd className="font-editorial text-2xl font-semibold">{s.totals.audioMinutes.toLocaleString()}</dd><dt className="text-muted text-xs">audio min</dt></div>
        </dl>
      </Card>

      <Card title="Reading calendar" className="sm:col-span-2"><Heatmap cells={s.heatmap} /></Card>
      <Card title="Genres">{s.genres.length ? <ShareBars items={s.genres} /> : <p className="text-muted text-sm">Finish a book to see your genre mix.</p>}</Card>
      <Card title="Languages">{s.languages.length ? <ShareBars items={s.languages} /> : <p className="text-muted text-sm">Finish a book to see your language mix.</p>}</Card>
    </div>
  );
}
