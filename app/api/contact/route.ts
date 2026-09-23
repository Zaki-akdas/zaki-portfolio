import { NextResponse } from "next/server";
import crypto from "crypto";
import { addMessage } from "@/lib/store";
import { reserveAsync, KVUnavailableError } from "@/lib/rateLimit";
import { notifyNewMessage } from "@/lib/notify";

export const runtime = "nodejs";

// Rate limit: max 10 valid submissions / 10 min / IP. Redis-backed (global
// across instances) when Upstash is configured; file-backed fallback locally.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_MESSAGES = 10;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const key = `contact:${ip}`;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const subject = String(body.subject || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please fill in a valid name, email and message." }, { status: 400 });
  }

  // One admission step after all awaits: only valid submissions count, and
  // (on Redis) the INCR is atomic — parallel bursts can't race past the cap.
  let admitted: boolean;
  try {
    admitted = await reserveAsync(key, MAX_MESSAGES, WINDOW_MS);
  } catch (e) {
    if (e instanceof KVUnavailableError) {
      // Redis down while configured: never accept a message we'd lose on
      // cold start — fail loud instead.
      return NextResponse.json(
        { error: "Can't receive messages right now — please try again later." },
        { status: 503 },
      );
    }
    throw e;
  }
  if (!admitted) {
    return NextResponse.json({ error: "Too many messages — please try again later." }, { status: 429 });
  }

  try {
    const msg = {
      id: crypto.randomUUID(),
      name,
      email,
      subject,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    await addMessage(msg);
    // Owner notification — best-effort by contract (never throws, so it can
    // never fail the request): Redis is the record of truth, email is a
    // convenience. Awaited because a serverless lambda freezes dangling
    // promises when the response returns — fire-and-forget would silently
    // drop the send.
    await notifyNewMessage({ name, email, subject, message });
  } catch (e) {
    if (e instanceof KVUnavailableError) {
      // The budget was consumed for a write that failed — admitted=false next
      // time is acceptable; losing the message silently is not.
      return NextResponse.json(
        { error: "Can't receive messages right now — please try again later." },
        { status: 503 },
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
