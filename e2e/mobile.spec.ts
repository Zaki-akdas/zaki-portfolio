import { test, expect } from "@playwright/test";
import { waitForPreloader } from "./helpers";

/**
 * Mobile viewport tests — iPhone SE / XR size (375 × 812).
 * Every test in this file runs at 375px width to verify responsive layout,
 * touch targets (≥ 44px), content stacking, and no horizontal overflow.
 */

const MOBILE = { width: 375, height: 812 } as const;

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Assert that no element overflows the viewport width. */
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const body = document.body;
    return body.scrollWidth > docWidth + 1; // +1 px tolerance
  });
  expect(overflow, "Page has horizontal overflow").toBe(false);
}

/** Assert a touch target is at least minPx tall. */
async function assertMinTouchTarget(locator: import("@playwright/test").Locator, minPx = 44) {
  const height = await locator.evaluate((el) => el.getBoundingClientRect().height);
  expect(height, `Touch target too small: ${height}px < ${minPx}px`).toBeGreaterThanOrEqual(minPx);
}

// ─── Homepage (375px) ───────────────────────────────────────────────────────

test.describe("Mobile — Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("no horizontal overflow", async ({ page }) => {
    await assertNoHorizontalOverflow(page);
  });

  test("hamburger menu is visible, desktop nav links are hidden", async ({ page }) => {
    // Hamburger should be visible
    await expect(page.locator("button[aria-label='Open menu']")).toBeVisible();

    // Desktop nav links (inside the hidden md:flex ul) should NOT be visible
    const desktopNav = page.locator("nav ul.hidden");
    await expect(desktopNav).not.toBeVisible();
  });

  test("hero CTA buttons meet touch target size", async ({ page }) => {
    const explore = page.locator("a:has-text('Explore my universe')");
    const start = page.locator("a:has-text('Start a project')");
    await assertMinTouchTarget(explore, 48);
    await assertMinTouchTarget(start, 48);
  });

  test("availability badge is visible in hero", async ({ page }) => {
    await expect(page.locator("section >> .reveal:has-text('Open for new projects')").first()).toBeVisible();
  });

  test("hero headline fits viewport width", async ({ page }) => {
    const h1 = page.locator("h1");
    const box = await h1.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 1);
  });

  test("about section stacks vertically", async ({ page }) => {
    // At 375px, the about grid (lg:grid-cols-[1.2fr,1fr]) should be single column
    const grid = page.locator("#about .grid").first();
    const columns = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.gridTemplateColumns;
    });
    // Single column means one value (no space between columns)
    const parts = columns.trim().split(/\s+/);
    expect(parts.length, `Expected single column grid but got: ${columns}`).toBe(1);
  });

  test("about stats are visible", async ({ page }) => {
    await expect(page.locator("#about >> text=Live client websites")).toBeVisible();
    await expect(page.locator("#about >> text=Cities served")).toBeVisible();
  });

  test("resume link meets touch target", async ({ page }) => {
    const resume = page.locator("a:has-text('Download résumé')");
    await assertMinTouchTarget(resume, 44);
  });

  test("skills grid stacks to single column", async ({ page }) => {
    const grid = page.locator("#skills .grid.gap-10");
    const columns = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.gridTemplateColumns;
    });
    const parts = columns.trim().split(/\s+/);
    expect(parts.length, `Expected single column for skills at 375px but got: ${columns}`).toBe(1);
  });

  test("project cards stack vertically", async ({ page }) => {
    const grid = page.locator("#projects .grid.gap-6");
    const columns = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.gridTemplateColumns;
    });
    const parts = columns.trim().split(/\s+/);
    expect(parts.length, `Expected single column for projects at 375px but got: ${columns}`).toBe(1);
  });

  test("services grid stacks vertically", async ({ page }) => {
    // The services section has two grids; both should be single-column at 375px
    const grids = page.locator("#services .grid");
    const count = await grids.count();
    for (let i = 0; i < count; i++) {
      const columns = await grids.nth(i).evaluate((el) => getComputedStyle(el).gridTemplateColumns);
      const parts = columns.trim().split(/\s+/);
      expect(parts.length, `Grid ${i} expected single column at 375px but got: ${columns}`).toBe(1);
    }
  });

  test("contact form is full-width with large touch targets", async ({ page }) => {
    const nameInput = page.locator("input[name='name']");
    const emailInput = page.locator("input[name='email']");
    const msgTextarea = page.locator("textarea[name='message']");
    const submitBtn = page.locator("#contact form button[type='submit']");

    // All inputs should be full width (or close to viewport width)
    for (const el of [nameInput, emailInput, msgTextarea]) {
      const box = await el.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(250); // At least most of the 375px viewport
    }

    // Submit button should be full width on mobile
    const btnBox = await submitBtn.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(btnBox!.width).toBeGreaterThan(250);

    // Touch targets
    await assertMinTouchTarget(nameInput, 48);
    await assertMinTouchTarget(emailInput, 48);
    await assertMinTouchTarget(submitBtn, 48);
  });

  test("contact info cards are visible", async ({ page }) => {
    await expect(page.locator("#contact >> text=zakiakdas703@gmail.com")).toBeVisible();
    await expect(page.locator("#contact >> text=Indore, India")).toBeVisible();
    await expect(page.locator("#contact >> text=GitHub")).toBeVisible();
  });

  test("footer stacks vertically", async ({ page }) => {
    // The footer has a flex container that switches from flex-col to sm:flex-row
    const footerFlex = page.locator("footer .flex.max-w-6xl");
    await expect(footerFlex).toHaveClass(/flex-col/);
  });

  test("footer social links meet touch target", async ({ page }) => {
    const github = page.locator("footer a:has-text('GitHub')");
    await assertMinTouchTarget(github, 44);
  });

  test("sound toggle button is accessible", async ({ page }) => {
    const btn = page.locator("button[aria-label='Play ambient sound']");
    await expect(btn).toBeVisible();
    await assertMinTouchTarget(btn, 44);
  });

  test("back to top button is accessible", async ({ page }) => {
    const btn = page.locator("button[aria-label='Back to top']");
    // Should be present (even if hidden initially)
    await expect(btn).toBeAttached();
  });

  test("marquee section is visible and doesn't overflow", async ({ page }) => {
    const marquee = page.locator("section[aria-hidden]");
    await expect(marquee).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});

