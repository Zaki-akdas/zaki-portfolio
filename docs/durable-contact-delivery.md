# Durable contact-form delivery for production

**Problem:** since the serverless writable-store fix (`856e3ff`), contact messages land in
`os.tmpdir()/portfolio-data` on whichever lambda instance handled the POST — durable only for
that instance's warm lifetime. A cold start or deploy loses them. Rate-limit budgets have the
same lifetime problem (and with multiple instances, each gets its own budget — observed live:
12 parallel bad logins produced no 429 because Vercel spread them across instances).

**Goal:** messages survive cold starts and deploys; the existing admin inbox keeps working;
rate limiting becomes global across instances. No silent message loss.

## Decision: Upstash Redis (REST) is the source of truth; email is a notification, not the store

- **Vercel KV is sunset**; its Vercel Marketplace successor is Upstash Redis (verified Feb–Dec
  2025 sources). Provision via the Vercel Marketplace integration → it injects
  `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` automatically.
- Redis **stores** messages (feeds the existing admin inbox). **Email (Resend, phase 2) only
  notifies** — never the record of truth, so deliverability hiccups can't lose data.
- Free tier fits: a busy month of contacts + rate-limit commands is << 500K commands, << 256 MB.

## Key architectural line: split the store by mutability

| Data | Mutability at runtime | Home | Why unchanged |
|---|---|---|---|
| `content.json` (profile, projects, posts…) | read-only (admin edits change the repo file) | stays in the bundle, sync `readJSON` | ~12 server components read it synchronously; converting to async Redis would ripple through every page for zero durability gain |
| `messages` | appended by visitors, mutated by admin | **Redis Hash** `portfolio:messages` (field = message id, value = JSON) | hash allows delete-one (`HDEL`); reads `HGETALL`, order by `date` client-side |
| rate-limit counters | per request | **Redis `INCR` + `EXPIRE`** per `contact:{ip}` / `login:{ip}` | single-threaded Redis ⇒ atomic check-and-increment, **no TOCTOU**, global across instances |
| `auth.json` | effectively never (env wins) | no code — set `AUTH_SECRET` + `ADMIN_PASSWORD` env vars | with `AUTH_SECRET` set, `makeToken`/`verifyToken` never touch disk; sessions survive cold starts |

## Phase 1 — contact durability + global rate limiting (the change)

New `lib/kv.ts` (~30 lines): minimal Upstash REST client — `fetch(url, …)` with a pipelined
command array; no SDK needed for GET/SET/HGETALL/HDEL/INCR/EXPIRE/SETNX.

`lib/store.ts` stays the single owner of *where mutable state lives*, gaining an async layer:

- `getMessages(): Message[]` → `getMessagesAsync()` (Redis `HGETALL`; if no Upstash env → the
  current file path, so **local dev and the e2e suite are byte-identical to today**).
- `saveMessages()` → per-message `HSET` / admin delete → `HDEL`.
- **Lazy seed, race-safe:** on first read, if `portfolio:messages` is absent, `HSET` the bundled
  `data/messages.json` entries behind a `SETNX portfolio:seeded` guard — zero-migration deploy.

`lib/rateLimit.ts`: Redis fixed window (`INCR key` → if 1, `EXPIRE window`) with the existing
in-memory latch as fallback when Upstash env is absent (e2e) or Redis errors. **Semantics
change, documented:** sliding → fixed window; worst case admits up to 2× limit across a window
boundary. The e2e contract tests (10×200 → 429; 12-parallel burst → {200:10, 429:2}) still pass
because they run on the fallback path.

Route changes: `app/api/contact/route.ts` and `app/api/admin/data/[collection]/route.ts` await
the async store functions. Nothing else.

**Failure policy — fail loud, never silent:** if Redis is unreachable on a contact POST, return
**503** ("can't receive messages right now — email me at …") instead of accepting a message
that would be lost on cold start. Rejections are visible; no data silently dropped.

## Phase 2 (optional) — email notification

Resend API call (~15 lines) in the contact route after a successful Redis write: notify the
owner's address. Free tier 100/day / 3K/month. Needs one domain verification for clean
deliverability. The inbox remains the record; email is a convenience.

## Verification plan (same standard as the 500-fix)

1. **Local fallback regression:** no Upstash env → tsc, build, full 62-test e2e contract green;
   real inbox sha256 untouched.
2. **Local Redis path:** point env at a free Upstash store → contact 200 → message present via
   `HGETALL`; admin inbox shows it; delete works (`HDEL`).
3. **Durability proof:** submit a message, then simulate cold start (fresh process with only
   env vars, empty tmp) → message still there. This is the test today's code fails.
4. **Global limiter proof:** run 12 sequential bad logins against one Upstash-backed dev
   server → 401×10 + 429×2, then verify the counter key TTL exists in Redis; repeat against two
   separate local processes sharing the store → combined cap still holds (cross-instance).
5. **Prod:** deploy behind the PR → live probes: contact 200 → message visible in the admin
   inbox; 12 bad logins show 429 by #11 (single global budget — the multi-instance hole closed);
   SVG headers unchanged.

## Out of scope (tracked separately)

- Admin media upload durability — needs object storage (Vercel Blob / S3), different shape.
- `AUTH_SECRET`/`ADMIN_PASSWORD` env vars in the Vercel dashboard — user action, no code.
