import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/repo";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function PUT(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const patch = await request.json();
  await updateSiteSettings(patch);
  return NextResponse.json({ ok: true });
}
