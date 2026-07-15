"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { readWishlist } from "./WishlistButton";
import Icon from "./Icon";

const pill = "inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition";
const pillFilled = `${pill} w-full justify-center border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:brightness-110`;

// Grid variant: tighter horizontal padding + centered, wrap-friendly text so
// longer labels ("Add to My Library") stay readable at half-width on small
// phones instead of overflowing or forcing the row to scroll.
const gridPill = "flex w-full items-center justify-center gap-2 rounded-full border-2 px-3 py-2.5 text-center text-sm font-semibold leading-tight transition";
const gridPillOutline = `${gridPill} border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5`;
const gridPillActive = `${gridPill} border-brand-600 bg-brand-600 text-white`;

// Fast-access action bar (Get Book / Summary / Like / Wishlist / Share, then
// My Library / Mark Read). ShelfControls elsewhere on the page still owns the
// full status + rating + review workflow — these are just quick shortcuts
// into the same shelf API.
export default function QuickActions({ book }) {
  const [user, setUser] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setWishlisted(readWishlist().some((b) => b.slug === book.slug));
    const auth = getFirebaseAuth();
    const loadLike = async (uid) => {
      const r = await fetch(`/api/follow?type=book_like&id=${encodeURIComponent(book.slug)}${uid ? `&uid=${uid}` : ""}`);
      const data = await r.json();
      setLikeCount(data.count);
      setLiked(data.following);
    };
    if (!auth) { loadLike(); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      loadLike(u?.uid);
      if (u) {
        fetch(`/api/shelf?uid=${u.uid}&slug=${encodeURIComponent(book.slug)}`)
          .then((r) => r.json()).then((d) => {
            setStatus(d.entry?.status || null);
            setProgress(d.entry?.progress || 0);
          });
      }
    });
  }, [book.slug]);

  const toggleWishlist = () => {
    const list = readWishlist();
    const next = wishlisted
      ? list.filter((b) => b.slug !== book.slug)
      : [...list, { slug: book.slug, title: book.title, author: book.author, cover_url: book.cover_url, rating: book.rating }];
    localStorage.setItem("bq_wishlist", JSON.stringify(next));
    setWishlisted(!wishlisted);
  };

  const toggleLike = async () => {
    if (!user) { router.push("/login"); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (c ?? 0) + (next ? 1 : -1));
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: await user.getIdToken(), type: "book_like", id: book.slug, follow: next }),
    });
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ url, title: book.title }); return; } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  // Clicking an already-active status un-shelves the book entirely (real
  // toggle, persisted to D1 via DELETE); clicking a different status sets it.
  const setShelfStatus = async (next) => {
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    const removing = status === next;
    setStatus(removing ? null : next);
    try {
      const idToken = await user.getIdToken();
      if (removing) {
        await fetch("/api/shelf", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, slug: book.slug }),
        });
      } else {
        await fetch("/api/shelf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, slug: book.slug, status: next }),
        });
      }
    } finally { setBusy(false); }
  };

  // Debounced so dragging the slider doesn't fire a write per pixel.
  const saveProgress = (value) => {
    setProgress(value);
    clearTimeout(saveProgress._t);
    saveProgress._t = setTimeout(async () => {
      const idToken = await user.getIdToken();
      await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, slug: book.slug, status: "reading", progress: value }),
      });
    }, 500);
  };

  if (!firebaseEnabled) return null;

  return (
    <div className="mt-8 flex flex-col gap-2.5">
      {book.buyUrl && (
        <a href={book.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className={pillFilled}>
          <Icon name="cart" size={15} /> Get Book
        </a>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <a href="#summary" className={gridPillOutline}>
          <Icon name="bookOpen" size={15} /> Summary
        </a>
        <button onClick={toggleLike} className={liked ? gridPillActive : gridPillOutline}>
          <Icon name="heart" size={15} filled={liked} /> Like{likeCount ? ` · ${likeCount}` : ""}
        </button>
        <button onClick={toggleWishlist} className={wishlisted ? gridPillActive : gridPillOutline}>
          <Icon name="bookmark" size={15} filled={wishlisted} /> {wishlisted ? "Wishlisted" : "Wishlist"}
        </button>
        <button onClick={share} className={gridPillOutline}>
          <Icon name={shared ? "check" : "share"} size={15} /> {shared ? "Link copied" : "Share"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button disabled={busy} onClick={() => setShelfStatus("want")} className={status === "want" ? gridPillActive : gridPillOutline}>
          <Icon name="bookmark" size={15} filled={status === "want"} /> {status === "want" ? "In My Library" : "Add to My Library"}
        </button>
        <button disabled={busy} onClick={() => setShelfStatus("reading")} className={status === "reading" ? gridPillActive : gridPillOutline}>
          <Icon name="clock" size={15} filled={status === "reading"} /> {status === "reading" ? "Currently Reading" : "Track Book"}
        </button>
        <button disabled={busy} onClick={() => setShelfStatus("read")} className={`${status === "read" ? gridPillActive : gridPillOutline} col-span-2`}>
          <Icon name="check" size={15} /> {status === "read" ? "Marked Read" : "Mark Read"}
        </button>
      </div>

      {status === "reading" && (
        <div className="card mt-1 flex items-center gap-3 rounded-xl px-4 py-3">
          <Icon name="trendingUp" size={15} className="text-brand-600 shrink-0" />
          <input
            type="range" min={0} max={100} value={progress}
            onChange={(e) => saveProgress(Number(e.target.value))}
            className="accent-brand-600 h-1.5 flex-1"
          />
          <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">{progress}%</span>
        </div>
      )}
    </div>
  );
}
