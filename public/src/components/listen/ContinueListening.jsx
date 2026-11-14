"use client";

// "Pick up where you left off": the last track and its saved position, straight from the player's own local store.
// Renders nothing for a first-time listener.
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { usePlayer } from "@/components/player/PlayerProvider";

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export default function ContinueListening() {
  const p = usePlayer();
  const [saved, setSaved] = useState(null);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("bq-player-v1") || "null");
      if (s?.track) setSaved({ track: s.track, at: s.positions?.[s.track.id] || 0 });
    } catch { /* storage blocked */ }
  }, []);
  const track = p?.track || saved?.track;
  if (!track) return null;
  const at = p?.track ? p.position : saved?.at || 0;
  const playing = p?.track?.id === track.id && p.playing;

  return (
    <section className="container-bq pt-5" aria-label="Continue listening">
      <div className="card flex items-center gap-4 p-3 sm:p-4">
        {track.cover
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={track.cover} alt="" className="h-20 w-14 shrink-0 rounded-md object-cover shadow" />
          : <span className="h-20 w-14 shrink-0 rounded-md bg-[var(--surface-2)]" />}
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Continue listening</p>
          <p className="truncate font-semibold">{track.title}</p>
          <p className="text-muted truncate text-sm">{track.subtitle}{at > 5 ? ` · ${fmt(at)} in` : ""}</p>
        </div>
        <button type="button" onClick={() => (p?.track?.id === track.id ? p.toggle() : p?.load(track))}
          className="btn-primary !h-12 !w-12 !min-h-12 shrink-0 !rounded-full !p-0" aria-label={playing ? "Pause" : "Resume"}>
          <Icon name={playing ? "pause" : "play"} size={20} filled />
        </button>
      </div>
    </section>
  );
}
