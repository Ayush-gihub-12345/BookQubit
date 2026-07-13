"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "@/components/Icon";
import ChatPanel from "@/components/community/ChatPanel";
import NewDiscussionModal from "@/components/community/NewDiscussionModal";

function timeAgo(iso) {
  if (!iso) return "";
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityInner />
    </Suspense>
  );
}

function CommunityInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  const [tab, setTab] = useState("chats"); // chats | archived | discover
  const [mine, setMine] = useState([]);
  const [q, setQ] = useState("");
  const [discover, setDiscover] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [presetBook, setPresetBook] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged(setUser);
  }, []);

  const loadMine = async () => {
    if (!user) return;
    const r = await fetch(`/api/discussions/mine?uid=${user.uid}`);
    const d = await r.json();
    setMine(d.discussions || []);
  };

  useEffect(() => { loadMine(); }, [user]);

  useEffect(() => {
    const bookSlug = sp.get("book");
    const title = sp.get("title");
    const openId = sp.get("open");
    if (openId) setSelected(Number(openId));
    if (bookSlug) {
      setPresetBook({ slug: bookSlug, title: title ? decodeURIComponent(title) : bookSlug });
      setTab("discover");
      setQ(title ? decodeURIComponent(title) : bookSlug);
    }
  }, [sp]);

  useEffect(() => {
    if (tab !== "discover") return;
    const t = setTimeout(async () => {
      const r = await fetch(`/api/discussions/search?q=${encodeURIComponent(q)}&uid=${user?.uid || ""}`);
      const d = await r.json();
      setDiscover(d.discussions || []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, tab, user]);

  const join = async (id) => {
    if (!user) { router.push("/login"); return; }
    const idToken = await user.getIdToken();
    const r = await fetch(`/api/discussions/${id}/join`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (r.ok) { await loadMine(); setSelected(id); setTab("chats"); }
  };

  if (!firebaseEnabled) return <div className="text-muted grid min-h-[50vh] place-items-center">Community requires sign-in.</div>;
  if (user === undefined) return null;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Icon name="users" size={32} className="text-muted mx-auto" />
        <p className="mt-3 font-semibold">Sign in to join the conversation</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex">Sign in</Link>
      </div>
    );
  }

  const visibleChats = mine.filter((d) => Boolean(d.archived) === (tab === "archived"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted text-sm">Join discussions with fellow readers, book by book.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary text-sm">
          <Icon name="feather" size={14} /> New Discussion
        </button>
      </div>

      <div className="card grid overflow-hidden hover:!translate-y-0 lg:grid-cols-[320px_1fr]" style={{ height: "70vh" }}>
        {/* Sidebar */}
        <div className="border-line flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
          <div className="border-line flex border-b p-2">
            {[["chats", "Chats"], ["archived", "Archived"], ["discover", "Discover"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${tab === id ? "bg-brand-600 text-white" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "discover" && (
            <div className="border-line border-b p-2">
              <div className="relative">
                <Icon name="search" size={13} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search discussions…" className="input w-full !pl-8 text-sm" />
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "discover" ? (
              discover.length ? discover.map((d) => (
                <button key={d.id} onClick={() => (d.my_active ? setSelected(d.id) : join(d.id))}
                  className={`flex w-full items-start gap-2.5 border-b border-line px-3 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 ${selected === d.id ? "bg-brand-600/10" : ""}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600/15 text-brand-600">
                    <Icon name={d.book_slug ? "book" : "feather"} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-semibold">{d.title}</span>
                    <span className="text-muted line-clamp-1 block text-xs">
                      {d.book_title || d.author_name} · {d.members} member{d.members === 1 ? "" : "s"}
                    </span>
                  </span>
                  {d.my_exit_count >= 2 && !d.my_active ? (
                    <span className="text-muted shrink-0 text-[10px]">Locked</span>
                  ) : d.my_active ? (
                    <span className="shrink-0 text-[10px] font-semibold text-brand-600">Open</span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-semibold text-brand-600">Join</span>
                  )}
                </button>
              )) : <p className="text-muted p-4 text-center text-sm">Search for a discussion by title or tag.</p>
            ) : visibleChats.length ? (
              visibleChats.map((d) => (
                <button key={d.id} onClick={() => setSelected(d.id)}
                  className={`flex w-full items-start gap-2.5 border-b border-line px-3 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 ${selected === d.id ? "bg-brand-600/10" : ""}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600/15 text-brand-600">
                    <Icon name={d.book_slug ? "book" : "feather"} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-semibold">{d.title}</span>
                    <span className="text-muted line-clamp-1 block text-xs">{d.last_message || "No messages yet"}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-muted text-[10px]">{timeAgo(d.last_message_at || d.created_at)}</span>
                    {d.unread > 0 && (
                      <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{d.unread}</span>
                    )}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-muted p-4 text-center text-sm">
                {tab === "archived" ? "No archived discussions." : "No discussions yet — join one from Discover or start your own."}
              </p>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex min-h-0 flex-col">
          {selected ? (
            <ChatPanel
              key={selected}
              discussionId={selected}
              user={user}
              onLeft={() => { setSelected(null); loadMine(); }}
              onArchiveChange={loadMine}
            />
          ) : (
            <div className="text-muted grid flex-1 place-items-center p-6 text-center text-sm">
              <div>
                <Icon name="users" size={28} className="mx-auto" />
                <p className="mt-2">Select a discussion, or start a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <NewDiscussionModal
          user={user}
          presetBook={presetBook}
          onClose={() => setShowNew(false)}
          onCreated={(id) => { setShowNew(false); loadMine(); setSelected(id); setTab("chats"); }}
        />
      )}
    </div>
  );
}
