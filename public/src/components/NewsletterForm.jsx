"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function NewsletterForm({ lang, labels }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | busy | done | error

  const submit = async (e) => {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      setState(res.ok ? "done" : "error");
    } catch { setState("error"); }
  };

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-500">
        <Icon name="check" size={15} /> {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-sm gap-2">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.placeholder} className="input py-2 text-sm"
      />
      <button type="submit" disabled={state === "busy"} className="btn-primary shrink-0 !px-4 py-2 text-sm">
        {labels.button}
      </button>
      {state === "error" && <span className="sr-only">Subscription failed, please try again.</span>}
    </form>
  );
}
