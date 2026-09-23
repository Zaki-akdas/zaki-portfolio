import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Blog", () => {
  test("index lists published posts with tags", async ({ page }) => {
    await page.goto("/blog");
    await waitForPreloader(page);

    await expect(page.locator("h1")).toContainText("Blog");
    await expect(page.locator("text=Transmissions")).toBeVisible();
    await expect(page.locator("text=Making WebGL fly on mid-range Android phones")).toBeVisible();
    await expect(page.locator("text=Case study: how a 3D configurator lifted conversion 34%")).toBeVisible();
    await expect(page.locator(".rounded-full:has-text('WebGL')").first()).toBeVisible();
    await expect(page.locator(".rounded-full:has-text('Performance')").first()).toBeVisible();
  });

  test("clicking a blog post navigates to the post page", async ({ page }) => {
    await page.goto("/blog");
    await waitForPreloader(page);

    await page.click("text=Making WebGL fly on mid-range Android phones");
    await page.waitForURL(/\/blog\/webgl-performance/);
    await expect(page.locator("h1")).toContainText("Making WebGL fly");
  });

  test("detail renders markdown, metadata, tags, and chrome", async ({ page }) => {
    await page.goto("/blog/webgl-performance-mid-range-android");
    await waitForPreloader(page);

    // Markdown headings (## maps to <h3> because the renderer adds +1)
    await expect(page.locator("h3:has-text('Budget your pixels')")).toBeVisible();
    await expect(page.locator("h3:has-text('Kill postprocessing on mobile')")).toBeVisible();
    await expect(page.locator("article code").first()).toBeVisible();
    await expect(page.locator("blockquote").first()).toBeVisible();

    await expect(page.locator("text=by Zaki Akdas Choudhary")).toBeVisible();
    await expect(page.locator("span:has-text('WebGL')").first()).toBeVisible();
    await expect(page.locator("span:has-text('Performance')").first()).toBeVisible();

    await expect(page.locator("text=Enjoyed this?")).toBeVisible();
    await expect(page.locator("text=Start a project")).toBeVisible();
    await expect(page.locator("text=All posts")).toBeVisible();
  });

  test("second blog post is accessible", async ({ page }) => {
    await page.goto("/blog/case-study-nebula-commerce-34-percent");
    await expect(page.locator("h1")).toContainText("Case study");
    await expect(page.locator("p:has-text('Nebula Audio')").first()).toBeVisible();
    await expect(page.locator("h3:has-text('The diagnosis')")).toBeVisible();
  });

  test("non-existent blog post shows 404", async ({ page }) => {
    const response = await page.goto("/blog/non-existent-post");
    const notFound = page.locator("text=Lost in space");
    const hasNotFound = await notFound.isVisible().catch(() => false);
    expect(response?.status() === 404 || hasNotFound).toBeTruthy();
  });
});
