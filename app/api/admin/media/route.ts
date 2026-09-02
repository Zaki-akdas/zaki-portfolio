import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "pdf", "glb", "mp4", "webm"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function safeName(name: string) {
  const base = path.basename(name).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return base.slice(-80) || "file";
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const files = fs.readdirSync(UPLOAD_DIR)
    .filter((f) => !f.startsWith("."))
    .map((f) => {
      const st = fs.statSync(path.join(UPLOAD_DIR, f));
      return { name: f, url: `/uploads/${f}`, size: st.size, mtime: st.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return NextResponse.json(files);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const stem = safeName(file.name).replace(/\.[^.]+$/, "");
  const name = `${Date.now().toString(36)}-${stem}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return NextResponse.json({ ok: true, name, url: `/uploads/${name}` });
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const name = path.basename(searchParams.get("name") || "");
  if (!name || name.startsWith(".")) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  const target = path.join(UPLOAD_DIR, name);
  if (!target.startsWith(UPLOAD_DIR) || !fs.existsSync(target)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  fs.unlinkSync(target);
  return NextResponse.json({ ok: true });
}
