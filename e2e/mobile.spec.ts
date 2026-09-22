import { test, expect, type Page, type Locator } from "@playwright/test";
import { waitForPreloader } from "./helpers";

/**
 * Mobile contract at 375×812:
 *  - no horizontal overflow on any route (code blocks included — they are
 *    covered by the page-level check on the post route),
 *  - grids collapse to a single column,
 *  - interactive controls meet minimum touch sizes,
 *  - the hamburger menu is fully operable (open, navigate, close, scroll lock).
 */

const MOBILE = { width: 375, height: 812 } as const;

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.body.scrollWidth > document.documentElement.clientWidth + 1 // +1px tolerance
  );
  expect(overflow, "Page has horizontal overflow").toBe(false);
}

async function assertSingleColumn(page: Page, selector: string, all = false) {
  const grids = page.locator(selector);
  const count = await grids.count();
  expect(count, `no element matches ${selector}`).toBeGreaterThan(0);
  for (let i = 0; i < (all ? count : 1); i++) {
    const columns = await grids.nth(i).evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(columns.trim().split(/\s+/), `expected single column for ${selector} #${i}`).toHaveLength(1);
  }
}

async function assertMinTouchTarget(locator: Locator, minPx: number) {
  const height = await locator.evaluate((el) => el.getBoundingClientRect().height);
  expect(height, `touch target too small: ${height}px < ${minPx}px`).toBeGreaterThanOrEqual(minPx);
}

async function openMenu(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Open menu" }).click();
  return page.getByRole("navigation", { name: "Menu" });
}

// ─── Cross-page invariants (tables) ────────────────────────────────────────

const NO_OVERFLOW_ROUTES = [
  "/",
  "/projects",
  "/projects/nikky-bawa-salon",
  "/blog",
  "/blog/webgl-performance-mid-range-android",
  "/non-existent-page",
];
for (const route of NO_OVERFLOW_ROUTES) {
  test(`no horizontal overflow on ${route}`, async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(route);
    await waitForPreloader(page);
    await assertNoHorizontalOverflow(page);
  });
}

const STACKED_GRIDS = [
  {
    route: "/",
    // primary section grids only — e.g. the about stats row stays multi-column
    grids: [
      { selector: "#about .grid" },
      { selector: "#skills .grid" },
      { selector: "#projects .grid" },
      { selector: "#services .grid", all: true },
    ],
  },
  { route: "/blog", grids: [{ selector: ".grid.gap-6" }] }, // card grid
  { route: "/projects", grids: [{ selector: ".grid.gap-5" }] },
];
for (const { route, grids } of STACKED_GRIDS) {
  test(`grids stack to one column at 375px on ${route}`, async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(route);
    await waitForPreloader(page);
    for (const { selector, all } of grids) await assertSingleColumn(page, selector, all);
  });
}

const TOUCH_TARGETS = [
  {
    route: "/",
    min: 48,
    selectors: [
      "a:has-text('Explore my universe')",
      "a:has-text('Start a project')",
      "input[name='name']",
      "input[name='email']",
      "#contact form button[type='submit']",
    ],
  },
  {
    route: "/",
    min: 44,
    selectors: [
      "a:has-text('Download résumé')",
      "footer a:has-text('GitHub')",
      "button[aria-label='Play ambient sound']",
    ],
  },
  { route: "/projects", min: 44, selectors: ["a:has-text('Back home')"] },
  { route: "/projects/nikky-bawa-salon", min: 44, selectors: ["a:has-text('Visit live site')"] },
  { route: "/blog/webgl-performance-mid-range-android", min: 44, selectors: ["a:has-text('All posts')"] },
  { route: "/non-existent-page", min: 44, selectors: ["a:has-text('Return to Earth')"] },
];
for (const { route, min, selectors } of TOUCH_TARGETS) {
  test(`touch targets ≥ ${min}px on ${route}`, async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(route);
    await waitForPreloader(page);
    for (const selector of selectors) await assertMinTouchTarget(page.locator(selector), min);
  });
}

// ─── Homepage ──────────────────────────────────────────────────────────────

test.describe("Mobile — Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await waitForPreloader(page);
  });

  test("hamburger shown, desktop nav hidden", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    const desktopAbout = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "About", exact: true });
    await expect(desktopAbout).toBeHidden();
  });

  test("hero and sections render", async ({ page }) => {
    await expect(page.locator("section >> .reveal:has-text('Open for new projects')").first()).toBeVisible();

    const h1 = await page.locator("h1").boundingBox();
    expect(h1).not.toBeNull();
    expect(h1!.x).toBeGreaterThanOrEqual(0);
    expect(h1!.x + h1!.width).toBeLessThanOrEqual(376);

    await expect(page.locator("#about >> text=Live client websites")).toBeVisible();
    await expect(page.locator("#about >> text=Cities served")).toBeVisible();
    await expect(page.locator("#contact >> text=zakiakdas703@gmail.com")).toBeVisible();
    await expect(page.locator("#contact >> text=Indore, India")).toBeVisible();
    await expect(page.locator("#contact >> text=GitHub")).toBeVisible();
    await expect(page.locator("section[aria-hidden]")).toBeVisible();
    await expect(page.locator("button[aria-label='Back to top']")).toBeAttached();
  });

  test("contact form is full-width and footer stacks", async ({ page }) => {
    for (const selector of [
      "input[name='name']",
      "input[name='email']",
      "textarea[name='message']",
      "#contact form button[type='submit']",
    ]) {
      const box = await page.locator(selector).boundingBox();
      expect(box, selector).not.toBeNull();
      expect(box!.width, `${selector} should span most of the viewport`).toBeGreaterThan(250);
    }

    // Footer columns stack: the second block sits below the first, not beside it.
    const footer = page.locator("footer .flex.max-w-6xl").first();
    const columns = await footer.evaluate((el) =>
      Array.from(el.children).map((c) => c.getBoundingClientRect().y)
    );
    expect(columns.length).toBeGreaterThan(1);
    expect(columns[1], "footer columns should stack at 375px").toBeGreaterThan(columns[0] + 10);
  });
});

