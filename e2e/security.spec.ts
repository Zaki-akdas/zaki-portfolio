import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * Contract for the hardening added by the audit:
 *  - rate limiting on the two write endpoints (budget, boundary, burst),
 *  - SVG uploads: active content stripped, hardened serving headers.
 * Each case uses its own X-Forwarded-For key so budgets are independent;
 * all writes land in the isolated .e2e-data dir (see playwright.config.ts).
 */

const VALID_MSG = {
  name: "Contract Bot",
  email: "contract@e2e.test",
  subject: "contract",
  message: "rate limit contract case",
};

let seq = 0;
const freshKey = () => `contract-${Date.now().toString(36)}-${seq++}`;

const postContact = (request: APIRequestContext, key: string, data: unknown) =>
  request.post("/api/contact", { headers: { "X-Forwarded-For": key }, data });

const tally = (statuses: number[]) =>
  statuses.reduce<Record<number, number>>((t, s) => ({ ...t, [s]: (t[s] || 0) + 1 }), {});

test.describe("Contact rate limit", () => {
  test("accepts exactly 10 valid submissions per window, then 429", async ({ request }) => {
    const key = freshKey();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) statuses.push((await postContact(request, key, VALID_MSG)).status());
    expect(statuses).toEqual([...Array(10).fill(200), 429]);
  });

  test("invalid and malformed payloads never consume budget", async ({ request }) => {
    const key = freshKey();
    expect((await postContact(request, key, {})).status()).toBe(400);
    expect((await postContact(request, key, { name: "x", email: "not-an-email", message: "y" })).status()).toBe(400);
    expect(
      (await request.post("/api/contact", {
        headers: { "X-Forwarded-For": key, "Content-Type": "application/json" },
        data: "not-json{",
      })).status()
    ).toBe(400);

    // Budget untouched: all 10 valid slots must still be available.
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) statuses.push((await postContact(request, key, VALID_MSG)).status());
    expect(statuses).toEqual(Array(10).fill(200));
  });

  test("a parallel burst cannot exceed the cap", async ({ request }) => {
    const key = freshKey();
    const results = await Promise.all(
      Array.from({ length: 12 }, () => postContact(request, key, VALID_MSG))
    );
    expect(tally(results.map((r) => r.status()))).toEqual({ 200: 10, 429: 2 });
  });
});

test.describe("Login rate limit", () => {
  test("allows exactly 10 attempts per window, then 429", async ({ request }) => {
    const key = freshKey();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await request.post("/api/admin/login", {
        headers: { "X-Forwarded-For": key },
        data: { password: `wrong-${i}` },
      });
      statuses.push(res.status());
    }
    expect(statuses).toEqual([...Array(10).fill(401), 429]);
  });
});

test.describe("SVG upload hardening", () => {
  // Fixture table: what goes in, what must not come out.
  const SVG_FIXTURES: { name: string; src: string; unchanged?: boolean; stripped?: string[] }[] = [
    {
      name: "benign.svg",
      src: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40">\n  <style>.a{fill:#0af}</style>\n  <rect class="a" width="80" height="40"/>\n</svg>\n`,
      unchanged: true,
    },
    {
      name: "evil.svg",
      src: `<svg xmlns="http://www.w3.org/2000/svg" onload="window.__pwned=1"><script>alert(1)</script><a href="javascript:alert(2)"><rect width="5" height="5"/></a></svg>`,
      stripped: ["<script", "onload=", "javascript:"],
    },
    {
      name: "unclosed.svg",
      src: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><script>alert(3)`,
      stripped: ["<script"],
    },
  ];

  const PNG_1PX = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  // Media lives in Supabase Storage (needs SUPABASE_URL/SECRET_KEY env).
  // Without env the media API fails loud with 503 — nothing to exercise.
  const MEDIA_ENABLED = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

  test("uploads are scrubbed; SVG serves sandboxed and PNG does not", async ({ request }) => {
    test.skip(!MEDIA_ENABLED, "Supabase Storage not configured in this environment");
    const login = await request.post("/api/admin/login", {
      data: { password: process.env.ADMIN_PASSWORD },
    });
    expect(login.ok()).toBeTruthy();

    for (const f of SVG_FIXTURES) {
      const up = await request.post("/api/admin/media", {
        multipart: { file: { name: f.name, mimeType: "image/svg+xml", buffer: Buffer.from(f.src) } },
      });
      expect(up.ok(), `upload of ${f.name}`).toBeTruthy();
      const { url } = await up.json();

      const res = await request.get(url);
      expect(res.status(), `serving ${f.name}`).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/svg+xml");
      expect(res.headers()["content-security-policy"], `CSP on ${f.name}`).toContain("sandbox");
      expect(res.headers()["x-content-type-Options".toLowerCase()]).toBe("nosniff");

      const stored = await res.text();
      if (f.unchanged) expect(stored).toBe(f.src);
      for (const token of f.stripped || []) {
        expect(stored.toLowerCase(), `${f.name} must not contain ${token}`).not.toContain(token.toLowerCase());
      }

      const del = await request.delete(`/api/admin/media?name=${encodeURIComponent(url.split("/").pop()!)}`);
      expect((await del.json()).ok).toBeTruthy();
    }

    // Non-SVG uploads: no sandbox CSP (Supabase guards only SVGs on its CDN;
    // browsers don't execute scripts in PNGs regardless).
    const up = await request.post("/api/admin/media", {
      multipart: { file: { name: "pixel.png", mimeType: "image/png", buffer: PNG_1PX } },
    });
    expect(up.ok()).toBeTruthy();
    const { url } = await up.json();
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    expect(res.headers()["content-security-policy"]).toBeUndefined();
    await request.delete(`/api/admin/media?name=${encodeURIComponent(url.split("/").pop()!)}`);
  });
});
