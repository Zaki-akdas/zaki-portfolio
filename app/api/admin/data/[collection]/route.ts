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

// Collections that must be an array of objects vs a single object. A write with
// the wrong top-level shape would crash the public site on render (e.g. calling
// `.map` on a non-array), so reject it here rather than persist it. Field-level
// shapes aren't enforced: the endpoint is already admin-authenticated, and the
// editors own the per-item contract.
const ARRAY_KEYS = new Set<string>(["skills", "projects", "services", "process", "testimonials", "posts", "messages"]);

/** Structural sanity check: right top-level container, and objects inside arrays. */
function shapeError(collection: string, body: unknown): string | null {
  if (ARRAY_KEYS.has(collection)) {
    if (!Array.isArray(body)) return "Expected an array";
    if (body.some((item) => typeof item !== "object" || item === null || Array.isArray(item))) {
      return "Every array item must be an object";
    }
    return null;
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return "Expected an object";
  return null;
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
    const err = shapeError(collection, body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    try {
      await replaceMessages(body as never);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Message store unavailable" }, { status: 503 });
    }
  }

  if (isContentKey(collection)) {
    const err = shapeError(collection, body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    try {
      await saveContentKeyAsync(collection, body as never);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ error: "Content store unavailable" }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
}