// ─── Hamburger menu ────────────────────────────────────────────────────────

test.describe("Mobile — Hamburger menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await waitForPreloader(page);
  });

  const MENU_LINKS = ["About", "Skills", "Work", "Services", "Blog", "Contact"];

  test("opens with close control, all links, and availability", async ({ page }) => {
    const menu = await openMenu(page);
    // The header toggle flips to "Close menu" and stacks above the overlay
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Close menu" })).toBeVisible();
    for (const label of MENU_LINKS) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(menu.getByText("Open for new projects")).toBeVisible();
  });

  test("menu links are large touch targets", async ({ page }) => {
    const menu = await openMenu(page);
    await page.waitForTimeout(400); // entrance transition
    await assertMinTouchTarget(menu.getByRole("link", { name: "About", exact: true }), 30);
  });

  test("clicking a link closes the menu", async ({ page }) => {
    const menu = await openMenu(page);
    await page.waitForTimeout(300);
    await menu.getByRole("link", { name: "About", exact: true }).click();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("body scroll locks while open and restores on close", async ({ page }) => {
    await openMenu(page);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Close menu" }).click();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });
});

// ─── Projects page ─────────────────────────────────────────────────────────

test.describe("Mobile — Projects page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test("index shows the first project card", async ({ page }) => {
    await page.goto("/projects");
    await waitForPreloader(page);
    await expect(page.locator("text=Nikky Bawa Ladies Salon")).toBeVisible();
  });

  test("detail renders all details", async ({ page }) => {
    await page.goto("/projects/nikky-bawa-salon");
    await waitForPreloader(page);
    await expect(page.locator("h1")).toContainText("Nikky Bawa");
    await expect(page.locator("text=Next.js")).toBeVisible();
    await expect(page.locator("text=Visit live site")).toBeVisible();
    await expect(page.locator("text=Back to all projects")).toBeVisible();
  });
});

// ─── Blog ──────────────────────────────────────────────────────────────────

test.describe("Mobile — Blog", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  test("index shows post cards", async ({ page }) => {
    await page.goto("/blog");
    await waitForPreloader(page);
    await expect(page.locator("text=Making WebGL fly on mid-range Android phones")).toBeVisible();
    await expect(page.locator("text=Case study: how a 3D configurator lifted conversion 34%")).toBeVisible();
  });

  test("detail is readable", async ({ page }) => {
    await page.goto("/blog/webgl-performance-mid-range-android");
    await waitForPreloader(page);

    const h1 = await page.locator("h1").boundingBox();
    expect(h1).not.toBeNull();
    expect(h1!.x).toBeGreaterThanOrEqual(-1);
    expect(h1!.x + h1!.width).toBeLessThanOrEqual(376);
    await expect(page.locator("article").first()).toBeVisible();
  });
});

// ─── 404 page ──────────────────────────────────────────────────────────────

test("404 renders on mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/non-existent-page");
  await waitForPreloader(page);
  await expect(page.locator("text=Lost in space")).toBeVisible();
  await expect(page.locator("text=Return to Earth")).toBeVisible();
});

// ─── Responsive consistency ────────────────────────────────────────────────

test.describe("Mobile — Responsive consistency", () => {
  test("homepage adapts when resizing from desktop to mobile", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await waitForPreloader(page);

    await expect(page.locator("nav ul >> text=About")).toBeVisible();

    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(300);

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("contact form layout changes from two-column to stacked", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await waitForPreloader(page);

    const nameInput = page.locator("input[name='name']");
    const emailInput = page.locator("input[name='email']");
    const nameBox = await nameInput.boundingBox();
    const emailBox = await emailInput.boundingBox();
    expect(nameBox).not.toBeNull();
    expect(emailBox).not.toBeNull();
    // Desktop: email sits to the right of name.
    expect(emailBox!.x).toBeGreaterThan(nameBox!.x + nameBox!.width - 10);

    await page.setViewportSize(MOBILE);
    await page.waitForTimeout(300);
    const nameBoxM = await nameInput.boundingBox();
    const emailBoxM = await emailInput.boundingBox();
    expect(nameBoxM).not.toBeNull();
    expect(emailBoxM).not.toBeNull();
    // Mobile: email falls below name.
    expect(emailBoxM!.y).toBeGreaterThan(nameBoxM!.y + nameBoxM!.height - 10);
  });
});
