import { type Page } from "@playwright/test";

/**
 * Wait for the preloader overlay to stop blocking the page.
 * It renders as div[aria-label="Loading"] at z-[100] and unmounts after its
 * ~7s hard cap + 3.1s fade.
 *
 * The `preloader-seen` skip flag is seeded app-wide via storageState in
 * globalSetup (before the first navigation), so the overlay never mounts and
 * this resolves instantly. It's kept as a safety net: if seeding ever fails
 * (e.g. storage unavailable) the overlay still runs and the 30s bound below
 * caps it. Tests that exercise the preloader itself drive it directly.
 */
export async function waitForPreloader(page: Page) {
  await page.locator('[aria-label="Loading"]').waitFor({ state: "detached", timeout: 30_000 });
}
