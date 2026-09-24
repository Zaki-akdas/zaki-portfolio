import { NextResponse } from "next/server";
import path from "path";
import { isAdminAsync } from "@/lib/auth";
import { scrubSvg } from "@/lib/svg";
import { STORAGE_ENABLED, listMedia, uploadMedia, deleteMedia } from "@/lib/supabaseStorage";

export const runtime = "nodejs";

const ALLOWED = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "pdf", "glb", "mp4", "webm"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const MIME_BY_EXT: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  gif: "image/gif", svg: "image/svg+xml", avif: "image/avif", pdf: "application/pdf",
  glb: "model/gltf-binary", mp4: "video/mp4", webm: "video/webm",
};

function safeName(name: string) {
  const base = path.basename(name).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return base.slice(-80) || "file";
}

export async function GET(req: Request) {
  if (!(await isAdminAsync(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!STORAGE_ENABLED) {
    return NextResponse.json({ error: "Media store unavailable" }, { status: 503 });
  }
  const files = await listMedia();
  return NextResponse.json(files.sort((a, b) => b.mtime - a.mtime));
}

export async function POST(req: Request) {
  if (!(await isAdminAsync(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!STORAGE_ENABLED) {
    return NextResponse.json({ error: "Media store unavailable" }, { status: 503 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.has(ext)) {
    return NextResponse.json({ error: `File type .${ext} not allowed.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 400 });
  }
  const stem = safeName(file.name).replace(/\.[^.]+$/, "");
  const name = `${Date.now().toString(36)}-${stem}.${ext}`;
  const raw = Buffer.from(await file.arrayBuffer());
  // SVGs can carry scripts that would run on our origin if opened directly —
  // strip active content before it is stored anywhere
  const buf = ext === "svg" ? scrubSvg(raw) : raw;
  try {
    const stored = await uploadMedia(name, buf, MIME_BY_EXT[ext] || "application/octet-stream");
    return NextResponse.json({ ok: true, name: stored.name, url: stored.url });
  } catch {
    return NextResponse.json({ error: "Media store unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdminAsync(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!STORAGE_ENABLED) {
    return NextResponse.json({ error: "Media store unavailable" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const name = path.basename(searchParams.get("name") || "");
  if (!name || name.startsWith(".")) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  await deleteMedia(name);
  return NextResponse.json({ ok: true });
}
