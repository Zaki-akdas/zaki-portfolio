import { NextResponse } from "next/server";
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = getContent();
    const ok = !!content?.profile?.name;
    return NextResponse.json(
      { status: ok ? "ok" : "degraded", store: ok ? "readable" : "empty", time: new Date().toISOString() },
      { status: ok ? 200 : 503 }
    );
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
