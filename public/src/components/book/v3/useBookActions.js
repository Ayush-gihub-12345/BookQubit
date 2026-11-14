"use client";

// The per-reader state of one book (like, wishlist, shelf status, progress) and the actions that change it.
// Same endpoints and behaviour as the old QuickActions (/api/follow, /api/shelf, localStorage wishlist), now shared by
// the v3 hero, the sticky bar and the phone bar so they can never disagree.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { readWishlist } from "@/components/WishlistButton";
import { useLang } from "@/lib/useLang";

export default function useBookActions(book) {
  const lang = useLang();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    setWishlisted(readWishlist().some((b) => b.slug === book.slug));
    const auth = getFirebaseAuth();
    const loadLike = async (u) => {
      try {
        const r = await authFetch(`/api/follow?type=book_like&id=${encodeURIComponent(book.slug)}`, {}, u);
        const d = await r.json();
        setLikeCount(d.count); setLiked(!!d.following);
      } catch { /* offline: leave the counts empty */ }
    };
    if (!auth) { loadLike(); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      loadLike(u);
      if (u) {
        authFetch(`/api/shelf?slug=${encodeURIComponent(book.slug)}`, {}, u)
          .then((r) => r.json()).then((d) => { setStatus(d.entry?.status || null); setProgress(d.entry?.progress || 0); })
          .catch(() => {});
      }
    });
  }, [book.slug]);

  const needLogin = useCallback(() => { router.push(`/${lang}/login`); }, [router, lang]);

  const toggleWishlist = useCallback(() => {
    const list = readWishlist();
    const next = wishlisted
      ? list.filter((b) => b.slug !== book.slug)
      : [...list, { slug: book.slug, title: book.title, author: book.author, cover_url: book.cover_url, rating: book.rating }];
    try { localStorage.setItem("bq_wishlist", JSON.stringify(next)); } catch { /* storage blocked */ }
    setWishlisted(!wishlisted);
  }, [wishlisted, book]);

  const toggleLike = useCallback(async () => {
    if (!user) return needLogin();
    const next = !liked;
    setLiked(next); setLikeCount((c) => (c ?? 0) + (next ? 1 : -1));
    await fetch("/api/follow", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: await user.getIdToken(), type: "book_like", id: book.slug, follow: next }),
    });
  }, [user, liked, book.slug, needLogin]);

  const share = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ url, title: book.title }); return; } catch { /* fall through to copy */ } }
    try { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); } catch { /* no clipboard */ }
  }, [book.title]);

  // Choosing the status the book already has takes it off the shelf (DELETE); choosing another sets it.
  const setShelf = useCallback(async (next, { toggle = true } = {}) => {
    if (!user) return needLogin();
    setBusy(true);
    const removing = toggle && status === next;
    setStatus(removing ? null : next);
    if (next === "read") setProgress(100);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/shelf", {
        method: removing ? "DELETE" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(removing ? { idToken, slug: book.slug } : { idToken, slug: book.slug, status: next }),
      });
    } finally { setBusy(false); }
  }, [user, status, book.slug, needLogin]);

  const removeFromShelf = useCallback(async () => {
    if (!user || !status) return;
    setStatus(null);
    await fetch("/api/shelf", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await user.getIdToken(), slug: book.slug }) });
  }, [user, status, book.slug]);

  // Debounced so dragging the slider is one write, not one per pixel.
  const saveProgress = useCallback((value) => {
    setProgress(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!user) return;
      await fetch("/api/shelf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await user.getIdToken(), slug: book.slug, status: "reading", progress: value }) });
    }, 500);
  }, [user, book.slug]);

  return { lang, signedIn: !!user, liked, likeCount, wishlisted, status, progress, busy, shared, toggleLike, toggleWishlist, share, setShelf, removeFromShelf, saveProgress };
}
