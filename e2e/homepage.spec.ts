import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("hero renders title, availability badge, and CTA targets", async ({ page }) => {
    await expect(page).toHaveTitle(/Zaki Akdas Choudhary/);
    await expect(page.locator("section").first()).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Crafting[\s\S]*stellar[\s\S]*digital[\s\S]*experiences/);
    // Scoped to the hero: the header carries a hidden copy of the same badge.
    await expect(page.locator("section").first().getByText("Open for new projects")).toBeVisible();

    // Each hero CTA promises where it takes you.
    for (const [name, href] of [
      ["Explore my universe", "/#projects"],
      ["Start a project", "/#contact"],
    ]) {
      const cta = page.getByRole("link", { name, exact: true });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute("href", href);
    }
  });

  test("nav bar shows every entry point", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const label of ["About", "Skills", "Work", "Services", "Blog", "Contact", "Hire me"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  // Section contract: the anchor id the nav targets plus the copy it must show.
  // Field-level form coverage lives in contact.spec.ts.
  const SECTIONS: [id: string, heading: string, texts: string[]][] = [
    ["#about", "The developer behind the mission", ["Live client websites", "Cities served", "Happy clients"]],
    ["#skills", "Tools in my orbit", ["Frontend", "Backend"]],
    ["#projects", "Missions", ["Nikky Bawa"]],
    ["#services", "How I can help you launch", ["Web App Development"]],
    ["#contact", "Ready for lift-off?", []],
  ];

  for (const [id, heading, texts] of SECTIONS) {
    test(`section ${id} renders its heading and content`, async ({ page }) => {
      const section = page.locator(id);
      await expect(section).toBeVisible();
      await expect(section).toContainText(heading);
      for (const t of texts) await expect(section).toContainText(t);
    });
  }

  test("footer renders with tagline and social links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    for (const t of ["Handcrafted among the stars", "GitHub", "Instagram", "WhatsApp"]) {
      await expect(footer).toContainText(t);
    }
  });
});
