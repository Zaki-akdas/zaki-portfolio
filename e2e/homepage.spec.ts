import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("loads successfully and shows hero section", async ({ page }) => {
    await expect(page).toHaveTitle(/Zaki Akdas Choudhary/);

    // Hero headline is visible
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    await expect(page.locator("h1")).toContainText("Crafting");
    await expect(page.locator("h1")).toContainText("stellar");
    await expect(page.locator("h1")).toContainText("digital");
    await expect(page.locator("h1")).toContainText("experiences");
    await expect(page.locator("section >> .reveal:has-text('Open for new projects')").first()).toBeVisible();
    await expect(page.locator("text=Explore my universe")).toBeVisible();
    await expect(page.locator("text=Start a project")).toBeVisible();
  });

  test("scroll cue is present in hero", async ({ page }) => {
    const scrollCue = page.locator(".animate-bounce");
    await expect(scrollCue).toBeVisible();
  });

  test("renders the nav bar with all links", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav >> text=About")).toBeVisible();
    await expect(page.locator("nav >> text=Skills")).toBeVisible();
    await expect(page.locator("nav >> text=Work")).toBeVisible();
    await expect(page.locator("nav >> text=Services")).toBeVisible();
    await expect(page.locator("nav >> text=Blog")).toBeVisible();
    await expect(page.locator("nav >> text=Contact")).toBeVisible();
    await expect(page.locator("nav >> text=Hire me")).toBeVisible();
  });

  test("About section renders with stats", async ({ page }) => {
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#about >> text=The developer behind the mission")).toBeVisible();
    await expect(page.locator("#about >> text=Live client websites")).toBeVisible();
    await expect(page.locator("#about >> text=Cities served")).toBeVisible();
    await expect(page.locator("#about >> text=Happy clients")).toBeVisible();
  });

  test("Skills section renders skill categories", async ({ page }) => {
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#skills >> text=Tools in my orbit")).toBeVisible();
    await expect(page.locator("#skills >> text=Frontend")).toBeVisible();
    await expect(page.locator("#skills >> text=Backend")).toBeVisible();
  });

  test("Projects section renders project cards", async ({ page }) => {
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#projects >> text=Missions")).toBeVisible();
    await expect(page.locator("#projects >> text=Nikky Bawa")).toBeVisible();
  });

  test("Services section renders", async ({ page }) => {
    await expect(page.locator("#services")).toBeVisible();
    await expect(page.locator("#services >> text=How I can help you launch")).toBeVisible();
    await expect(page.locator("#services >> text=Web App Development")).toBeVisible();
  });

  test("Contact section renders form", async ({ page }) => {
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.locator("#contact >> text=Ready for lift-off?")).toBeVisible();
    await expect(page.locator("input[name='name']")).toBeVisible();
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("textarea[name='message']")).toBeVisible();
  });

  test("footer renders with social links", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer >> text=Handcrafted among the stars")).toBeVisible();
    await expect(page.locator("footer >> text=GitHub")).toBeVisible();
    await expect(page.locator("footer >> text=Instagram")).toBeVisible();
    await expect(page.locator("footer >> text=WhatsApp")).toBeVisible();
  });
});
