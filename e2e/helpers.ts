import { type Page } from "@playwright/test";

/**
 * Wait for the preloader overlay to stop blocking the page.
 * It renders as div[aria-label="Loading"] at z-[100] and unmounts after its
 * ~7s hard cap + 3.1s fade. 30s bounds slow CI (4 parallel workers + dev
 * compilation of the dynamic three.js chunk can push the full sequence
 * past 15s); resolves instantly when the preloader is disabled and absent.
 */
export async function waitForPreloader(page: Page) {
  await page.locator('[aria-label="Loading"]').waitFor({ state: "detached", timeout: 30_000 });
}
