"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "./Icon";

export default function NewDiscussionForm({ presetBookSlug, presetBookTitle, autoOpen = false }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(autoOpen);
  const [title, setTitle] = useState(presetBookTitle ? `About "${presetBookTitle}"` : "");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(setUser);
  }, []);

  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <Link href="/login" className="btn-primary w-full sm:w-auto">
        <Icon name="feather" size={15} /> Sign in to start a discussion
      </Link>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
        <Icon name="feather" size={15} /> {presetBookTitle ? "Discuss this book" : "Start a discussion"}
      </button>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: await user.getIdToken(), title: title.trim(), body: body.trim(),
          bookSlug: presetBookSlug || undefined,
        }),
      });
      const data = await res.json();
      if (data.id) router.push(`/community/${data.id}`);
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card w-full space-y-3 p-5 hover:!translate-y-0">
      {presetBookTitle && (
        <p className="pill !text-[11px]">
          <Icon name="book" size={11} className="mr-1" /> Linked to: {presetBookTitle}
        </p>
      )}
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140}
        placeholder="What do you want to discuss?" className="input font-medium" autoFocus />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={3000}
        placeholder="Share your thoughts, ask a question, start a debate…" className="input resize-y text-sm" />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
        <button type="submit" disabled={busy || !title.trim() || !body.trim()} className="btn-primary text-sm">
          {busy ? "Posting…" : "Post discussion"}
        </button>
      </div>
    </form>
  );
}
