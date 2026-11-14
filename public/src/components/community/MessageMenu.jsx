"use client";

import { useState } from "react";
import { safetyAction } from "@/lib/safety-client";

// Report / mute / block for another reader's message. Lives in a <details> so it's keyboard and
// screen-reader friendly with no extra state. After mute/block the parent refreshes the safety lists,
// which immediately hides that reader everywhere on the page.
export default function MessageMenu({ messageId, userId, name, onChanged }) {
  const [note, setNote] = useState("");
  async function run(label, body) {
    const r = await safetyAction(body);
    if (r && r.ok) { setNote(label); onChanged?.(); } else setNote("Couldn't do that. Try again.");
  }
  return (
    <details className="relative inline-block text-[11px]">
      <summary className="text-muted hover:text-fg cursor-pointer list-none px-1" aria-label={`More actions for ${name}`}>⋯</summary>
      <div className="border-line bg-surface absolute end-0 z-20 mt-1 w-40 rounded-xl border p-1 shadow-lg">
        <button type="button" className="hover:bg-brand-50 block w-full rounded-lg px-3 py-1.5 text-start" onClick={() => run("Reported. Thank you.", { action: "report", targetType: "discussion_post", targetId: String(messageId) })}>Report message</button>
        <button type="button" className="hover:bg-brand-50 block w-full rounded-lg px-3 py-1.5 text-start" onClick={() => run(`Muted ${name}`, { action: "mute", targetUserId: userId })}>Mute {name}</button>
        <button type="button" className="hover:bg-brand-50 block w-full rounded-lg px-3 py-1.5 text-start text-red-600" onClick={() => run(`Blocked ${name}`, { action: "block", targetUserId: userId })}>Block {name}</button>
        {note && <p role="status" className="text-muted px-3 py-1">{note}</p>}
      </div>
    </details>
  );
}
