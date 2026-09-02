import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getContent, saveContent, getMessages, saveMessages, type Content } from "@/lib/store";

export const runtime = "nodejs";

const CONTENT_KEYS = ["profile", "settings", "skills", "projects", "services", "process", "testimonials", "posts"] as const;
type ContentKey = (typeof CONTENT_KEYS)[number];

function isContentKey(k: string): k is ContentKey {
  return (CONTENT_KEYS as readonly string[]).includes(k);
}

export async function GET(req: Request, { params }: { params: { collection: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection } = params;
  if (collection === "messages") return NextResponse.json(getMessages());
  if (isContentKey(collection)) {
    const content = getContent();
    return NextResponse.json(content[collection] ?? null);
  }
  return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
}

export async function PUT(req: Request, { params }: { params: { collection: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection } = params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (collection === "messages") {
    if (!Array.isArray(body)) return NextResponse.json({ error: "Expected an array" }, { status: 400 });
    saveMessages(body);
    return NextResponse.json({ ok: true });
  }

  if (isContentKey(collection)) {
    const content = getContent();
    (content as Content)[collection] = body as never;
    saveContent(content);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
}
