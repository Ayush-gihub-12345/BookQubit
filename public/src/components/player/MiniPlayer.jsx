"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Icon from "../Icon";
import { usePlayer, SPEEDS } from "./PlayerProvider";

const fmt = (s) => {
  s = Math.max(0, Math.round(s || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const SLEEP = [5, 15, 30];

// The only fixed bar above the mobile tab bar. Hairline progress on top, tap the
// body to expand. On desktop it floats bottom-right instead of spanning the page.
export default function MiniPlayer() {
  const p = usePlayer();
  const pathname = usePathname();
  const chat = /\/community(\/|$)/.test(pathname); // tab bar is hidden there

  useEffect(() => {
    if (!p?.expanded) return;
    const onKey = (e) => e.key === "Escape" && p.setExpanded(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [p?.expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p || !p.track) return null;
  const { track, playing, position, duration, speed, expanded, segments, activeIndex, sleepEndsAt } = p;
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <>
      <div
        className="border-line bg-surface/95 fixed inset-x-0 z-[35] border-t shadow-[0_-6px_24px_rgba(0,0,0,.08)] backdrop-blur-lg lg:start-auto lg:end-4 lg:bottom-4 lg:w-96 lg:rounded-2xl lg:border"
        style={{ bottom: chat ? 0 : "calc(5.5rem + env(safe-area-inset-bottom))" }}
        role="region"
        aria-label="Audio player"
      >
        <div className="bg-line absolute inset-x-0 top-0 h-0.5 lg:rounded-t-2xl" aria-hidden>
          <div className="bg-brand-600 h-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button type="button" onClick={() => p.setExpanded(true)} className="flex min-w-0 flex-1 items-center gap-3 text-start" aria-label={`Open player for ${track.title}`}>
            {track.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.cover} alt="" className="h-11 w-8 shrink-0 rounded object-cover" />
            ) : <span className="bg-brand-100 h-11 w-8 shrink-0 rounded" />}
            <span className="min-w-0">
              <span className="font-editorial block truncate text-sm font-semibold">{track.title}</span>
              <span className="text-muted block truncate text-xs">{track.subtitle || "1-minute summary"}</span>
            </span>
          </button>
          <button type="button" onClick={() => p.skip(-15)} className="text-muted hover:text-fg hidden p-2 sm:block" aria-label="Back 15 seconds">
            <Icon name="rewind" size={18} />
          </button>
          <button type="button" onClick={p.toggle} className="bg-brand-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--on-brand)]" aria-label={playing ? "Pause" : "Play"}>
            <Icon name={playing ? "pause" : "play"} size={16} filled />
          </button>
          {p.queue.length > 0 && (
            <button type="button" onClick={p.advance} className="text-muted hover:text-fg p-2" aria-label={`Next: ${p.queue[0].title}`}>
              <Icon name="fastForward" size={18} />
            </button>
          )}
          <button type="button" onClick={p.close} className="text-muted hover:text-fg p-2" aria-label="Close player">
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-surface fixed inset-0 z-[90] flex flex-col overflow-y-auto pb-safe" role="dialog" aria-modal="true" aria-label="Player">
          {track.cover && (
            <div aria-hidden className="pointer-events-none fixed inset-0 opacity-50 blur-3xl saturate-150"
              style={{ backgroundImage: `url(${track.cover})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          )}
          <div aria-hidden className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-[var(--surface)]/60 to-[var(--surface)]" />
          <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-4 pb-8">
            <button type="button" onClick={() => p.setExpanded(false)} className="text-muted hover:text-fg -ms-2 self-start p-2" aria-label="Minimise player">
              <Icon name="chevronDown" size={22} />
            </button>

            <div className="mx-auto mt-2 aspect-[2/3] w-44 overflow-hidden rounded-xl shadow-xl">
              {track.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.cover} alt="" className="h-full w-full object-cover" />
              ) : <div className="bg-brand-100 h-full w-full" />}
            </div>

            <h2 className="font-editorial mt-6 text-center text-2xl font-semibold">{track.title}</h2>
            <p className="text-muted mt-1 text-center text-sm">{track.subtitle}</p>

            <p className="font-editorial mt-5 min-h-[4.5rem] text-center text-lg leading-snug" aria-live="off">
              {segments[activeIndex] || ""}
            </p>

            <div className="mt-6">
              <input
                type="range" min={0} max={Math.max(1, Math.round(duration))} value={Math.round(position)}
                onChange={(e) => p.seek(Number(e.target.value))}
                className="accent-brand-600 w-full" aria-label="Seek"
                aria-valuetext={`${fmt(position)} of ${fmt(duration)}`}
              />
              <div className="text-muted mt-1 flex justify-between text-xs tabular-nums"><span>{fmt(position)}</span><span>{fmt(duration)}</span></div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-7">
              <button type="button" onClick={() => p.skip(-15)} className="text-fg p-3" aria-label="Back 15 seconds"><Icon name="rewind" size={26} /></button>
              <button type="button" onClick={p.toggle} className="bg-brand-600 flex h-16 w-16 items-center justify-center rounded-full text-[var(--on-brand)] shadow-lg" aria-label={playing ? "Pause" : "Play"}>
                <Icon name={playing ? "pause" : "play"} size={26} filled />
              </button>
              <button type="button" onClick={() => p.skip(15)} className="text-fg p-3" aria-label="Forward 15 seconds"><Icon name="fastForward" size={26} /></button>
            </div>

            {p.queue.length > 0 && (
              <section className="mt-7" aria-label="Up next">
                <div className="flex items-center justify-between">
                  <h3 className="text-muted text-xs font-medium">Up next · {p.queue.length}</h3>
                  <button type="button" onClick={p.clearQueue} className="text-muted hover:text-fg text-xs underline">Clear</button>
                </div>
                <ol className="mt-2 space-y-1">
                  {p.queue.slice(0, 5).map((q) => (
                    <li key={q.slug} className="flex items-center gap-3 rounded-lg p-1.5">
                      {q.cover
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={q.cover} alt="" className="h-10 w-7 shrink-0 rounded object-cover" />
                        : <span className="bg-brand-100 h-10 w-7 shrink-0 rounded" />}
                      <span className="min-w-0"><span className="block truncate text-sm font-semibold">{q.title}</span><span className="text-muted block truncate text-xs">{q.author}</span></span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <fieldset className="mt-8">
              <legend className="text-muted mb-2 text-xs font-medium">Speed</legend>
              <div className="flex flex-wrap gap-2">
                {SPEEDS.map((s) => (
                  <button key={s} type="button" onClick={() => p.setSpeed(s)} aria-pressed={speed === s}
                    className={`rounded-full border px-3 py-1.5 text-sm tabular-nums ${speed === s ? "border-brand-600 bg-brand-600 text-[var(--on-brand)]" : "border-line"}`}>
                    {s}x
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-muted mb-2 flex items-center gap-1.5 text-xs font-medium"><Icon name="moon" size={13} /> Sleep timer</legend>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => p.setSleep(null)} aria-pressed={!sleepEndsAt}
                  className={`rounded-full border px-3 py-1.5 text-sm ${!sleepEndsAt ? "border-brand-600 bg-brand-600 text-[var(--on-brand)]" : "border-line"}`}>Off</button>
                {SLEEP.map((m) => (
                  <button key={m} type="button" onClick={() => p.setSleep(m)}
                    className="border-line rounded-full border px-3 py-1.5 text-sm">{m} min</button>
                ))}
              </div>
              {sleepEndsAt && <p className="text-muted mt-2 text-xs">Pauses at {new Date(sleepEndsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>}
            </fieldset>
          </div>
        </div>
      )}
    </>
  );
}
