"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { readWishlist } from "./WishlistButton";
import Icon from "./Icon";

const pill = "inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition";
const pillOutline = `${pill} border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5`;
const pillFilled = `${pill} border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:brightness-110`;
const pillActive = `${pill} border-brand-600 bg-brand-600 text-white`;

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
          .then((r) => r.json()).then((d) => setStatus(d.entry?.status || null));
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

  const setShelfStatus = async (next) => {
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    setStatus(next);
    try {
      await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await user.getIdToken(), slug: book.slug, status: next }),
      });
    } finally { setBusy(false); }
  };

  if (!firebaseEnabled) return null;

  return (
    <div className="mt-8 flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2.5">
        {book.buyUrl && (
          <a href={book.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className={pillFilled}>
            <Icon name="cart" size={15} /> Get Book
          </a>
        )}
        <a href="#summary" className={pillOutline}>
          <Icon name="bookOpen" size={15} /> Summary
        </a>
        <button onClick={toggleLike} className={liked ? pillActive : pillOutline}>
          <Icon name="heart" size={15} filled={liked} /> Like{likeCount ? ` · ${likeCount}` : ""}
        </button>
        <button onClick={toggleWishlist} className={wishlisted ? pillActive : pillOutline}>
          <Icon name="bookmark" size={15} filled={wishlisted} /> {wishlisted ? "Wishlisted" : "Wishlist"}
        </button>
        <button onClick={share} className={pillOutline}>
          <Icon name={shared ? "check" : "share"} size={15} /> {shared ? "Link copied" : "Share"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button disabled={busy} onClick={() => setShelfStatus("want")} className={status === "want" ? pillActive : pillOutline}>
          <Icon name="bookmark" size={15} filled={status === "want"} /> {status === "want" ? "In My Library" : "Add to My Library"}
        </button>
        <button disabled={busy} onClick={() => setShelfStatus("read")} className={status === "read" ? pillActive : pillOutline}>
          <Icon name="check" size={15} /> {status === "read" ? "Marked Read" : "Mark Read"}
        </button>
      </div>
    </div>
  );
}