// ─── Mobile — Hamburger menu full flow ──────────────────────────────────────

test.describe("Mobile — Hamburger Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("hamburger opens and shows all navigation links", async ({ page }) => {
    await page.click("button[aria-label='Open menu']");
    await expect(page.locator("button[aria-label='Close menu']")).toBeVisible();

    // All links should be visible in the overlay
    const overlay = page.locator(".fixed.inset-0.z-50");
    await expect(overlay.locator("a:has-text('About')")).toBeVisible();
    await expect(overlay.locator("a:has-text('Skills')")).toBeVisible();
    await expect(overlay.locator("a:has-text('Work')")).toBeVisible();
    await expect(overlay.locator("a:has-text('Services')")).toBeVisible();
    await expect(overlay.locator("a:has-text('Blog')")).toBeVisible();
    await expect(overlay.locator("a:has-text('Contact')")).toBeVisible();
  });

  test("hamburger menu links are large touch targets", async ({ page }) => {
    await page.click("button[aria-label='Open menu']");
    await page.waitForTimeout(400);

    const aboutLink = page.locator(".fixed.inset-0 a:has-text('About')").first();
    const box = await aboutLink.boundingBox();
    expect(box).not.toBeNull();
    // The mobile menu uses text-3xl font, so links should be tall
    expect(box!.height).toBeGreaterThan(30);
  });

  test("hamburger menu shows availability status", async ({ page }) => {
    await page.click("button[aria-label='Open menu']");
    await page.waitForTimeout(400);
    await expect(page.locator(".fixed.inset-0 >> text=Open for new projects")).toBeVisible();
  });

  test("clicking a link in mobile menu closes the menu", async ({ page }) => {
    await page.click("button[aria-label='Open menu']");
    await page.waitForTimeout(300);

    const aboutLink = page.locator(".fixed.inset-0 a:has-text('About')").first();
    await aboutLink.click();

    // Menu should close — hamburger re-appears
    await expect(page.locator("button[aria-label='Open menu']")).toBeVisible();
  });

  test("scrolling locks body when menu is open", async ({ page }) => {
    await page.click("button[aria-label='Open menu']");
    await page.waitForTimeout(200);

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("hidden");
  });

  test("closing menu restores body scroll", async ({ page }) => {
    await page.click("button[aria-label='Open menu']");
    await page.waitForTimeout(200);
    await page.click("button[aria-label='Close menu']");
    await page.waitForTimeout(200);

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe("");
  });
});

// ─── Mobile — Projects page ─────────────────────────────────────────────────

test.describe("Mobile — Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test("all projects page has no horizontal overflow", async ({ page }) => {
    await page.goto("/projects");
    await waitForPreloader(page);
    await assertNoHorizontalOverflow(page);
  });

  test("projects page grid stacks to single column", async ({ page }) => {
    await page.goto("/projects");
    await waitForPreloader(page);

    // The project grid uses sm:grid-cols-2 lg:grid-cols-3
    // At 375px it should be single column
    const grid = page.locator(".grid.gap-5");
    const count = await grid.count();
    if (count > 0) {
      const columns = await grid.first().evaluate((el) => {
        return getComputedStyle(el).gridTemplateColumns;
      });
      const parts = columns.trim().split(/\s+/);
      expect(parts.length).toBe(1);
    }
  });

  test("project cards are visible and touch-friendly", async ({ page }) => {
    await page.goto("/projects");
    await waitForPreloader(page);

    // At least the first project card should be visible
    await expect(page.locator("text=Nikky Bawa Ladies Salon")).toBeVisible();

    // Back link should be touch-friendly
    const backLink = page.locator("a:has-text('Back home')");
    await assertMinTouchTarget(backLink, 44);
  });

  test("individual project page has no horizontal overflow", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);
    await assertNoHorizontalOverflow(page);
  });

  test("individual project page renders all details", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);

    await expect(page.locator("h1")).toContainText("Nikky Bawa");
    await expect(page.locator("text=Next.js")).toBeVisible();
    await expect(page.locator("text=Visit live site")).toBeVisible();
    await expect(page.locator("text=Back to all projects")).toBeVisible();
  });

  test("project CTA buttons are touch-friendly on mobile", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);

    const liveBtn = page.locator("a:has-text('Visit live site')");
    await expect(liveBtn).toBeVisible();
    await assertMinTouchTarget(liveBtn, 44);
  });
});

