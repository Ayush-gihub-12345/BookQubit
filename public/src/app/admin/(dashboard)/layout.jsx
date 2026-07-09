import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: { default: "Admin", template: "%s — BookQubit Admin" }, robots: { index: false } };

export default async function AdminDashboardLayout({ children }) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
