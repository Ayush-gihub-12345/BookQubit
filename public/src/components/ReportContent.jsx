"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { safetyAction } from "@/lib/safety-client";

// A quiet "Report" link for reader-made content (a list or a review reply). Goes to the community-reports queue in Admin.
// One open report per reader per item (the server ignores repeats), 20 reports an hour.
export default function ReportContent({ targetType, targetId, label = "Report", className = "" }) {
  const [state, setState] = useState("idle"); // idle | busy | done | error | signin
  const run = async () => {
    if (!getFirebaseAuth()?.currentUser) { setState("signin"); return; }
    setState("busy");
    const r = await safetyAction({ action: "report", targetType, targetId: String(targetId) }).catch(() => null);
    setState(r && r.ok ? "done" : "error");
  };
  if (state === "done") return <span role="status" className="text-muted text-xs">Reported. Thank you.</span>;
  if (state === "signin") return <span role="status" className="text-muted text-xs">Sign in to report.</span>;
  return (
    <button type="button" onClick={run} disabled={state === "busy"} className={`text-muted text-xs hover:underline disabled:opacity-50 ${className}`}>
      {state === "error" ? "Couldn't report. Try again" : label}
    </button>
  );
}
