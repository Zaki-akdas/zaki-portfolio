// Minimal Upstash Redis REST client — the same request/response shapes as
// api.upstash.com (Vercel Marketplace injects these env vars), so any spec-
// compliant endpoint works. No SDK: one pipelined fetch per call.
//
// Commands are sent as an array of arrays, e.g. [["HSET","h","f","v"],["EXPIRE","h","60"]].
// Upstash returns one result per command; a command error surfaces as
// { error: string } — treated the same as a transport failure below.

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/** True when Upstash env vars are present (kv layer active). */
export const KV_ENABLED = Boolean(URL && TOKEN);

/** Transport/command failure — callers decide between fallback and fail-loud. */
export class KVUnavailableError extends Error {}

type Cmd = (string | number)[];

/** Run commands as one pipelined REST call. Results align with the input. */
export async function pipeline(...commands: Cmd[]): Promise<unknown[]> {
  if (!URL || !TOKEN) throw new KVUnavailableError("Upstash env not configured");
  let res: Response;
  try {
    res = await fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    });
  } catch (e) {
    throw new KVUnavailableError(`Upstash unreachable: ${String(e)}`);
  }
  if (!res.ok) throw new KVUnavailableError(`Upstash HTTP ${res.status}`);
  const json = (await res.json()) as { error?: string } | { error?: string }[];
  const rows = Array.isArray(json) ? json : [json];
  const out = rows.map((r) => {
    if (r && typeof r === "object" && "error" in r && r.error) {
      throw new KVUnavailableError(`Upstash command error: ${r.error}`);
    }
    return (r as { result?: unknown }).result;
  });
  return out;
}

export const cmd = {
  /** GET returns string | null */
  get: (key: string): Cmd => ["GET", key],
  set: (key: string, value: string): Cmd => ["SET", key, value],
  /** SETNX returns 1 when the key was newly set (seed guard) */
  setnx: (key: string, value: string): Cmd => ["SETNX", key, value],
  /** HGETALL returns { field: value } or {} for a missing hash */
  hgetall: (key: string): Cmd => ["HGETALL", key],
  hset: (key: string, field: string, value: string): Cmd => ["HSET", key, field, value],
  hdel: (key: string, field: string): Cmd => ["HDEL", key, field],
  /** INCR returns the post-increment count — atomic, no read-modify-write */
  incr: (key: string): Cmd => ["INCR", key],
  expire: (key: string, seconds: number): Cmd => ["EXPIRE", key, seconds],
  /** EXPIRE ... NX: set a TTL only if none exists — self-heals counters whose
   *  EXPIRE was lost, without ever refreshing a live window */
  expireNx: (key: string, seconds: number): Cmd => ["EXPIRE", key, seconds, "NX"],
  /** TTL returns seconds remaining, -2 when the key doesn't exist */
  ttl: (key: string): Cmd => ["TTL", key],
};
