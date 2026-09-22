import { defineConfig } from "@playwright/test";
import path from "node:path";

const PORT = Number(process.env.PORT) || 3456;
const baseURL = `http://localhost:${PORT}`;

// Contract tests need a known admin password (env wins in lib/auth) and an
// isolated DATA_DIR: suite writes never touch the real inbox, and each run
// starts with a fresh rate-limit window (store.ts seeds missing files from
// data/, so the site renders identically).
process.env.ADMIN_PASSWORD ||= "e2e-admin";
const DATA_DIR = path.resolve(process.cwd(), ".e2e-data");

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/globalSetup",
  timeout: 30_000,
  retries: 1,
  // Cap parallelism: `next dev` compiles routes on demand, and too many workers
  // starve each other (page.goto "load" timeouts) while heavy WebGL scenes run.
  workers: process.env.CI ? 2 : 4,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: `npx next dev -H 0.0.0.0 -p ${PORT}`,
    port: PORT,
    timeout: 60_000,
    reuseExistingServer: true,
    env: { ...process.env, DATA_DIR, ADMIN_PASSWORD: process.env.ADMIN_PASSWORD },
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
