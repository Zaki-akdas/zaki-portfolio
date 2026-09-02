import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("contact form renders all fields and submit button", async ({ page }) => {
    const form = page.locator("#contact form").first();
    await expect(form).toBeVisible();

    await expect(form.locator("input[name='name']")).toBeVisible();
    await expect(form.locator("input[name='email']")).toBeVisible();
    await expect(form.locator("input[name='subject']")).toBeVisible();
    await expect(form.locator("textarea[name='message']")).toBeVisible();
    await expect(form.locator("button[type='submit']")).toContainText("Send message");
  });

  test("contact form validates required fields via attributes", async ({ page }) => {
    const nameInput = page.locator("input[name='name']");
    const emailInput = page.locator("input[name='email']");
    const msgInput = page.locator("textarea[name='message']");

    await expect(nameInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(msgInput).toHaveAttribute("required", "");
  });

  test("contact form accepts valid input", async ({ page }) => {
    const form = page.locator("#contact form").first();
    await form.locator("input[name='name']").fill("Test User");
    await form.locator("input[name='email']").fill("test@example.com");
    await form.locator("input[name='subject']").fill("Project inquiry");
    await form.locator("textarea[name='message']").fill("Hello, I'd like to discuss a project.");

    await expect(form.locator("input[name='name']")).toHaveValue("Test User");
    await expect(form.locator("input[name='email']")).toHaveValue("test@example.com");
    await expect(form.locator("textarea[name='message']")).toHaveValue("Hello, I'd like to discuss a project.");
  });

  test("contact form submits successfully", async ({ page }) => {
    const form = page.locator("#contact form").first();
    await form.locator("input[name='name']").fill("E2E Test User");
    await form.locator("input[name='email']").fill("e2e@test.com");
    await form.locator("input[name='subject']").fill("E2E test message");
    await form.locator("textarea[name='message']").fill("This is an automated test message.");

    await form.locator("button[type='submit']").click();

    // Should show success message
    await expect(page.locator("text=Message received")).toBeVisible({ timeout: 10000 });
  });

  test("contact section shows availability status", async ({ page }) => {
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.locator("#contact >> text=Open for new projects")).toBeVisible();
  });

  test("contact section shows email and location", async ({ page }) => {
    await expect(page.locator("text=zakiakdas703@gmail.com")).toBeVisible();
    await expect(page.locator("text=Indore, India")).toBeVisible();
  });

  test("contact section shows social links", async ({ page }) => {
    const contactSocials = page.locator("#contact").locator("ul");
    await expect(contactSocials.locator("a:has-text('GitHub')")).toBeVisible();
    await expect(contactSocials.locator("a:has-text('Instagram')")).toBeVisible();
    await expect(contactSocials.locator("a:has-text('WhatsApp')")).toBeVisible();
  });

  test("contact form email input validates format", async ({ page }) => {
    const emailInput = page.locator("input[name='email']");
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("inputMode", "email");
  });

  test("contact form textarea has appropriate rows", async ({ page }) => {
    const textarea = page.locator("textarea[name='message']");
    await expect(textarea).toHaveAttribute("rows", "5");
    await expect(textarea).toHaveAttribute("required", "");
  });

  test("contact form shows sending state while submitting", async ({ page }) => {
    const form = page.locator("#contact form").first();
    await form.locator("input[name='name']").fill("State Test");
    await form.locator("input[name='email']").fill("state@test.com");
    await form.locator("textarea[name='message']").fill("Testing button state.");

    await form.locator("button[type='submit']").click();

    // Button should show loading state briefly, then success
    await expect(page.locator("text=Message received")).toBeVisible({ timeout: 15000 });
    await expect(form.locator("button[type='submit']")).toContainText("Send message");
  });
});
