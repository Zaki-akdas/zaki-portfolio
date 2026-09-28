import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Fresh test data per run: no leftover rate-limit windows, no messages
 * carried between runs. store.ts re-seeds content from data/ on first read,
 * so the site under test renders identically every time. (auth.json is
 * deliberately not seeded — lib/auth.ts regenerates it from ADMIN_PASSWORD,
 * which playwright.config sets to a known value.)
 *
 * Also emits a storageState that seeds `preloader-seen` for the app origin.
 * The preloader reads this flag pre-paint and skips its ~10s overlay, so pages
 * are interactive immediately on first navigation. Seeding here (rather than
 * via page.addInitScript inside a test) guarantees the flag exists *before*
 * the first goto — the old helper ran addInitScript after navigation, so the
 * overlay mounted anyway and specs raced the 30s timeout under parallel load.
 */
export default async function globalSetup() {
  await rm(path.resolve(process.cwd(), ".e2e-data"), { recursive: true, force: true });

  const port = Number(process.env.PORT) || 3456;
  const origin = `http://localhost:${port}`;
  const storageState = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [{ name: "preloader-seen", value: String(Date.now()) }],
      },
    ],
  };
  await writeFile(
    path.resolve(process.cwd(), ".e2e-storage.json"),
    JSON.stringify(storageState, null, 2),
  );
}
