import { type Page } from "@playwright/test";

/**
 * Wait for the preloader overlay to stop blocking the page.
 * It renders as div[aria-label="Loading"] at z-[100] and unmounts after its
 * ~7s hard cap + 3.1s fade. 30s bounds slow CI (4 parallel workers + dev
 * compilation of the dynamic three.js chunk can push the full sequence
 * past 15s); resolves instantly when the preloader is disabled and absent.
 *
 * A fresh 30-day seen-flag is seeded before navigation, so the overlay never
 * mounts at all in tests (the skip decision reads storage pre-paint). Tests
 * that exercise the preloader itself drive it directly instead.
 */
export async function waitForPreloader(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("preloader-seen", String(Date.now()));
    } catch {
      /* storage unavailable — preloader runs, the timeout below still bounds it */
    }
  });
  await page.locator('[aria-label="Loading"]').waitFor({ state: "detached", timeout: 30_000 });
}