// ─── Mobile — Blog pages ────────────────────────────────────────────────────

test.describe("Mobile — Blog Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test("blog index has no horizontal overflow", async ({ page }) => {
    await page.goto("/blog");
    await waitForPreloader(page);
    await assertNoHorizontalOverflow(page);
  });

  test("blog grid stacks to single column", async ({ page }) => {
    await page.goto("/blog");
    await waitForPreloader(page);

    // Blog uses sm:grid-cols-2, at 375px it should be single column
    const grid = page.locator(".grid.gap-6");
    const columns = await grid.evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns;
    });
    const parts = columns.trim().split(/\s+/);
    expect(parts.length, `Expected single column for blog at 375px but got: ${columns}`).toBe(1);
  });

  test("blog post cards are visible", async ({ page }) => {
    await page.goto("/blog");
    await waitForPreloader(page);
    await expect(page.locator("text=Making WebGL fly on mid-range Android phones")).toBeVisible();
    await expect(page.locator("text=Case study: how a 3D configurator lifted conversion 34%")).toBeVisible();
  });

  test("individual blog post has no horizontal overflow", async ({ page }) => {
    await page.goto("/blog/webgl-performance-mid-range-android");
    await waitForPreloader(page);
    await assertNoHorizontalOverflow(page);
  });

  test("blog post content is readable on mobile", async ({ page }) => {
    await page.goto("/blog/webgl-performance-mid-range-android");
    await waitForPreloader(page);

    // Title should fit
    const h1 = page.locator("h1");
    const box = await h1.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1); // allow 1px tolerance
    expect(box!.x + box!.width).toBeLessThanOrEqual(376);

    // Content should be visible
    await expect(page.locator("article").first()).toBeVisible();

    // Back link should be touch-friendly
    const backLink = page.locator("a:has-text('All posts')");
    await assertMinTouchTarget(backLink, 44);
  });

  test("blog post code blocks don't overflow", async ({ page }) => {
    await page.goto("/blog/webgl-performance-mid-range-android");
    await waitForPreloader(page);

    // Code blocks have overflow-x: auto, so they should not cause page overflow
    await assertNoHorizontalOverflow(page);
  });
});

// ─── Mobile — 404 page ──────────────────────────────────────────────────────

test.describe("Mobile — 404 Page", () => {
  test("404 page renders properly on mobile", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/non-existent-page");
    await waitForPreloader(page);

    await expect(page.locator("text=Lost in space")).toBeVisible();
    await expect(page.locator("text=Return to Earth")).toBeVisible();

    // CTA button should be touch-friendly
    const cta = page.locator("a:has-text('Return to Earth')");
    await assertMinTouchTarget(cta, 44);

    // No overflow
    await assertNoHorizontalOverflow(page);
  });
});

// ─── Mobile — Viewport resize consistency ───────────────────────────────────

test.describe("Mobile — Responsive consistency", () => {
  test("homepage adapts when resizing from desktop to mobile", async ({ page }) => {
    // Start at desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await waitForPreloader(page);

    // Desktop nav links should be visible
    await expect(page.locator("nav ul >> text=About")).toBeVisible();

    // Resize to mobile
    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(300);

    // Hamburger should now be visible
    await expect(page.locator("button[aria-label='Open menu']")).toBeVisible();

    // No overflow after resize
    await assertNoHorizontalOverflow(page);
  });

  test("contact form layout changes from two-column to stacked", async ({ page }) => {
    // Desktop: name and email in a 2-column grid
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await waitForPreloader(page);

    const nameInput = page.locator("input[name='name']");
    const emailInput = page.locator("input[name='email']");
    const nameBox = await nameInput.boundingBox();
    const emailBox = await emailInput.boundingBox();
    expect(nameBox).not.toBeNull();
    expect(emailBox).not.toBeNull();
    // On desktop, email should be to the right of name (not below)
    expect(emailBox!.x).toBeGreaterThan(nameBox!.x + nameBox!.width - 10);

    // Mobile: name and email should stack
    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(300);
    const nameBoxM = await nameInput.boundingBox();
    const emailBoxM = await emailInput.boundingBox();
    expect(nameBoxM).not.toBeNull();
    expect(emailBoxM).not.toBeNull();
    // On mobile, email should be below name (same x, different y)
    expect(emailBoxM!.y).toBeGreaterThan(nameBoxM!.y + nameBoxM!.height - 10);
  });
});
