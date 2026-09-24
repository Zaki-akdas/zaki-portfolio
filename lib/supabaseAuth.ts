// Supabase Auth for the admin panel — real user sessions replacing the
// homegrown HMAC token when Supabase env vars are present.
//
// Sign-in: POST /auth/v1/token?grant_type=password with the publishable key.
// Verification: the returned access_token is an ES256 JWT signed with keys
// from the project's JWKS endpoint — verified here with WebCrypto (no
// dependency). Only the allow-listed ADMIN_EMAIL may hold an admin session,
// so a random Supabase account can never reach the panel.
//
// Without SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY, everything below is inert
// and lib/auth.ts's homegrown flow runs exactly as before.

const SB_URL = process.env.SUPABASE_URL;
const SB_PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY;

export const SB_AUTH_ENABLED = Boolean(SB_URL && SB_PUBLISHABLE);

/** The one email allowed to be an admin. */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "zakiakdas703@gmail.com").toLowerCase();

// --- Sign-in -----------------------------------------------------------------

export type SignInResult =
  | { ok: true; accessToken: string; expiresInSec: number }
  | { ok: false; reason: "invalid_credentials" | "unavailable" };

export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  if (!SB_URL || !SB_PUBLISHABLE) return { ok: false, reason: "unavailable" };
  let res: Response;
  try {
    res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SB_PUBLISHABLE, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!res.ok) return { ok: false, reason: "invalid_credentials" };
  const j = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) return { ok: false, reason: "invalid_credentials" };
  return { ok: true, accessToken: j.access_token, expiresInSec: j.expires_in ?? 3600 };
}

// --- JWT verification (ES256 against the project JWKS) -----------------------

type Jwk = { kid: string; alg: string; kty: string; crv?: string; x?: string; y?: string };

let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 60 * 60 * 1000; // refresh hourly; Supabase rotates rarely

async function getJwks(): Promise<Map<string, CryptoKey>> {
  if (!SB_URL || !SB_PUBLISHABLE) throw new Error("Supabase not configured");
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return importJwks(jwksCache.keys);
  }
  const res = await fetch(`${SB_URL}/auth/v1/.well-known/jwks.json`, {
    headers: { apikey: SB_PUBLISHABLE },
  });
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const keys = ((await res.json()) as { keys: Jwk[] }).keys;
  jwksCache = { keys, fetchedAt: Date.now() };
  return importJwks(keys);
}

const importedKeys = new Map<string, { key: CryptoKey; at: number }>();

async function importJwks(keys: Jwk[]): Promise<Map<string, CryptoKey>> {
  const out = new Map<string, CryptoKey>();
  for (const k of keys) {
    if (k.kty !== "EC" || k.crv !== "P-256" || !k.x || !k.y) continue;
    const cached = importedKeys.get(k.kid);
    if (cached && Date.now() - cached.at < JWKS_TTL_MS) {
      out.set(k.kid, cached.key);
      continue;
    }
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: k.kty, crv: k.crv, x: k.x, y: k.y, ext: true },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    importedKeys.set(k.kid, { key, at: Date.now() });
    out.set(k.kid, key);
  }
  return out;
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Verify a Supabase access token: ES256 signature against the project JWKS,
 * `exp` in the future, and the email claim matching the allow-listed admin.
 * Returns true only for a current, valid admin session token.
 */
export async function verifySupabaseToken(token?: string | null): Promise<boolean> {
  if (!token || !SB_URL || !SB_PUBLISHABLE) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [hB64, pB64, sB64] = parts;

  try {
    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(hB64))) as { alg?: string; kid?: string };
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(pB64))) as {
      exp?: number;
      email?: string;
      sub?: string;
    };
    if (header.alg !== "ES256" || !header.kid) return false;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return false;
    if ((payload.email || "").toLowerCase() !== ADMIN_EMAIL) return false;

    const keys = await getJwks();
    const key = keys.get(header.kid);
    if (!key) return false;

    const data = new TextEncoder().encode(`${hB64}.${pB64}`);
    const sig = b64urlToBytes(sB64);
    // JWS ES256 signatures are raw r||s (64 bytes); WebCrypto expects the same.
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      sig.buffer as ArrayBuffer,
      data.buffer as ArrayBuffer,
    );
  } catch {
    return false;
  }
}
