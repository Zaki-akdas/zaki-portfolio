import { type Page } from "@playwright/test";

/**
 * Wait for the preloader overlay to fully dismiss.
 * The preloader renders a div[aria-label="Loading"] at z-[100] that blocks
 * all pointer events.  It fades out after ~5.5s on a fast connection.
 * This helper waits for it to be removed from the DOM.
 */
export async function waitForPreloader(page: Page) {
  // Wait for the preloader overlay (role=status aria-label=Loading) to be removed.
  // If no preloader is enabled, it won't be present and this returns instantly.
  const preloader = page.locator('[aria-label="Loading"]');
  const count = await preloader.count();
  if (count === 0) return;
  await preloader.waitFor({ state: "detached", timeout: 20_000 });
}
