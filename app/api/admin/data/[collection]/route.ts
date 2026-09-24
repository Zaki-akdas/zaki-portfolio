import { NextResponse } from "next/server";
import { isAdminAsync } from "@/lib/auth";
import {
  getContentKeyAsync,
  saveContentKeyAsync,
  getMessagesAsync,
  replaceMessages,
  type Content,
} from "@/lib/store";

export const runtime = "nodejs";

const CONTENT_KEYS = ["profile", "settings", "skills", "projects", "services", "process", "testimonials", "posts"] as const;
type ContentKey = (typeof CONTENT_KEYS)[number];

function isContentKey(k: string): k is ContentKey {
  return (CONTENT_KEYS as readonly string[]).includes(k);
}

export async function GET(req: Request, { params }: { params: { collection: string } }) {
  if (!(await isAdminAsync(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection } = params;
  if (collection === "messages") {
    try {
      return NextResponse.json(await getMessagesAsync());
    } catch {
      // Redis down while configured: surface the outage instead of an empty inbox.
      return NextResponse.json({ error: "Message store unavailable" }, { status: 503 });
    }
  }
  if (isContentKey(collection)) {
    const value = await getContentKeyAsync(collection);
    return NextResponse.json(value ?? null);
  }
  return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
}

export async function PUT(req: Request, { params }: { params: { collection: string } }) {
  if (!(await isAdminAsync(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection } = params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (collection === "messages") {
    if (!Array.isArray(body)) return NextResponse.json({ error: "Expected an array" }, { status: 400 });
    try {
      await replaceMessages(body as never);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Message store unavailable" }, { status: 503 });
    }
  }

  if (isContentKey(collection)) {
    try {
      await saveContentKeyAsync(collection, body as never);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Content store unavailable" }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
}
