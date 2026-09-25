"use client";
import { createContext, useContext, useMemo, useCallback } from "react";

const TranslationContext = createContext(null);

export function TranslationProvider({ locale, translation, children }) {
  const t = useCallback(
    (key, vars) => {
      const parts = key.split(".");
      let node = translation;
      for (const p of parts) {
        if (node == null) break;
        node = node[p];
      }
      if (typeof node !== "string") return key;
      if (!vars) return node;
      return node.replace(/\{(\w+)\}/g, (_, k) =>
        vars[k] != null ? String(vars[k]) : `{${k}}`,
      );
    },
    [translation],
  );

  const value = useMemo(
    () => ({ locale, translation, t }),
    [locale, translation, t],
  );
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx)
    throw new Error("useTranslation must be used inside <TranslationProvider>");
  return ctx;
}
export function useT() {
  return useTranslation().t;
}
