"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Invalid username or password."); return; }
      router.push("/admin");
      router.refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink-900 px-4">
      <div className="card w-full max-w-sm p-8 hover:!translate-y-0">
        <div className="mb-2 flex justify-center"><Logo size={38} /></div>
        <p className="text-muted mb-6 text-center text-sm">Admin Console</p>
        <form onSubmit={submit} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
            autoComplete="username" required className="input" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
            placeholder="Password" autoComplete="current-password" required className="input" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            <Icon name="shieldCheck" size={15} /> {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
