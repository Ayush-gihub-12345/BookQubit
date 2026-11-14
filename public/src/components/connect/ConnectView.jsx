"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, whenSignedIn } from "@/lib/authFetch";
import { useLang } from "@/lib/useLang";
import { useSafety, safetyAction } from "@/lib/safety-client";

const Card = ({ title, children }) => (
  <section className="border-line bg-surface rounded-2xl border p-5">
    <h2 className="font-editorial text-lg font-semibold">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

function Twins({ lang }) {
  const [twins, setTwins] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    authFetch("/api/twins").then(async (r) => { if (r && r.ok) setTwins((await r.json()).twins); else setFailed(true); }).catch(() => setFailed(true));
  }, []);
  if (failed) return <p className="text-muted text-sm">Couldn&apos;t load suggestions right now.</p>;
  if (!twins) return <div className="skeleton h-24" aria-hidden />;
  if (!twins.length) return <p className="text-muted text-sm">No matches yet. Finish and rate a few books and readers with similar taste will show up here. Readers who keep their activity private never appear.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {twins.map((t) => (
        <li key={t.slug}>
          <Link href={`/${lang}/readers/${encodeURIComponent(t.slug)}`} className="border-line hover:border-brand-500 flex items-center gap-3 rounded-xl border p-3 transition">
            {t.photo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.photo_url} alt="" className="h-10 w-10 rounded-full" />
              : <span className="bg-brand-600 grid h-10 w-10 place-items-center rounded-full font-bold text-[var(--on-brand)]">{(t.name || "R")[0].toUpperCase()}</span>}
            <span className="min-w-0"><span className="block truncate font-medium">{t.name}</span>
              <span className="text-muted text-xs">{t.sharedBooks > 0 ? `${t.sharedBooks} ${t.sharedBooks === 1 ? "book" : "books"} in common` : "Similar taste"}</span></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Privacy({ privacy, onSaved }) {
  const [bio, setBio] = useState(privacy?.bio || "");
  const [msg, setMsg] = useState("");
  useEffect(() => setBio(privacy?.bio || ""), [privacy?.bio]);
  async function save(patch) {
    const r = await authFetch("/api/safety", { method: "PATCH", body: JSON.stringify(patch) });
    setMsg(r && r.ok ? "Saved" : "Couldn't save. Try again.");
    if (r && r.ok) onSaved();
    setTimeout(() => setMsg(""), 2500);
  }
  const Toggle = ({ label, hint, checked, onChange }) => (
    <label className="flex items-start gap-3 py-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand-600 mt-1" />
      <span><span className="block text-sm font-medium">{label}</span><span className="text-muted block text-xs">{hint}</span></span>
    </label>
  );
  return (
    <div>
      <Toggle label="Keep my reading activity private" hint="Hides your shelves, stats, streak and achievements on your profile, and removes you from reader suggestions."
        checked={!!privacy?.hideActivity} onChange={(v) => save({ hideActivity: v })} />
      <Toggle label="Suggest me to readers with similar taste" hint="Turn off to stay out of &ldquo;Reading twins&rdquo; matches."
        checked={privacy ? privacy.discoverable : true} onChange={(v) => save({ discoverable: v })} />
      <label className="mt-2 block"><span className="text-sm font-medium">Profile bio</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} className="border-line bg-surface mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="A line about what you read" />
      </label>
      <div className="mt-2 flex items-center gap-3"><button type="button" onClick={() => save({ bio })} className="btn-primary !px-4 !py-1.5 !text-sm">Save bio</button><span role="status" className="text-brand-700 text-xs">{msg}</span></div>
    </div>
  );
}

export default function ConnectView() {
  const lang = useLang();
  const [user, setUser] = useState(undefined);
  const safety = useSafety();
  useEffect(() => { whenSignedIn().then(setUser); }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <h1 className="font-editorial text-3xl font-semibold">Connect</h1>
      {user === undefined && <div className="skeleton h-40" aria-hidden />}
      {user === null && (
        <div className="border-line bg-surface rounded-2xl border p-8 text-center">
          <p className="font-editorial text-xl">Sign in to meet readers like you</p>
          <Link href={`/${lang}/login`} className="btn-primary mt-4 inline-flex">Sign in</Link>
        </div>
      )}
      {user && (
        <>
          <Card title="Readers with your taste"><Twins lang={lang} /></Card>
          <Card title="Privacy"><Privacy privacy={safety.privacy} onSaved={safety.refresh} /></Card>
          <Card title="Blocked and muted readers">
            {safety.people.length === 0 ? <p className="text-muted text-sm">You haven&apos;t blocked or muted anyone.</p> : (
              <ul className="divide-line divide-y">
                {safety.people.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{p.name} <span className="text-muted">· {p.kind === "block" ? "Blocked" : "Muted"}</span></span>
                    <button type="button" className="text-brand-700 underline" onClick={async () => { await safetyAction({ action: p.kind === "block" ? "unblock" : "unmute", targetUserId: p.id }); safety.refresh(); }}>
                      {p.kind === "block" ? "Unblock" : "Unmute"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
