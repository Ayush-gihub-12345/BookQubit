"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Logo from "@/components/Logo";

const RESEND_COOLDOWN_S = 30;

// Shown right after email/password sign-up, before onboarding. Google
// sign-ins never land here — that provider is already verified, and
// login/page.jsx routes those straight past this step.
export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

  const idToken = async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) { router.push("/login"); return null; }
    return auth.currentUser.getIdToken();
  };

  const sendCode = async () => {
    setError("");
    const token = await idToken();
    if (!token) return;
    const r = await fetch("/api/auth/send-verification", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    const data = await r.json();
    if (!r.ok) { setError(data.error || "Could not send the code. Try again."); return; }
    setCooldown(RESEND_COOLDOWN_S);
  };

  // Fire once on mount — not on every render/re-focus.
  useEffect(() => {
    if (sentOnce.current || !firebaseEnabled) return;
    sentOnce.current = true;
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const token = await idToken();
      if (!token) return;
      const r = await fetch("/api/auth/verify-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token, code }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Verification failed."); return; }
      router.push("/onboarding");
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseEnabled) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8 hover:!translate-y-0">
        <div className="mb-4 flex justify-center"><Logo size={40} /></div>
        <h1 className="text-center text-2xl font-bold">Check your email</h1>
        <p className="text-muted mt-1 text-center text-sm">
          We sent a 6-digit code to your email address. Enter it below to finish creating your account.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            placeholder="123456"
            className="input text-center text-2xl tracking-[0.5em]"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full">
            {busy ? "…" : "Verify"}
          </button>
        </form>

        <button
          onClick={sendCode}
          disabled={cooldown > 0}
          className="mt-4 w-full text-center text-sm text-brand-600 hover:underline disabled:text-muted disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
