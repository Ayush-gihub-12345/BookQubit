"use client";

import { usePathname } from "next/navigation";

// Footer itself is an async Server Component (fetches platform stats/site
// settings), so it's rendered by the parent layout and passed in as
// `children` here — this wrapper only decides whether to include that
// already-rendered output, it never imports/renders Footer directly (a
// Client Component can't import a Server Component, but it can receive one
// as children). Community is a full-height, app-like chat surface — a
// marketing footer underneath just adds a dead scroll zone below the chat.
const HIDE_ON = ["/community"];

export default function ConditionalFooter({ children }) {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return children;
}
