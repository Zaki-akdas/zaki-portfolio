import { NextResponse } from "next/server";
import crypto from "crypto";
import { getMessages, saveMessages } from "@/lib/store";
import { reserve } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Rate limit: max 10 valid submissions / 10 min / IP, file-backed so restarts
// don't reset it (the e2e suite submits several messages per run from the same
// IP; a tight budget makes the tests non-deterministic — 10 still blocks spam)
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

  // One synchronous admission step after all awaits: only valid submissions
  // count, and parallel bursts can't race past the cap (checking before the
  // awaits and recording after them accepted 12/12 against a limit of 10).
  if (!reserve(key, MAX_MESSAGES, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many messages — please try again later." }, { status: 429 });
  }

  const messages = getMessages();
  messages.unshift({
    id: crypto.randomUUID(),
    name,
    email,
    subject,
    message,
    date: new Date().toISOString(),
    read: false,
  });
  saveMessages(messages);

  return NextResponse.json({ ok: true });
}
