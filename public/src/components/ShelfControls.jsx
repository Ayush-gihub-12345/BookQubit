"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";

const STATUSES = [
  { id: "want", label: "Want to Read", icon: "🔖" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "read", label: "Read", icon: "✅" },
];

const MOODS = ["✨ inspiring", "🌧️ emotional", "😂 funny", "🌑 dark", "🧠 informative", "🫀 hopeful", "😰 tense", "🕯️ reflective"];
const PACES = ["🐢 slow", "🚶 medium", "⚡ fast"];

export default function ShelfControls({ slug }) {
  const [user, setUser] = useState(null);
  const [entry, setEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);
  const [spoiler, setSpoiler] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const r = await fetch(`/api/shelf?uid=${u.uid}&slug=${encodeURIComponent(slug)}`);
        const data = await r.json();
        setEntry(data.entry);
        if (data.entry?.review) setReviewText(data.entry.review);
        if (data.entry?.spoiler) setSpoiler(true);
      }
    });
  }, [slug]);

  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <Link href="/login" className="btn-ghost w-full text-sm">
        🔖 Sign in to track this book
      </Link>
    );
  }

  const update = async (patch) => {
    setBusy(true);
    const optimistic = { ...(entry || { status: null, rating: null }), ...patch };
    setEntry(optimistic);
    try {
      await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await user.getIdToken(), slug, ...patch }),
      });
    } finally { setBusy(false); }
  };

  const deleteReview = async () => {
    if (!confirm("Delete your review?")) return;
    await update({ review: "", spoiler: false });
    setReviewText("");
    setSpoiler(false);
    setReviewOpen(false);
    setReviewSaved(false);
  };

  return (
    <div className="card space-y-4 p-4 hover:!translate-y-0">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left: review composer */}
        <div className="order-2 sm:order-1">
          {entry?.status && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => setReviewOpen(!reviewOpen)} className="text-sm font-semibold text-brand-600 hover:underline">
                  ✍️ {entry?.review ? "Edit your review" : "Write a review"}
                </button>
                {entry?.review && (
                  <button onClick={deleteReview} className="text-xs font-medium text-red-500 hover:underline">
                    Delete review
                  </button>
                )}
              </div>
              {reviewOpen && (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={reviewText}
                    onChange={(e) => { setReviewText(e.target.value); setReviewSaved(false); }}
                    rows={5}
                    maxLength={2000}
                    placeholder="What did you think of this book?"
                    className="input resize-y text-sm"
                  />
                  <label className="text-muted flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)}
                      className="accent-[var(--color-brand-600)]" />
                    This review contains spoilers
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-xs">{reviewText.length}/2000</span>
                    <button
                      disabled={busy || !reviewText.trim()}
                      onClick={async () => { await update({ review: reviewText.trim(), spoiler }); setReviewSaved(true); }}
                      className="btn-primary !px-4 !py-1.5 text-xs"
                    >
                      {reviewSaved ? "✓ Published" : "Publish review"}
                    </button>
                  </div>
                </div>
              )}
              {!reviewOpen && entry?.review && (
                <p className="text-muted mt-1.5 line-clamp-3 text-xs leading-relaxed">{entry.review}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: shelf status, rating, progress, moods/pace */}
        <div className="order-1 space-y-4 sm:order-2">
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                disabled={busy}
                onClick={() => update({ status: s.id })}
                className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                  entry?.status === s.id
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                    : "border-line border hover:border-brand-500"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1">
            <span className="text-muted mr-2 text-xs font-medium">Your rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                disabled={busy}
                onClick={() => update({ rating: n, status: entry?.status || "read" })}
                className={`text-xl transition hover:scale-125 ${
                  (entry?.rating || 0) >= n ? "text-amber-400" : "text-muted opacity-40"
                }`}
                aria-label={`Rate ${n} stars`}
              >
                ★
              </button>
            ))}
          </div>

          {entry?.status === "reading" && (
            <div>
              <div className="text-muted mb-1 flex justify-between text-xs">
                <span>Progress</span><span>{entry.progress || 0}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={entry.progress || 0}
                onChange={(e) => update({ progress: Number(e.target.value) })}
                className="w-full accent-[var(--color-brand-600)]"
              />
            </div>
          )}

          {(entry?.status === "read" || entry?.status === "reading") && (
            <div>
              <p className="text-muted text-xs font-semibold uppercase tracking-wide">How does it feel?</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MOODS.map((m) => {
                  const selected = (entry?.moods ? JSON.parse(entry.moods) : []).includes(m);
                  return (
                    <button key={m} disabled={busy}
                      onClick={() => {
                        const cur = entry?.moods ? JSON.parse(entry.moods) : [];
                        const next = selected ? cur.filter((x) => x !== m) : [...cur, m].slice(-3);
                        update({ moods: next });
                        setEntry((e) => ({ ...e, moods: JSON.stringify(next) }));
                      }}
                      className={`pill !text-[11px] ${selected ? "!bg-brand-600 !text-white" : ""}`}>
                      {m}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-1.5">
                {PACES.map((p) => (
                  <button key={p} disabled={busy}
                    onClick={() => update({ pace: p })}
                    className={`pill !text-[11px] ${entry?.pace === p ? "!bg-brand-600 !text-white" : ""}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
