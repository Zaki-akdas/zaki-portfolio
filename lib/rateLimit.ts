import { readJSON, writeJSON } from "./store";

// File-backed sliding-window rate limiter shared by the API routes
// (store.ts owns the data dir and atomic writes, so limits survive restarts
// when the dir is writable). Admission is one synchronous read → check →
// record → write block: splitting check and record across an await let 12
// parallel posts beat a cap of 10. Single-node deploy target — no
// cross-process locking.
//
// If the data dir can't be written (Vercel's read-only bundle, a bad
// DATA_DIR), the first failed write latches to an in-memory copy: the limit
// keeps enforcing per process instead of 500ing every admitted request.
// Rejections never write, so hammering the limit creates no disk churn.

type Store = Record<string, number[]>; // key → hit timestamps (ms)
const DAY_MS = 24 * 60 * 60 * 1000; // sweep long-dead keys

// Non-null once persistence has failed this process: authoritative copy of
// the store (pre-failure disk state plus every admission since).
let mem: Store | null = null;

/**
 * Record an attempt for `key` and admit it iff under `limit` per `windowMs`.
 * Call synchronously before the handler's first `await`, or in one
 * uninterrupted block after all awaits — or concurrent requests race past
 * `limit`.
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

function sweep(s: Store, now: number) {
  for (const k of Object.keys(s)) {
    if (s[k].every((t) => now - t > DAY_MS)) delete s[k];
  }
}
