"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";

const MOODS = ["✨ inspiring", "🌧️ emotional", "😂 funny", "🌑 dark", "🧠 informative", "🫀 hopeful", "😰 tense", "🕯️ reflective"];
const PACES = ["🐢 slow", "🚶 medium", "⚡ fast"];

// Pure review editor: rating + mood/pace + review text, all in one place.
// Shelf status (want/reading/read) lives in QuickActions elsewhere on the
// page — publishing a review here just makes sure the book is on the shelf
// (defaults to "read" if it isn't shelved yet at all).
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
        if (data.entry?.review) setReviewOpen(false); else setReviewOpen(true);
      }
    });
  }, [slug]);

  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <Link href="/login" className="btn-ghost w-full text-sm">
        ✍️ Sign in to write a review
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
    setReviewOpen(true);
    setReviewSaved(false);
  };

  const selectedMoods = entry?.moods ? JSON.parse(entry.moods) : [];

  return (
    <div className="card space-y-3 p-4 hover:!translate-y-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{entry?.review ? "Your review" : "Write a review"}</p>
        {entry?.review && (
          <div className="flex items-center gap-3 text-xs">
            <button onClick={() => setReviewOpen(!reviewOpen)} className="font-medium text-brand-600 hover:underline">
              {reviewOpen ? "Cancel" : "Edit"}
            </button>
            <button onClick={deleteReview} className="font-medium text-red-500 hover:underline">Delete</button>
          </div>
        )}
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

      {!reviewOpen && entry?.review && (
        <p className="text-muted line-clamp-3 text-xs leading-relaxed">{entry.review}</p>
      )}

      {reviewOpen && (
        <div className="space-y-3">
          <div>
            <p className="text-muted text-xs font-semibold uppercase tracking-wide">How does it feel?</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MOODS.map((m) => {
                const selected = selectedMoods.includes(m);
                return (
                  <button key={m} disabled={busy}
                    onClick={() => {
                      const next = selected ? selectedMoods.filter((x) => x !== m) : [...selectedMoods, m].slice(-3);
                      update({ moods: next, status: entry?.status || "read" });
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
                  onClick={() => update({ pace: p, status: entry?.status || "read" })}
                  className={`pill !text-[11px] ${entry?.pace === p ? "!bg-brand-600 !text-white" : ""}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

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
              onClick={async () => {
                await update({ review: reviewText.trim(), spoiler, status: entry?.status || "read" });
                setReviewSaved(true);
                setReviewOpen(false);
              }}
              className="btn-primary !px-4 !py-1.5 text-xs"
            >
              {reviewSaved ? "✓ Published" : "Publish review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
