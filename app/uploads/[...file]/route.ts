import { NextRequest, NextResponse } from "next/server";
import { STORAGE_ENABLED, SB_URL } from "@/lib/supabaseStorage";

export const dynamic = "force-dynamic";

// /uploads/<name> — historical URL space for media. Every object lives in
// Supabase Storage's public `media` bucket; this route exists so old
// `/uploads/...` links keep working, redirecting (302, self-healing on
// deletion) to the object's CDN URL. Local files are never read.
export async function GET(_req: NextRequest, { params }: { params: { file: string[] } }) {
  const name = params.file.join("/");
  const safe = name
    .split("/")
    .map((seg) => seg.replace(/^\.+/, ""))
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  if (!STORAGE_ENABLED || !safe) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.redirect(`${SB_URL}/storage/v1/object/public/media/${safe}`, 302);
}
