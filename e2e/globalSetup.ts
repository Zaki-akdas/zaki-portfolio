import { rm } from "node:fs/promises";
import path from "node:path";

/** Fresh test data per run: no leftover rate-limit windows, no messages
 *  carried between runs. store.ts re-seeds content/auth from data/ on first
 *  read, so the site under test renders identically every time. */
export default async function globalSetup() {
  await rm(path.resolve(process.cwd(), ".e2e-data"), { recursive: true, force: true });
}
