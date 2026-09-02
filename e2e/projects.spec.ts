import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Project Pages", () => {
  test("all projects page lists projects grouped by category", async ({ page }) => {
    await page.goto("/projects");
    await waitForPreloader(page);

    await expect(page.locator("h1")).toContainText("launches");

    // Category headings
    await expect(page.locator("h2:has-text('Boutique & Fashion')")).toBeVisible();
    await expect(page.locator("h2:has-text('Salon & Beauty')")).toBeVisible();
    await expect(page.locator("h2:has-text('Café & Restaurant')")).toBeVisible();

    // Project titles
    await expect(page.locator("text=Nikky Bawa Ladies Salon")).toBeVisible();
  });

  test("all projects page has back link", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("text=Back home")).toBeVisible();
  });

  test("all projects page has correct project count", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("h1")).toContainText("26");
  });

  test("individual project page renders project details", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);

    await expect(page.locator("h1")).toContainText("Nikky Bawa Ladies Salon");
    await expect(page.locator(".uppercase:has-text('Salon & Beauty')")).toBeVisible();
    await expect(page.locator("text=Next.js")).toBeVisible();
    await expect(page.locator("text=Tailwind CSS")).toBeVisible();
    await expect(page.locator("text=Visit live site")).toBeVisible();
  });

  test("individual project page has back link", async ({ page }) => {
    await page.goto("/projects/saddle-london");
    await expect(page.locator("text=Back to all projects")).toBeVisible();
  });

  test("project page description renders paragraphs", async ({ page }) => {
    await page.goto("/projects/latte-love");
    await expect(page.locator("p:has-text('Latte Love in Arera Colony')")).toBeVisible();
  });

  test("non-existent project shows 404", async ({ page }) => {
    const response = await page.goto("/projects/non-existent-project");
    const notFound = page.locator("text=Lost in space");
    const hasNotFound = await notFound.isVisible().catch(() => false);
    expect(response?.status() === 404 || hasNotFound).toBeTruthy();
  });

  test("project page with live URL shows embedded preview", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);
    await expect(page.locator("span:has-text('PREVIEW'), span:has-text('LIVE')").first()).toBeVisible();
  });

  test("all projects page has live site links", async ({ page }) => {
    await page.goto("/projects");
    const liveLinks = page.locator("text=Live site");
    const count = await liveLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
