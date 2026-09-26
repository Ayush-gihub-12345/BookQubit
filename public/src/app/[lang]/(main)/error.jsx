"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/useLang";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // error.js is a Client Component error boundary, so getLang() (which reads
  // request headers/cookies) isn't available here — but the layout for this
  // segment (and its router context) stays mounted around the boundary, so
  // usePathname()-based useLang() still resolves the real URL language.
  const lang = useLang();

  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-500">
          <Icon name="eyeOff" size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted mt-2 max-w-sm text-sm">
          This page hit an unexpected error. It's been logged — try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary"><Icon name="trendingUp" size={15} /> Try Again</button>
          <Link href={`/${lang}`} className="btn-ghost">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
