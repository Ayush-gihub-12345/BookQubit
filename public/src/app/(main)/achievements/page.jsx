"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "@/components/Icon";

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) { router.push("/login"); return; }
      fetch(`/api/achievements?uid=${u.uid}`).then((r) => r.json()).then((d) => setAchievements(d.achievements || []));
    });
  }, [router]);

  if (!firebaseEnabled || user === undefined) return null;
  if (!user) return null;

  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
          <Icon name="award" size={26} />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted mx-auto mt-2 max-w-md text-sm">
          {unlocked.length} of {achievements.length} unlocked — every one earned by actually reading, not just showing up.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((a) => (
          <div key={a.id} className={`card p-5 text-center hover:!translate-y-0 ${a.unlocked ? "!border-brand-500/40" : "opacity-60"}`}>
            <span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${a.unlocked ? "bg-brand-600 text-white" : "bg-black/5 text-muted dark:bg-white/10"}`}>
              <Icon name={a.icon} size={22} />
            </span>
            <p className="mt-3 text-sm font-bold">{a.name}</p>
            <p className="text-muted mt-1 text-xs leading-relaxed">{a.desc}</p>
            <div className="bg-line mt-3 h-1.5 w-full overflow-hidden rounded-full">
              <div className={`h-full ${a.unlocked ? "bg-brand-600" : "bg-brand-600/40"}`}
                style={{ width: `${Math.min(100, (a.progress / a.target) * 100)}%` }} />
            </div>
            <p className="text-muted mt-1.5 text-[11px]">{Math.min(a.current, a.target)} / {a.target}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
