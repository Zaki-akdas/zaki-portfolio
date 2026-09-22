import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT) || 3456;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
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
    port: Number(PORT),
    timeout: 60_000,
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
