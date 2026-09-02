import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("desktop nav links navigate to correct sections", async ({ page }) => {
    await page.click("nav >> text=About");
    await expect(page.locator("#about")).toBeVisible();

    await page.click("nav >> text=Skills");
    await expect(page.locator("#skills")).toBeVisible();

    await page.click("nav >> text=Work");
    await expect(page.locator("#projects")).toBeVisible();

    await page.click("nav >> text=Services");
    await expect(page.locator("#services")).toBeVisible();
  });

  test("nav logo links back to home", async ({ page }) => {
    // On the homepage, verify the logo link has the correct href
    const logo = page.locator("header >> a[href='/#top']");
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("Zaki");
  });

  test("Hire me CTA navigates to contact", async ({ page }) => {
    await page.click("nav >> text=Hire me");
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("scroll progress bar updates on scroll", async ({ page }) => {
    const bar = page.locator("#scroll-progress");
    await expect(bar).toHaveCSS("width", "0px");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const width = await bar.evaluate((el) => parseInt(getComputedStyle(el).width));
    expect(width).toBeGreaterThan(0);
  });

  test("hamburger menu opens and closes on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForPreloader(page);

    const hamburger = page.locator("button[aria-label='Open menu']");
    await expect(hamburger).toBeVisible();

    // Open menu
    await hamburger.click();
    await expect(page.locator("button[aria-label='Close menu']")).toBeVisible();

    // Mobile menu should show a large "About" link (in the off-canvas overlay)
    await expect(page.locator(".fixed.inset-0 >> a >> text=About")).toBeVisible();

    // Close menu
    await page.click("button[aria-label='Close menu']");
    await expect(page.locator("button[aria-label='Open menu']")).toBeVisible();
  });

  test("hamburger menu link navigates and closes menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForPreloader(page);

    await page.click("button[aria-label='Open menu']");
    await page.waitForTimeout(300);

    // Click the About link in the mobile overlay menu
    const aboutLink = page.locator(".fixed.inset-0 a:has-text('About')").first();
    await aboutLink.click();

    // Menu should be closed (hamburger visible again)
    await expect(page.locator("button[aria-label='Open menu']")).toBeVisible();
  });

  test("nav becomes opaque on scroll", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toHaveClass(/bg-transparent/);

    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(400);

    await expect(header).toHaveClass(/backdrop-blur-xl/);
  });
});
