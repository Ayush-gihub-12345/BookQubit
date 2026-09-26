"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { useToast } from "@/components/Toast";
import Icon from "@/components/Icon";
import TitleTransliterated from "@/components/TitleTransliterated";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export default function NotificationsPage() {
  const lang = useLang();
  const tr = t(lang);
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(undefined);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) { router.push(`/${lang}/login`); return; }
      fetch(`/api/notifications?uid=${u.uid}`).then((r) => r.json()).then((d) => setItems(d.notifications || []));
    });
  }, [router]);

  const respond = async (id, action) => {
    setBusyId(id);
    try {
      const idToken = await user.getIdToken();
      const r = await fetch(`/api/notifications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, action }),
      });
      if (r.ok) {
        const discussionId = items.find((n) => n.id === id)?.discussion_id;
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (action === "join") {
          toast(tr("joinedDiscussionToast"));
          router.push(`/${lang}/community?open=${discussionId}`);
        } else {
          toast(tr("notificationDismissedToast"));
        }
      }
    } finally { setBusyId(null); }
  };

  if (!firebaseEnabled || user === undefined) return null;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-2">
        <Icon name="bell" size={22} className="text-brand-600" />
        <h1 className="text-2xl font-bold">{tr("notificationsWord")}</h1>
      </div>
      <p className="text-muted mt-1 text-sm">{tr("notificationsSubtitle")}</p>

      {items.length ? (
        <div className="mt-6 space-y-3">
          {items.map((n) => (
            <div key={n.id} className="card p-4 hover:!translate-y-0">
              <p className="text-muted text-xs">
                {n.book_title
                  ? tr("discussionStartedOn", { name: n.starter_name })
                  : n.author_name
                    ? tr("discussionStartedAbout", { name: n.starter_name })
                    : tr("discussionStarted", { name: n.starter_name })}
                {n.book_title ? (
                  <Link href={`/${lang}/books/${encodeURIComponent(n.book_slug)}`} className="font-medium text-brand-600 hover:underline">
                    <TitleTransliterated text={n.book_title} />
                  </Link>
                ) : n.author_name ? (
                  <TitleTransliterated text={n.author_name} />
                ) : null}
              </p>
              <h2 className="mt-1 font-semibold">{n.title}</h2>
              {n.body && <p className="text-muted mt-1 line-clamp-2 text-sm">{n.body}</p>}
              {n.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => <span key={t} className="pill !text-[11px]">#{t}</span>)}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button disabled={busyId === n.id} onClick={() => respond(n.id, "join")} className="btn-primary text-sm">
                  <Icon name="check" size={13} /> {tr("joinAction")}
                </button>
                <button disabled={busyId === n.id} onClick={() => respond(n.id, "pass")} className="btn-ghost text-sm">
                  <Icon name="x" size={13} /> {tr("passAction")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-10 p-10 text-center hover:!translate-y-0">
          <Icon name="bell" size={26} className="text-muted mx-auto" />
          <p className="mt-3 font-semibold">{tr("allCaughtUpMessage")}</p>
          <p className="text-muted mt-1 text-sm">{tr("notifyWhenMatchMessage")}</p>
        </div>
      )}
    </div>
  );
}
