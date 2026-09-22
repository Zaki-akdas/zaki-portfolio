import fs from "fs";
import path from "path";

// File-backed sliding-window rate limiter shared by the API routes.
// State lives in a JSON file (not module memory) so limits survive process
// restarts. Admission is one synchronous read → check → record → write block,
// which makes each decision atomic within this process: checking in one tick
// and recording in another let a concurrent burst slip past the cap.
// No cross-process locking — the deploy target is a single node on one disk.

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "rate-limit.json");
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // sweep long-dead keys on write

type Store = Record<string, number[]>; // key → hit timestamps (ms)

function readStore(): Store {
  try {
    const v = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(s: Store) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(s));
    fs.renameSync(tmp, FILE); // atomic — readers never see a half-written file
  } catch {
    // Disk trouble must not 500 the API; this hit just won't persist.
  }
}

/**
 * Record an attempt for `key` and admit it iff under `limit` per `windowMs`.
 * Call synchronously, before the handler's first `await` — or right after all
 * awaits, in one uninterrupted block — or concurrent requests race past `limit`.
 * Rejected probes cause no write, so hammering the limit can't create disk churn.
 */
export function reserve(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const s = readStore();
  const kept = (s[key] || []).filter((t) => now - t < windowMs);
  if (kept.length >= limit) return false;
  kept.push(now);
  s[key] = kept;
  for (const k of Object.keys(s)) {
    if (s[k].every((t) => now - t > MAX_AGE_MS)) delete s[k];
  }
  writeStore(s);
  return true;
}
