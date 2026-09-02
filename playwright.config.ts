import { defineConfig } from "@playwright/test";

const PORT = process.env.PORT || 3456;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
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
