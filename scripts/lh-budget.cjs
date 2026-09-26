// Lighthouse budget gate for CI: runs the lighthouse CLI against each key
// page on an already-started local server, then asserts score/metric floors.
// Fails (exit 1) if any page violates a budget, so the verify workflow
// catches performance regressions on every PR.
//
// Usage: PORT=3457 node scripts/lh-budget.cjs
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || "3457";
const PAGES = ["/", "/projects", "/blog"];

// Floors calibrated against local desktop runs (2026-09-26): /projects 99,
// /blog 98, / 70 — home is lowest because Lighthouse simulates a first visit
// and the preloader sequence legitimately delays LCP/SI there. The 0.6 floor
// leaves noise headroom on CI runners (noisy-neighbor CPU can inflate LCP/TBT
// ~2x) while still catching real regressions: an un-lazy-loaded three.js or
// a broken thumbnail CDN would sink scores below 40.
const BUDGETS = {
  performance: 0.6,
  accessibility: 0.95,
  "best-practices": 0.95,
  seo: 0.9,
  metrics: {
    "cumulative-layout-shift": 0.05,
    "total-blocking-time": 600,
  },
};

function run(url) {
  const out = path.join(process.cwd(), `.lh-report-${Math.random().toString(36).slice(2)}.json`);
  try {
    // Note: on Windows, chrome-launcher can exit non-zero on temp-dir cleanup
    // EPERM *after* the report is fully written — so we don't trust the exit
    // code; success means a parseable report file exists. CI (linux) is clean.
    try {
      execSync(
        `npx --yes lighthouse@13.5.0 "${url}" --preset=desktop --quiet --chrome-flags="--headless=new" ` +
          `--output=json --output-path="${out}" --only-categories=performance,accessibility,best-practices,seo`,
        { stdio: ["ignore", "ignore", "ignore"], timeout: 180_000 }
      );
    } catch {
      // tolerated — report may still be complete; validated below
    }
    const report = JSON.parse(fs.readFileSync(out, "utf8"));
    if (!report.categories?.performance) throw new Error("report missing categories");
    return report;
  } finally {
    fs.rmSync(out, { force: true });
  }
}

let failed = false;
for (const page of PAGES) {
  const url = `http://localhost:${PORT}${page}`;
  console.log(`\n=== ${page}`);
  let report;
  try {
    report = run(url);
  } catch (e) {
    console.error(`  lighthouse run failed for ${url}: ${String(e.stderr || e).slice(0, 300)}`);
    failed = true;
    continue;
  }
  for (const [cat, min] of Object.entries(BUDGETS)) {
    if (cat === "metrics") continue;
    const score = report.categories[cat]?.score;
    const ok = score != null && score >= min;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${cat}: ${(score * 100).toFixed(0)} (floor ${min * 100})`);
    if (!ok) failed = true;
  }
  for (const [audit, max] of Object.entries(BUDGETS.metrics)) {
    const a = report.audits[audit];
    const v = a?.numericValue;
    const ok = v != null && v <= max;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${audit}: ${v?.toFixed(0) ?? "?"} (ceiling ${max})`);
    if (!ok) failed = true;
  }
}

console.log(failed ? "\nBUDGET CHECK: FAIL" : "\nBUDGET CHECK: PASS");
process.exit(failed ? 1 : 0);
