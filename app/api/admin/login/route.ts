import { NextResponse } from "next/server";
import { checkPassword, makeToken, COOKIE_NAME } from "@/lib/auth";
import { reserve } from "@/lib/rateLimit";

export const runtime = "nodejs";

// rate limit login attempts: max 10 / 10 min / IP (file-backed → survives restarts)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  // synchronous reserve before the first await: every attempt counts and
  // parallel bursts can't race past the cap
  if (!reserve(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  if (!checkPassword(String(body.password || ""))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });
  return res;
}
