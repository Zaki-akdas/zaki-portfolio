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
    const menu = page.getByRole("navigation", { name: "Menu" });
    const headerClose = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Close menu" });
    await expect(headerClose).toBeVisible(); // header toggle stays clickable above the overlay

    // Mobile menu shows its own nav landmark with the section links
    await expect(menu.getByRole("link", { name: "About", exact: true })).toBeVisible();

    // Close menu via the header toggle (regression: overlay used to cover it)
    await headerClose.click();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("hamburger menu link navigates and closes menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await waitForPreloader(page);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(300);

    // Click the About link in the mobile overlay menu
    const menu = page.getByRole("navigation", { name: "Menu" });
    await menu.getByRole("link", { name: "About", exact: true }).click();

    // Menu should be closed (hamburger visible again)
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("nav becomes opaque on scroll", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toHaveClass(/bg-transparent/);

    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(400);

    await expect(header).toHaveClass(/backdrop-blur-xl/);
  });
});
