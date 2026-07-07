"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!firebaseEnabled) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="text-5xl">🔐</p>
          <h1 className="mt-4 text-2xl font-bold">Sign-in not configured</h1>
          <p className="text-muted mt-2 text-sm">
            Set the NEXT_PUBLIC_FIREBASE_* build variables to enable authentication.
          </p>
        </div>
      </div>
    );
  }

  const google = async () => {
    setBusy(true); setError("");
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      router.push("/account");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const auth = getFirebaseAuth();
      if (mode === "signin") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      router.push("/account");
    } catch (e) { setError(e.message.replace("Firebase: ", "")); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8 hover:!translate-y-0">
        <h1 className="text-center text-2xl font-bold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted mt-1 text-center text-sm">
          Save books to your wishlist and sync across devices
        </p>

        <button onClick={google} disabled={busy} className="btn-ghost mt-6 w-full">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/></svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} className="input" />
          <input type="password" required minLength={6} placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} className="input" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-brand-600 hover:underline"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
