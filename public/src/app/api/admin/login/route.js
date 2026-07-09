import { NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession } from "@/lib/admin-auth";

export async function POST(request) {
  const { username, password } = await request.json();
  const ok = await verifyAdminCredentials(username, password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
