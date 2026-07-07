"use client";

import { useEffect, useState } from "react";

const KEY = "bq_wishlist";
export const readWishlist = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export default function WishlistButton({ book, labels }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readWishlist().some((b) => b.slug === book.slug));
  }, [book.slug]);

  const toggle = () => {
    const list = readWishlist();
    const next = saved
      ? list.filter((b) => b.slug !== book.slug)
      : [...list, { slug: book.slug, title: book.title, author: book.author, cover_url: book.cover_url, rating: book.rating }];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  return (
    <button onClick={toggle} className={`btn-ghost w-full ${saved ? "!border-brand-500 !text-brand-600" : ""}`}>
      {saved ? "♥" : "♡"} {saved ? labels.saved : labels.save}
    </button>
  );
}
