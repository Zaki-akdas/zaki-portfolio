import { KV_ENABLED, KVUnavailableError, cmd, pipeline } from "./kv";
import { readJSON, writeJSON } from "./store";

// Rate limiter with two backends, chosen by environment:
//
// - KV_ENABLED (Upstash env present): fixed window via atomic INCR + EXPIRE NX
//   in one pipelined call. Redis's single-threaded execution gives check-and-
//   increment atomicity — no TOCTOU — and the budget is GLOBAL across
//   instances (closes the multi-instance hole observed on Vercel).
// - Otherwise (local dev, e2e): the file-backed sliding window below, with the
//   in-memory latch when the data dir is unwritable. Same behavior as before
//   this change; e2e contract tests run entirely on this path.
//
// Window semantics differ by backend (documented trade-off from the design
// doc): sliding window locally, fixed window on Redis — worst case admits up
// to ~2x the limit across a window boundary. Rejections never persist any-
// where, so hammering the limit creates no writes (file) or commands (Redis).

type Store = Record<string, number[]>; // key → hit timestamps (ms)
const DAY_MS = 24 * 60 * 60 * 1000; // sweep long-dead keys

// Non-null once file persistence has failed this process: authoritative copy
// of the store (pre-failure disk state plus every admission since).
let mem: Store | null = null;

/**
 * Synchronous admission for the file/memory backend: record an attempt for
 * `key` and admit it iff under `limit` per `windowMs`. Call synchronously
 * before the handler's first `await`, or in one uninterrupted block after all
 * awaits — or concurrent requests race past `limit`.
 */
export function reserve(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (mem) {
    // Persistence already failed this process: enforce from memory alone.
    const kept = (mem[key] || []).filter((t) => now - t < windowMs);
    if (kept.length >= limit) return false;
    kept.push(now);
    mem[key] = kept;
    sweep(mem, now);
    return true;
  }

  const s = readJSON<Store>("rate-limit", {});
  const kept = (s[key] || []).filter((t) => now - t < windowMs);
  if (kept.length >= limit) return false;
  kept.push(now);
  s[key] = kept;
  sweep(s, now);
  try {
    writeJSON("rate-limit", s);
  } catch {
    mem = s; // unwritable data dir: latch, keep enforcing in memory
  }
  return true;
}

/**
 * Async admission — routes should call this instead of `reserve` whenever
 * they can await. Uses Redis when configured (global, atomic), else falls
 * back to the file/memory backend. Throws KVUnavailableError only when Redis
 * is configured AND unreachable; callers decide between failing loud and
 * degrading to the local backend.
 */
export async function reserveAsync(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!KV_ENABLED) return reserve(key, limit, windowMs);

  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `ratelimit:${key}`;
  const [count] = await pipeline(cmd.incr(redisKey), cmd.expireNx(redisKey, windowSec));
  // INCR returns the post-increment count: 1 = first hit in this window.
  return Number(count) <= limit;
}

export { KVUnavailableError };

function sweep(s: Store, now: number) {
  for (const k of Object.keys(s)) {
    if (s[k].every((t) => now - t > DAY_MS)) delete s[k];
  }
}
