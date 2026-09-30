import crypto from "crypto";
import { readJSON, writeJSON } from "./store";
import { SB_AUTH_ENABLED, verifySupabaseToken } from "./supabaseAuth";

type AuthData = { salt: string; hash: string; secret: string };

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 32 } as const;

function hashPw(pw: string, salt: string) {
  const derived = crypto.scryptSync(pw, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

function verifyPw(pw: string, stored: string, salt: string): boolean {
  let candidate: string;
  if (stored.startsWith("scrypt$")) {
    const [, s, h] = stored.split("$");
    candidate = hashPw(pw, s);
    return (
      candidate.length === stored.length &&
      crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(stored))
    );
  }
  // Legacy single-round sha256 record; re-hashed to scrypt on successful login.
  const legacy = crypto.createHash("sha256").update(salt + ":" + pw).digest("hex");
  return (
    legacy.length === stored.length &&
    crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(stored))
  );
}

let warnedNoPassword = false;

function getAuth(): AuthData {
  let a = readJSON<AuthData | null>("auth", null);
  if (!a || !a.secret) {
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw && process.env.NODE_ENV === "production" && !warnedNoPassword) {
      warnedNoPassword = true;
      console.warn(
        "[auth] ADMIN_PASSWORD is not set; generating a random admin password. " +
          "Set ADMIN_PASSWORD (or configure Supabase Auth) to be able to log in.",
      );
    }
    const salt = crypto.randomBytes(16).toString("hex");
    a = {
      salt,
      hash: hashPw(pw || crypto.randomBytes(16).toString("hex"), salt),
      secret: process.env.AUTH_SECRET || crypto.randomBytes(24).toString("hex"),
    };
    writeJSON("auth", a);
  }
  return a;
}

export function checkPassword(pw: string) {
  // Env var always wins in production so you can never be locked out.
  if (process.env.ADMIN_PASSWORD) {
    const env = Buffer.from(process.env.ADMIN_PASSWORD);
    const given = Buffer.from(pw);
    return env.length === given.length && crypto.timingSafeEqual(env, given);
  }
  const a = getAuth();
  if (!verifyPw(pw, a.hash, a.salt)) return false;
  if (!a.hash.startsWith("scrypt$")) setPassword(pw);
  return true;
}

export function setPassword(pw: string) {
  const a = getAuth();
  a.salt = crypto.randomBytes(16).toString("hex");
  a.hash = hashPw(pw, a.salt);
  writeJSON("auth", a);
}

export const COOKIE_NAME = "admin_session";

export function makeToken() {
  const a = getAuth();
  const secret = process.env.AUTH_SECRET || a.secret;
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = "admin." + exp;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return payload + "." + sig;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, exp, sig] = parts;
  if (user !== "admin" || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const a = getAuth();
  const secret = process.env.AUTH_SECRET || a.secret;
  const expect = crypto.createHmac("sha256", secret).update(user + "." + exp).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

export function tokenFromRequest(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export function isAdmin(req: Request) {
  return verifyToken(tokenFromRequest(req));
}

/**
 * Async admin check: accepts the Supabase session JWT when Supabase Auth is
 * configured (verified against the project JWKS, email allow-listed), else/
 * otherwise the homegrown HMAC token. Admin routes use this. Also accepts a
 * raw token string (server components reading cookies()).
 */
export async function isAdminAsync(reqOrToken: Request | string | null | undefined) {
  const token = typeof reqOrToken === "string" || reqOrToken == null ? reqOrToken : tokenFromRequest(reqOrToken);
  if (SB_AUTH_ENABLED && (await verifySupabaseToken(token))) return true;
  return verifyToken(token);
}
