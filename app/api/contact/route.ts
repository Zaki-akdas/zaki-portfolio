import { NextResponse } from "next/server";
import crypto from "crypto";
import { getMessages, saveMessages } from "@/lib/store";

export const runtime = "nodejs";

// naive in-memory rate limit: max 5 submissions / 10 min / IP
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const windowHits = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (windowHits.length >= 5) {
    return NextResponse.json({ error: "Too many messages — please try again later." }, { status: 429 });
  }

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

  windowHits.push(now);
  hits.set(ip, windowHits);

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
