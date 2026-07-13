"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Icon from "./Icon";

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: "check", accent: "text-emerald-500" },
  error: { icon: "x", accent: "text-red-500" },
  info: { icon: "bell", accent: "text-brand-600" },
};

// Global toast system — mounted once at the true app root (src/app/layout.jsx)
// so any client component anywhere (public site or admin) can call useToast().
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {toasts.map((t) => {
          const s = STYLES[t.type] || STYLES.success;
          return (
            <div key={t.id}
              className="toast-in bg-surface border-line pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl">
              <Icon name={s.icon} size={16} className={`shrink-0 ${s.accent}`} />
              <p className="text-sm font-medium">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-muted ml-1 shrink-0 hover:opacity-70">
                <Icon name="x" size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .toast-in { animation: toastIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: none; } }
      `}</style>
    </ToastContext.Provider>
  );
}

// toast("Message") | toast("Message", "error") | toast("Message", "info")
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within ToastProvider");
  return toast;
}
