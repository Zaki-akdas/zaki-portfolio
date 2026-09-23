import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".avif": "image/avif", ".ico": "image/x-icon", ".pdf": "application/pdf",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg",
};

// Serves /uploads/* from UPLOADS_DIR at runtime (needed when uploads live on a
// persistent disk outside public/). Locally, files in public/uploads are served
// statically by Next before this route is ever reached.
export async function GET(_req: NextRequest, { params }: { params: { file: string[] } }) {
  const name = params.file.join("/");
  const safe = path.normalize(name).replace(/^(\.\.(\/|\\|$))+/g, "");
  const filePath = path.join(UPLOAD_DIR, safe);
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const headers: Record<string, string> = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };
    if (ext === ".svg") {
      // SVGs are documents on our origin: rendering stays intact (for <img>
      // embeds) but scripts and external loads are dead on direct open.
      headers["Content-Security-Policy"] =
        "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }
    return new NextResponse(data, { headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
