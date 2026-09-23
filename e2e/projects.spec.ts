import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Project Pages", () => {
  test("index lists grouped projects with count, back link, and live links", async ({ page }) => {
    await page.goto("/projects");
    await waitForPreloader(page);

    await expect(page.locator("h1")).toContainText("launches");
    await expect(page.locator("h1")).toContainText("26");
    await expect(page.locator("h2:has-text('Boutique & Fashion')")).toBeVisible();
    await expect(page.locator("h2:has-text('Salon & Beauty')")).toBeVisible();
    await expect(page.locator("h2:has-text('Café & Restaurant')")).toBeVisible();
    await expect(page.locator("text=Nikky Bawa Ladies Salon")).toBeVisible();
    await expect(page.locator("text=Back home")).toBeVisible();
    expect(await page.locator("text=Live site").count()).toBeGreaterThan(0);
  });

  test("detail renders project details and embed preview", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);

    await expect(page.locator("h1")).toContainText("Nikky Bawa Ladies Salon");
    await expect(page.locator(".uppercase:has-text('Salon & Beauty')")).toBeVisible();
    await expect(page.locator("text=Next.js")).toBeVisible();
    await expect(page.locator("text=Tailwind CSS")).toBeVisible();
    await expect(page.locator("text=Visit live site")).toBeVisible();
    await expect(page.locator("text=Back to all projects")).toBeVisible();
    await expect(page.locator("span:has-text('PREVIEW'), span:has-text('LIVE')").first()).toBeVisible();
  });

  test("other project pages render their own content", async ({ page }) => {
    await page.goto("/projects/saddle-london");
    await expect(page.locator("text=Back to all projects")).toBeVisible();

    await page.goto("/projects/latte-love");
    await expect(page.locator("p:has-text('Latte Love in Arera Colony')")).toBeVisible();
  });

  test("non-existent project shows 404", async ({ page }) => {
    const response = await page.goto("/projects/non-existent-project");
    const notFound = page.locator("text=Lost in space");
    const hasNotFound = await notFound.isVisible().catch(() => false);
    expect(response?.status() === 404 || hasNotFound).toBeTruthy();
  });
});
