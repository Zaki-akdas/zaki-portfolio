import { NextResponse } from "next/server";
import { isAdminAsync } from "@/lib/auth";
import { SB_AUTH_ENABLED, ADMIN_EMAIL } from "@/lib/supabaseAuth";
import { STORAGE_ENABLED, listMedia } from "@/lib/supabaseStorage";

export const runtime = "nodejs";

/**
 * Server-side Supabase diagnostics — proves the secret key works end to end
 * from a serverless function (Auth admin API + Storage), never exposed to
 * the client beyond this summary. Admin-only by definition: it wields the
 * secret key's powers (user list).
 */
export async function GET(req: Request) {
  if (!(await isAdminAsync(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!SB_AUTH_ENABLED || !STORAGE_ENABLED) {
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 503 });
  }

  const SB_URL = process.env.SUPABASE_URL!;
  const SB_SECRET = process.env.SUPABASE_SECRET_KEY!;

  // 1. Auth admin API with the secret key (secret keys go on the apikey header)
  const usersRes = await fetch(`${SB_URL}/auth/v1/admin/users?page=1&per_page=50`, {
    headers: { apikey: SB_SECRET },
  });
  if (!usersRes.ok) {
    return NextResponse.json({ error: `Auth admin API failed: ${usersRes.status}` }, { status: 502 });
  }
  const users = (await usersRes.json()) as { users?: { email?: string }[] };

  // 2. Storage with the same key
  let mediaCount = -1;
  try {
    mediaCount = (await listMedia()).length;
  } catch {
    // bucket reachable but listing failed — surface as -1 rather than 500
  }

  return NextResponse.json({
    ok: true,
    project: new URL(SB_URL).hostname.split(".")[0],
    authAdminApi: "ok",
    users: users.users?.length ?? 0,
    adminUserPresent: users.users?.some((u) => (u.email || "").toLowerCase() === ADMIN_EMAIL) ?? false,
    storageBucket: "media",
    mediaObjects: mediaCount,
    time: new Date().toISOString(),
  });
}
