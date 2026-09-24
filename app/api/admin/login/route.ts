import { NextResponse } from "next/server";
import { checkPassword, makeToken, COOKIE_NAME } from "@/lib/auth";
import { reserve, reserveAsync } from "@/lib/rateLimit";
import { SB_AUTH_ENABLED, signInAdmin, ADMIN_EMAIL, type SignInResult } from "@/lib/supabaseAuth";

export const runtime = "nodejs";

// rate limit login attempts: max 10 / 10 min / IP (file-backed → survives restarts)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  // One admission step before the first await: every attempt counts and
  // (on Redis) parallel bursts can't race past the cap. On a Redis outage the
  // limiter degrades to the local backend rather than blocking logins.
  let admitted: boolean;
  try {
    admitted = await reserveAsync(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  } catch {
    admitted = reserve(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  }
  if (!admitted) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");

  // Supabase Auth when configured: real user session (ES256 JWT signed by
  // Supabase, verified against the project JWKS on every admin request).
  if (SB_AUTH_ENABLED) {
    const email = String(body.email || ADMIN_EMAIL).toLowerCase();
    let result: SignInResult;
    try {
      result = await signInAdmin(email, password);
    } catch {
      // Supabase unreachable: fall back rather than locking the owner out.
      result = { ok: false, reason: "unavailable" };
    }
    if (result.ok) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE_NAME, result.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: result.expiresInSec,
      });
      return res;
    }
    if (result.reason === "invalid_credentials") {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    // reason === "unavailable": fall through to the homegrown check below.
  }

  if (!checkPassword(password)) {
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
