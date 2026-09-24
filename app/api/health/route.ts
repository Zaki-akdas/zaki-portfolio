import { NextResponse } from "next/server";
import { getContent } from "@/lib/store";
import { KV_ENABLED } from "@/lib/kv";
import { PG_ENABLED, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = getContent();
    const ok = !!content?.profile?.name;
    // Report the active durable backend; when Postgres is configured, prove it.
    let backend: string | boolean = KV_ENABLED;
    if (PG_ENABLED) {
      await query("select 1");
      backend = "postgres";
    }
    return NextResponse.json(
      { status: ok ? "ok" : "degraded", store: ok ? "readable" : "empty", durable: backend, time: new Date().toISOString() },
      { status: ok ? 200 : 503 }
    );
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
