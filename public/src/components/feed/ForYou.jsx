"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { useT } from "@/context/TranslationContext";
import FeedSection from "./FeedSection";
import FeedBookCard from "./FeedBookCard";
import FeedEmpty from "./FeedEmpty";

export default function ForYou() {
  const t = useT();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState({
    continueReading: [],
    recommended: [],
    fromYourAuthors: [],
    trending: [],
    newInGenres: [],
  });

  // Track auth state
  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    return auth.onAuthStateChanged(setUser);
  }, []);

  // Fetch feed data once we know the user
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const uid = user?.uid ? `?uid=${user.uid}` : "";

        const [rec, cont, trend] = await Promise.all([
          fetch(`/api/recommendations${uid}`)
            .then((r) => r.json())
            .catch(() => ({})),
          user
            ? fetch(`/api/shelf?status=reading&uid=${user.uid}`)
                .then((r) => r.json())
                .catch(() => ({}))
            : Promise.resolve({}),
          fetch(`/api/books?sort=rating&limit=12`)
            .then((r) => r.json())
            .catch(() => ({})),
        ]);

        if (cancelled) return;

        setSections({
          continueReading: cont.books || cont.items || [],
          recommended: rec.books || rec.items || [],
          fromYourAuthors: rec.fromAuthors || [],
          trending: trend.books || trend.items || [],
          newInGenres: rec.byGenres || [],
        });
      } catch (e) {
        console.error("[feed] load failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!firebaseEnabled) {
    return <FeedEmpty signedOut />;
  }

  if (loading && !user && !sections.trending.length) {
    return <FeedSkeleton />;
  }

  if (!user) {
    return <FeedEmpty signedOut />;
  }

  const isEmpty =
    sections.continueReading.length === 0 &&
    sections.recommended.length === 0 &&
    sections.fromYourAuthors.length === 0 &&
    sections.trending.length === 0 &&
    sections.newInGenres.length === 0;

  if (isEmpty) {
    return <FeedEmpty />;
  }

  return (
    <>
      {sections.continueReading.length > 0 && (
        <FeedSection title={t("feed.continueReading")} href="/shelf">
          {sections.continueReading.map((b) => (
            <FeedBookCard key={b.slug || b.id} book={b} />
          ))}
        </FeedSection>
      )}

      {sections.recommended.length > 0 && (
        <FeedSection
          title={t("feed.recommendedForYou")}
          subtitle={t("feed.basedOnYourReading")}
          href="/books?sort=rating"
        >
          {sections.recommended.map((b) => (
            <FeedBookCard key={b.slug || b.id} book={b} />
          ))}
        </FeedSection>
      )}

      {sections.fromYourAuthors.length > 0 && (
        <FeedSection title={t("feed.fromAuthorsYouFollow")} href="/authors">
          {sections.fromYourAuthors.map((b) => (
            <FeedBookCard key={b.slug || b.id} book={b} />
          ))}
        </FeedSection>
      )}

      {sections.newInGenres.length > 0 && (
        <FeedSection title={t("feed.newInYourGenres")} href="/books?sort=new">
          {sections.newInGenres.map((b) => (
            <FeedBookCard key={b.slug || b.id} book={b} />
          ))}
        </FeedSection>
      )}

      {sections.trending.length > 0 && (
        <FeedSection title={t("feed.trendingNow")} href="/books?sort=rating">
          {sections.trending.map((b) => (
            <FeedBookCard key={b.slug || b.id} book={b} />
          ))}
        </FeedSection>
      )}
    </>
  );
}

function FeedSkeleton() {
  return (
    <>
      {[0, 1, 2].map((s) => (
        <section key={s} className="mb-10">
          <div className="bg-muted/20 mb-4 h-6 w-40 animate-pulse rounded" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/20 h-64 w-40 shrink-0 animate-pulse rounded-2xl sm:w-44"
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
