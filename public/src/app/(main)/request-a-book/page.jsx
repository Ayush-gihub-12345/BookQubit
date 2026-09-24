"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { useToast } from "@/components/Toast";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export default function RequestABookPage() {
  const router = useRouter();
  const toast = useToast();
  const tr = t(useLang());
  const STATUS_LABEL = {
    pending: { text: tr("statusPending"), cls: "!bg-amber-500/15 !text-amber-500" },
    added: { text: tr("statusAdded"), cls: "!bg-emerald-500/15 !text-emerald-500" },
    declined: { text: tr("statusDeclined"), cls: "" },
  };
  const [user, setUser] = useState(undefined);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState([]);

  const loadMine = (uid) => fetch(`/api/requests?uid=${uid}`).then((r) => r.json()).then((d) => setMine(d.requests || []));

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) { router.push("/login"); return; }
      loadMine(u.uid);
    });
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const idToken = await user.getIdToken();
      const r = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, title: title.trim(), author: author.trim(), note: note.trim() }),
      });
      if (r.ok) {
        toast(tr("requestSubmittedToast"));
        setTitle(""); setAuthor(""); setNote("");
        loadMine(user.uid);
      } else {
        toast(tr("requestFailedToast"), "error");
      }
    } finally { setBusy(false); }
  };

  if (!firebaseEnabled || user === undefined) return null;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
          <Icon name="bookmark" size={26} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">{tr("requestABookTitle")}</h1>
        <p className="text-muted mx-auto mt-2 max-w-md text-sm">
          {tr("requestABookSub")}
        </p>
      </div>

      <form onSubmit={submit} className="card mt-8 space-y-3 p-6 hover:!translate-y-0">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required
          placeholder={tr("bookTitlePlaceholder")} className="input w-full" />
        <input value={author} onChange={(e) => setAuthor(e.target.value)}
          placeholder={tr("authorOptionalPlaceholder")} className="input w-full" />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder={tr("requestNotePlaceholder")} className="input w-full resize-none" />
        <button type="submit" disabled={busy || !title.trim()} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? tr("submittingLabel") : tr("submitRequestLabel")}
        </button>
      </form>

      {mine.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold">{tr("yourRequestsLabel")}</h2>
          <div className="mt-3 space-y-2.5">
            {mine.map((r) => {
              const s = STATUS_LABEL[r.status] || STATUS_LABEL.pending;
              return (
                <div key={r.id} className="card flex items-center justify-between gap-3 p-4 hover:!translate-y-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    {r.author && <p className="text-muted truncate text-xs">{r.author}</p>}
                  </div>
                  <span className={`pill !text-xs ${s.cls}`}>{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
