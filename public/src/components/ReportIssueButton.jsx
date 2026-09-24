"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export default function ReportIssueButton({ bookSlug }) {
  const tr = t(useLang());
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    setState("busy");
    try {
      const user = getFirebaseAuth()?.currentUser;
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug, message, userId: user?.uid || null }),
      });
      setState("done");
      setMessage("");
    } catch { setState("idle"); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-muted flex items-center gap-1.5 text-xs hover:text-brand-600">
        <Icon name="shieldCheck" size={12} /> {tr("reportMissingInfo")}
      </button>
    );
  }

  if (state === "done") {
    return <p className="text-xs font-medium text-emerald-500">{tr("reportThanks")}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={message} onChange={(e) => setMessage(e.target.value)} required rows={3} maxLength={1000}
        placeholder={tr("reportPlaceholder")}
        className="input resize-y text-xs"
      />
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost !px-3 !py-1.5 text-xs">{tr("cancel")}</button>
        <button type="submit" disabled={state === "busy" || !message.trim()} className="btn-primary !px-3 !py-1.5 text-xs">
          {state === "busy" ? tr("sendingWord") : tr("submitReport")}
        </button>
      </div>
    </form>
  );
}
