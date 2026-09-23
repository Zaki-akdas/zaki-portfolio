import { readJSON, writeJSON } from "./store";

// File-backed sliding-window rate limiter shared by the API routes
// (store.ts owns the data dir and atomic writes, so limits survive restarts).
// Admission is one synchronous read → check → record → write block: splitting
// check and record across an await let 12 parallel posts beat a cap of 10.
// Single-node deploy target — no cross-process locking.

type Store = Record<string, number[]>; // key → hit timestamps (ms)
const DAY_MS = 24 * 60 * 60 * 1000; // sweep long-dead keys on write

/**
 * Record an attempt for `key` and admit it iff under `limit` per `windowMs`.
 * Call synchronously, before the handler's first `await` — or right after all
 * awaits, in one uninterrupted block — or concurrent requests race past `limit`.
 * Rejections don't write, so hammering the limit creates no disk churn.
 */
export function reserve(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const s = readJSON<Store>("rate-limit", {});
  const kept = (s[key] || []).filter((t) => now - t < windowMs);
  if (kept.length >= limit) return false;
  kept.push(now);
  s[key] = kept;
  for (const k of Object.keys(s)) {
    if (s[k].every((t) => now - t > DAY_MS)) delete s[k];
  }
  writeJSON("rate-limit", s);
  return true;
}
