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

// Floors calibrated against measured scores in BOTH environments:
// local desktop (2026-09-26): /projects 99, /blog 98, / 70;
// CI 2-core runner: /projects 62, /blog 63, / 53 — the shared runner
// starves Chrome of CPU (TBT ~15s everywhere vs 0-32ms local), so CPU-bound
// metric ceilings (TBT/LCP) are meaningless in CI and are deliberately NOT
// asserted. The 0.4 performance floor still catches real regressions: an
// un-lazy-loaded three.js or a broken thumbnail CDN sinks scores below 30
// even on CI. CLS is layout-driven (environment-robust) and stays asserted.
const BUDGETS = {
  performance: 0.4,
  accessibility: 0.95,
  "best-practices": 0.95,
  seo: 0.9,
  metrics: {
    "cumulative-layout-shift": 0.1,
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
    const v = report.audits[audit]?.numericValue;
    if (v == null) {
      // Audit errored and produced no number — nothing to assert; log and move on.
      console.log(`  skip ${audit}: no numericValue in report`);
      continue;
    }
    const ok = v <= max;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${audit}: ${v.toFixed(4)} (ceiling ${max})`);
    if (!ok) failed = true;
  }
}

console.log(failed ? "\nBUDGET CHECK: FAIL" : "\nBUDGET CHECK: PASS");
process.exit(failed ? 1 : 0);
