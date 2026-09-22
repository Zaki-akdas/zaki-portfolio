import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  // Field contract: presence and constraints each control promises.
  const FIELDS: {
    selector: string;
    required: boolean;
    type?: string;
    inputMode?: string;
    rows?: string;
  }[] = [
    { selector: "input[name='name']", required: true },
    { selector: "input[name='email']", required: true, type: "email", inputMode: "email" },
    { selector: "input[name='subject']", required: false },
    { selector: "textarea[name='message']", required: true, rows: "5" },
  ];

  test("fields are present with their constraints", async ({ page }) => {
    for (const f of FIELDS) {
      const el = page.locator(f.selector);
      await expect(el).toBeVisible();
      if (f.required) await expect(el).toHaveAttribute("required", "");
      else await expect(el).not.toHaveAttribute("required", "");
      if (f.type) await expect(el).toHaveAttribute("type", f.type);
      if (f.inputMode) await expect(el).toHaveAttribute("inputMode", f.inputMode);
      if (f.rows) await expect(el).toHaveAttribute("rows", f.rows);
    }
    await expect(page.locator("#contact form button[type='submit']")).toContainText("Send message");
  });

  test("accepts and retains valid input", async ({ page }) => {
    const values: [string, string][] = [
      ["input[name='name']", "Test User"],
      ["input[name='email']", "test@example.com"],
      ["input[name='subject']", "Project inquiry"],
      ["textarea[name='message']", "Hello, I'd like to discuss a project."],
    ];
    for (const [selector, value] of values) {
      await page.locator(selector).fill(value);
      await expect(page.locator(selector)).toHaveValue(value);
    }
  });

  test("submits a message, confirms, and restores the button", async ({ page }) => {
    await page.locator("input[name='name']").fill("E2E Test User");
    await page.locator("input[name='email']").fill("e2e@test.com");
    await page.locator("input[name='subject']").fill("E2E test message");
    await page.locator("textarea[name='message']").fill("This is an automated test message.");

    await page.locator("#contact form button[type='submit']").click();
    await expect(page.locator("text=Message received")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("#contact form button[type='submit']")).toContainText("Send message");
  });

  test("shows availability, contact details, and social links", async ({ page }) => {
    await expect(page.locator("#contact >> text=Open for new projects")).toBeVisible();
    await expect(page.locator("#contact >> text=zakiakdas703@gmail.com")).toBeVisible();
    await expect(page.locator("#contact >> text=Indore, India")).toBeVisible();

    const socials = page.locator("#contact").locator("ul");
    for (const label of ["GitHub", "Instagram", "WhatsApp"]) {
      await expect(socials.locator(`a:has-text('${label}')`)).toBeVisible();
    }
  });
});
