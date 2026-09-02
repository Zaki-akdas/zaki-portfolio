import crypto from "crypto";
import { readJSON, writeJSON } from "./store";

type AuthData = { salt: string; hash: string; secret: string };

function hashPw(pw: string, salt: string) {
  return crypto.createHash("sha256").update(salt + ":" + pw).digest("hex");
}

function getAuth(): AuthData {
  let a = readJSON<AuthData | null>("auth", null);
  if (!a || !a.secret) {
    const salt = crypto.randomBytes(8).toString("hex");
    a = {
      salt,
      hash: hashPw(process.env.ADMIN_PASSWORD || "admin123", salt),
      secret: process.env.AUTH_SECRET || crypto.randomBytes(24).toString("hex"),
    };
    writeJSON("auth", a);
  }
  return a;
}

export function checkPassword(pw: string) {
  // Env var always wins in production so you can never be locked out.
  if (process.env.ADMIN_PASSWORD) return pw === process.env.ADMIN_PASSWORD;
  const a = getAuth();
  return hashPw(pw, a.salt) === a.hash;
}

export function setPassword(pw: string) {
  const a = getAuth();
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
