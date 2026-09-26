# Contributing

This repo ships every change through a pull request with automated verification.
This document covers the CI setup, the performance budgets that gate merges, and
the conventions a PR is expected to follow.

## Branch → PR → merge lifecycle

1. Create a feature branch from `main`:
   `git checkout -b <type>/<short-description>` — prefixes in use: `perf/`,
   `fix/`, `ci/`, `feat/`.
2. Commit, push, and open a PR against `main`.
3. CI runs (see below). A PR is mergeable only when **every check is green**:
   `verify`, `lighthouse`, and the Vercel preview deployment.
4. Merge with a merge commit and delete the branch:
   `gh pr merge <N> --repo Zaki-akdas/zaki-portfolio --merge --delete-branch`
5. Sync local main and verify production after user-facing changes:
   ```bash
   git checkout main && git pull origin main
   curl -s https://zakiakdas.vercel.app/api/health   # expect {"status":"ok","durable":"postgres"}
   ```
6. For deployments, confirm the latest Production deployment in
   `gh api repos/Zaki-akdas/zaki-portfolio/deployments?per_page=1` points at the
   merge commit and its status is `success`.

### PR conventions

- One logical change per PR; keep the title imperative and specific
  (e.g. "Serve webp grid thumbnails on project listings via Storage image CDN").
- The PR body should state **what changed, why, and how it was verified** —
  include measured numbers for performance work (before/after payloads, scores).
- Never commit secrets. Supabase keys live in GitHub Actions secrets and Vercel
  env vars, never in the repo.
- Do not push directly to `main`; the workflows only run on PRs and schedules.

## CI workflows

### `verify.yml` — runs on every PR (two parallel jobs)

**Job `verify`** (~8–9 min) — typecheck + end-to-end contract:

```bash
npm run verify        # tsc --noEmit  &&  npx playwright test
```

- Playwright starts its own `next dev` server on port 3456 with an isolated
  `DATA_DIR=.e2e-data` (suite writes never touch real content) and seeds the
  preloader seen-flag so tests never wait out the overlay.
- Supabase env vars from repo secrets let the storage e2e test exercise real
  upload/scrub/delete against the media bucket.
- Playwright test results are uploaded as an artifact on failure.

**Job `lighthouse`** (~4–12 min) — performance budget gate:

```bash
npm run build
DATA_DIR=.lh-data npx next start -p 3457   # production build, not dev
PORT=3457 node scripts/lh-budget.cjs
```

- Measures `/`, `/projects`, `/blog` with the Lighthouse CLI (desktop preset)
  against the real production build — dev-server JS cost would distort scores.
- Fails the PR on any budget violation (see "Budgets" below); Lighthouse JSON
  reports are uploaded as an artifact on failure for diagnosis.

### `lighthouse-prod.yml` — weekly production audit

- Schedule: Sundays 03:17 UTC (off the hour to avoid cron crush), plus manual
  `workflow_dispatch` for on-demand audits:
  `gh workflow run "Production Lighthouse audit" --repo Zaki-akdas/zaki-portfolio`
- Runs the same budget script against the **live site**
  (`BASE_URL=https://zakiakdas.vercel.app node scripts/lh-budget.cjs`).
- The PR gate only ever measures the repo's bundled seed data; this weekly run
  catches performance drift from **content changes** — a client uploading
  multi-MB project covers, a failing image-transform CDN — that never touch code.
- Each page is measured **3 times** and the median score is asserted; runs where
  Chrome refuses navigation (interstitial) are retried, and the audit fails if
  fewer than 2 of 3 runs are usable. Reports upload as artifacts on failure.

## Lighthouse budgets

Defined in `scripts/lh-budget.cjs` (`BUDGETS`), calibrated against measured
scores on both a local desktop machine and GitHub's 2-core CI runners:

| Check | Threshold | Notes |
|---|---|---|
| Performance | ≥ 40 | CI runners starve Chrome of CPU (TBT ~15 s vs 0–32 ms local), so scores run ~20–40 points below local. 40 still catches real regressions: an un-lazy-loaded three.js or a broken image CDN sinks below 30. |
| Accessibility | ≥ 95 | Environment-robust; keep at 100. |
| Best practices | ≥ 95 | |
| SEO | ≥ 90 | |
| CLS | ≤ 0.1 | Layout-driven, environment-robust — the one asserted metric. |

Deliberately **not** asserted: TBT, LCP, and other CPU-bound metrics — they are
meaningless on shared CI runners. Locally (fast machine, port 3457) expect
/projects ≈ 99, /blog ≈ 98, / ≈ 90+; the preloader legitimately delays home's
first-visit LCP.

Pages audited: `/`, `/projects`, `/blog` — override with `PAGES=/projects` for
single-page triage.

### Triaging a Lighthouse failure

1. Download the `lighthouse-reports` (PR gate) or `lighthouse-prod-reports`
   (weekly) artifact from the failed run.
2. Open the JSON at <https://googlechrome.github.io/lighthouse/viewer/> to see
   the failing audit and its evidence.
3. Re-run a single page locally for faster iteration:
   ```bash
   npm run build && DATA_DIR=.lh-data npx next start -p 3457
   PAGES=/projects PORT=3457 node scripts/lh-budget.cjs
   ```

## Local development

```bash
npm install
npm run dev                 # http://localhost:3000
npx tsc --noEmit            # typecheck
npm run build               # production build check
DATA_DIR=.e2e-data npx playwright test   # full e2e (self-starts dev server on :3456)
```

- Playwright reuses an already-running server on :3456 (`reuseExistingServer: true`).
  **Zombie-server trap:** if a stale dev server from an earlier session is still
  listening, it will serve stale code and produce false failures. Check
  `netstat -ano | grep :3456` and kill the PID before trusting a run
  (Windows: `taskkill //F //PID <pid>`).
- e2e requires Supabase env vars for the storage tests to run against the real
  bucket (otherwise they skip):
  `SUPABASE_URL=... SUPABASE_SECRET_KEY=... DATA_DIR=.e2e-data npx playwright test`

## Architecture notes that CI depends on

- **Image pipeline:** covers live in Supabase Storage's public `media` bucket.
  Grid cards serve transformed webp thumbnails via the Storage render endpoint
  (`/storage/v1/render/image/...`, `lib/thumb.ts`) with `srcset`/`sizes`
  (240–960w variants); every variant carries `Cache-Control: max-age=31536000`.
  Detail pages keep the full-res cover for their LCP hero. If you touch this,
  re-run the viewport fetch probe (phone should fetch w=360, desktop w=480).
- **Preloader:** `components/Preloader.tsx` persists a 30-day seen-flag in
  localStorage. e2e seeds it via `waitForPreloader` (`e2e/helpers.ts`) so tests
  never wait out the ~10 s overlay sequence; tests exercising the preloader
  itself drive it directly.
- **Three.js** is lazy-loaded via `next/dynamic` and gated on the preloader
  finishing (`__preloaderDone`). It must never re-enter the critical path —
  the Lighthouse gate exists largely to enforce this.

## Historical context

The budget gate and weekly audit were introduced after a full Lighthouse audit
sweep (PRs #46–#50) fixed the findings it surfaced: favicon 404, muted-text
contrast, an aria-label mismatch, grid thumbnails (1.9 MB → 0.30 MB), and
responsive srcset. First CI run of the gate failed exactly as designed — CI's
2-core runner starved Chrome of CPU — which is why CPU-bound metrics are
excluded and floors are calibrated per environment.
