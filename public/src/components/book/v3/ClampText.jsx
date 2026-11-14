"use client";

// Long text clamped to a few lines with "Read more". Children are rendered as given (they may be translated text).
import { useState } from "react";
import Icon from "@/components/Icon";

export default function ClampText({ children, lines = 7, long = true }) {
  const [more, setMore] = useState(false);
  return (
    <div>
      <div className={long && !more ? "line-clamp-[7] [&>*]:!m-0" : ""} style={long && !more && lines !== 7 ? { WebkitLineClamp: lines } : undefined}>{children}</div>
      {long && (
        <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-700">
          {more ? "Show less" : "Read more"}<Icon name="chevronDown" size={16} className={more ? "rotate-180" : ""} />
        </button>
      )}
    </div>
  );
}
