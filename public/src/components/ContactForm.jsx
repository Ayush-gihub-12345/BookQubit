"use client";

import { useState } from "react";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export default function ContactForm() {
  const tr = t(useLang());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState("idle"); // idle | busy | done | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setState("busy"); setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("done");
      setName(""); setEmail(""); setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="card flex items-center gap-3 p-5 hover:!translate-y-0">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <Icon name="check" size={17} />
        </span>
        <div>
          <p className="font-semibold">{tr("messageSent")}</p>
          <p className="text-muted text-sm">{tr("thanksForReachingOut")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-5 hover:!translate-y-0">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("yourName")} className="input" />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr("yourEmail")} className="input" />
      </div>
      <textarea
        required value={message} onChange={(e) => setMessage(e.target.value)}
        rows={5} maxLength={2000} placeholder={tr("howCanWeHelp")}
        className="input resize-y"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={state === "busy" || !message.trim()} className="btn-primary w-full sm:w-auto">
        <Icon name="feather" size={15} /> {state === "busy" ? tr("sending") : tr("sendMessage")}
      </button>
    </form>
  );
}
