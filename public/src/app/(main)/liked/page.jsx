"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import BookCard from "@/components/BookCard";
import Icon from "@/components/Icon";

export default function LikedBooksPage() {
  const [user, setUser] = useState(undefined);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) { setLoading(false); return; }
      fetch(`/api/liked?uid=${u.uid}`).then((r) => r.json())
        .then((d) => setBooks(d.books || []))
        .finally(() => setLoading(false));
    });
  }, []);

  if (!firebaseEnabled) return <div className="text-muted grid min-h-[50vh] place-items-center">Sign-in is not configured.</div>;
  if (user === undefined || loading) return <div className="text-muted grid min-h-[50vh] place-items-center">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Icon name="heart" size={32} className="text-muted mx-auto" />
        <p className="mt-4 font-semibold">Sign in to see your liked books</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Icon name="heart" size={26} filled className="text-brand-600" /> Liked Books
      </h1>
      <p className="text-muted mt-1 text-sm">{books.length} {books.length === 1 ? "book" : "books"} you've liked</p>

      {books.length ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      ) : (
        <div className="text-muted mt-10 text-center">
          <p className="mt-2">Nothing liked yet — tap Like on any book.</p>
          <Link href="/books" className="btn-primary mt-4 inline-flex">Browse Books</Link>
        </div>
      )}
    </div>
  );
}
