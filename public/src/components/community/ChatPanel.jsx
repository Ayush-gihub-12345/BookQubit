"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

const POLL_MS = 4000;

// One open discussion's chat thread — polls for new messages (no
// websockets/Durable Objects in this build), and understands three states:
// not a member (show Join), locked out (exited twice, can only read), and
// an active member (can send + leave + archive).
export default function ChatPanel({ discussionId, user, onLeft, onArchiveChange }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const lastIdRef = useRef(0);

  const load = async () => {
    const r = await fetch(`/api/discussions/${discussionId}?uid=${user?.uid || ""}`);
    if (!r.ok) return;
    const d = await r.json();
    setThread(d);
    setMessages(d.posts || []);
    lastIdRef.current = d.posts?.length ? d.posts[d.posts.length - 1].id : 0;
  };

  useEffect(() => {
    setThread(null); setMessages([]); setError("");
    load();
    const poll = setInterval(async () => {
      const r = await fetch(`/api/discussions/${discussionId}/messages?since=${lastIdRef.current}`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.messages?.length) {
        setMessages((prev) => [...prev, ...d.messages]);
        lastIdRef.current = d.messages[d.messages.length - 1].id;
      }
    }, POLL_MS);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!user || !thread?.membership?.active) return;
    (async () => {
      const idToken = await user.getIdToken();
      fetch(`/api/discussions/${discussionId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    })();
  }, [discussionId, thread?.membership?.active, user]);

  if (!thread) return <div className="text-muted grid flex-1 place-items-center text-sm">Loading…</div>;

  const membership = thread.membership;
  const isMember = membership?.active;
  const lockedOut = membership && !membership.active && membership.exit_count >= 2;

  const act = async (path, extra = {}) => {
    if (!user) return;
    setBusy(true); setError("");
    try {
      const idToken = await user.getIdToken();
      const r = await fetch(`/api/discussions/${discussionId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, ...extra }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Something went wrong"); return; }
      await load();
      if (path === "leave") onLeft?.();
      if (path === "archive") onArchiveChange?.();
    } finally { setBusy(false); }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const body = text.trim();
    setText("");
    const idToken = await user.getIdToken();
    const r = await fetch(`/api/discussions/${discussionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, body }),
    });
    if (r.ok) {
      const r2 = await fetch(`/api/discussions/${discussionId}/messages?since=${lastIdRef.current}`);
      const d2 = await r2.json();
      if (d2.messages?.length) {
        setMessages((prev) => [...prev, ...d2.messages]);
        lastIdRef.current = d2.messages[d2.messages.length - 1].id;
      }
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="border-line flex items-center gap-3 border-b p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{thread.title}</p>
          <p className="text-muted flex flex-wrap items-center gap-x-2 text-xs">
            {thread.book_slug && (
              <Link href={`/books/${encodeURIComponent(thread.book_slug)}`} className="hover:text-brand-600">
                <Icon name="book" size={11} className="inline" /> {thread.book_title || thread.book_slug}
              </Link>
            )}
            {thread.author_name && <span><Icon name="feather" size={11} className="inline" /> {thread.author_name}</span>}
            <span>Started by {thread.name}</span>
          </p>
        </div>
        {isMember && (
          <div className="flex shrink-0 gap-2">
            <button disabled={busy} onClick={() => act("archive", { archived: !membership.archived })}
              className="btn-ghost !px-3 text-xs" title={membership.archived ? "Unarchive" : "Archive"}>
              <Icon name={membership.archived ? "arrowRight" : "eyeOff"} size={13} />
            </button>
            <button disabled={busy} onClick={() => act("leave")} className="btn-ghost !px-3 text-xs text-red-500">
              <Icon name="logout" size={13} /> Leave
            </button>
          </div>
        )}
      </div>

      {thread.tags?.length > 0 && (
        <div className="border-line flex flex-wrap gap-1.5 border-b px-4 py-2">
          {thread.tags.map((t) => <span key={t} className="pill !text-[11px]">#{t}</span>)}
        </div>
      )}

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {thread.body && (
          <div className="card !border-brand-500/20 bg-brand-600/5 p-3 text-sm hover:!translate-y-0">
            <p className="text-muted mb-1 text-[11px] font-semibold uppercase tracking-wide">Discussion topic</p>
            <p className="whitespace-pre-line leading-relaxed">{thread.body}</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.user_id === user?.uid;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {m.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo_url} alt="" className="h-7 w-7 shrink-0 rounded-full" />
              ) : (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {(m.name || "R")[0].toUpperCase()}
                </span>
              )}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-brand-600 text-white" : "bg-black/5 dark:bg-white/5"}`}>
                {!mine && <p className="mb-0.5 text-[11px] font-semibold opacity-70">{m.name}</p>}
                <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {!messages.length && <p className="text-muted text-center text-sm">No messages yet — say hello.</p>}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-500">{error}</p>}

      {/* Composer */}
      {isMember ? (
        <form onSubmit={send} className="border-line flex gap-2 border-t p-3">
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Message…" className="input flex-1"
          />
          <button type="submit" disabled={!text.trim()} className="btn-primary !px-4 disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="arrowRight" size={16} />
          </button>
        </form>
      ) : lockedOut ? (
        <div className="border-line border-t p-4 text-center">
          <p className="text-muted text-sm">You've left this discussion twice already and can't rejoin.</p>
        </div>
      ) : (
        <div className="border-line flex items-center justify-between gap-3 border-t p-4">
          <p className="text-muted text-sm">Join this discussion to read and send messages.</p>
          <button disabled={busy} onClick={() => act("join")} className="btn-primary text-sm">
            <Icon name="users" size={14} /> Join Discussion
          </button>
        </div>
      )}
    </div>
  );
}
