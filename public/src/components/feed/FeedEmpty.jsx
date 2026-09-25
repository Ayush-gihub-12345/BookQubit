"use client";

import Link from "next/link";
import { useT } from "@/context/TranslationContext";
import Icon from "../Icon";

export default function FeedEmpty({ signedOut = false }) {
  const t = useT();

  return (
    <div className="border-line bg-surface mx-auto max-w-md rounded-3xl border p-10 text-center">
      <div className="bg-brand-50 dark:bg-brand-500/10 mx-auto grid h-14 w-14 place-items-center rounded-2xl text-brand-600">
        <Icon name={signedOut ? "user" : "star"} size={22} />
      </div>
      <h2 className="mt-4 text-lg font-bold">
        {signedOut ? t("feed.signInTitle") : t("feed.emptyTitle")}
      </h2>
      <p className="text-muted mt-1 text-sm">
        {signedOut ? t("feed.signInSub") : t("feed.emptySub")}
      </p>
      {signedOut ? (
        <Link href="/login" className="btn-primary mt-5 inline-flex">
          {t("nav.signIn")}
        </Link>
      ) : (
        <Link href="/books" className="btn-primary mt-5 inline-flex">
          {t("browse.allBooks")}
        </Link>
      )}
    </div>
  );
}
