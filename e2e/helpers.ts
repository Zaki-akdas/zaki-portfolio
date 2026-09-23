import { type Page } from "@playwright/test";

/**
 * Wait for the preloader overlay to stop blocking the page.
 * It renders as div[aria-label="Loading"] at z-[100] and unmounts after its
 * ~7s hard cap + 3.1s fade (15s bounds slow CI). One detached-wait covers all
 * cases: it resolves instantly when the preloader is disabled and absent.
 */
export async function waitForPreloader(page: Page) {
  await page.locator('[aria-label="Loading"]').waitFor({ state: "detached", timeout: 15_000 });
}
