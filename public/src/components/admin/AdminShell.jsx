"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";

const NAV = [
  { href: "/admin", icon: "grid", label: "Dashboard", exact: true },
  { href: "/admin/books", icon: "book", label: "Books" },
  { href: "/admin/authors", icon: "feather", label: "Authors" },
  { href: "/admin/publications", icon: "building", label: "Publishers" },
  { href: "/admin/comics", icon: "zap", label: "Comics" },
  { href: "/admin/users", icon: "users", label: "Users" },
  { href: "/admin/reviews", icon: "star", label: "Reviews" },
  { href: "/admin/discussions", icon: "bookOpen", label: "Discussions" },
  { href: "/admin/reports", icon: "shieldCheck", label: "Reports" },
  { href: "/admin/contact", icon: "feather", label: "Contact" },
  { href: "/admin/settings", icon: "grid", label: "Settings" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const NavLinks = () => (
    <nav className="space-y-0.5">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-brand-600 text-white shadow" : "text-muted hover:bg-white/5 hover:text-white"
            }`}>
            <Icon name={n.icon} size={15} /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-900 text-slate-200 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 p-4 lg:flex">
        <div className="mb-6 px-1"><Logo size={30} /></div>
        <NavLinks />
        <div className="mt-auto space-y-1 pt-4">
          <Link href="/" target="_blank" className="text-muted flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white">
            <Icon name="compass" size={15} /> View site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
            <Icon name="logout" size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-white/10 p-4 lg:hidden">
        <Logo size={28} />
        <button onClick={() => setOpen(!open)} className="rounded-lg border border-white/10 p-2">
          <Icon name="menu" size={16} />
        </button>
      </div>
      {open && (
        <div className="border-b border-white/10 p-4 lg:hidden">
          <NavLinks />
          <button onClick={logout} className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
            <Icon name="logout" size={15} /> Sign out
          </button>
        </div>
      )}

      <main className="min-w-0 flex-1 bg-[#0d1322] p-4 sm:p-8">{children}</main>
    </div>
  );
}
