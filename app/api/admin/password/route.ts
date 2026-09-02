import { NextResponse } from "next/server";
import { isAdmin, setPassword, checkPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (!checkPassword(current)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  if (next.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }
  setPassword(next);
  return NextResponse.json({ ok: true });
}
