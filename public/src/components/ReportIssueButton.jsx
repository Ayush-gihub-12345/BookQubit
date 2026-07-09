"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import Icon from "./Icon";

export default function ReportIssueButton({ bookSlug }) {
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
        <Icon name="shieldCheck" size={12} /> Report missing or incorrect information
      </button>
    );
  }

  if (state === "done") {
    return <p className="text-xs font-medium text-emerald-500">Thanks — our team will review this.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={message} onChange={(e) => setMessage(e.target.value)} required rows={3} maxLength={1000}
        placeholder="What's missing or incorrect about this book listing?"
        className="input resize-y text-xs"
      />
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost !px-3 !py-1.5 text-xs">Cancel</button>
        <button type="submit" disabled={state === "busy" || !message.trim()} className="btn-primary !px-3 !py-1.5 text-xs">
          {state === "busy" ? "Sending…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}
