import type { Settings } from "./store";

const PLACEHOLDER = "https://example.com";

/**
 * Resolve the canonical site URL, trailing slash stripped.
 * Priority: admin-set `settings.siteUrl` → `NEXT_PUBLIC_SITE_URL` env →
 * placeholder. Centralized so metadataBase, sitemap.xml and robots.txt never
 * disagree, and a fresh deploy that only sets the env (no admin edit yet)
 * still emits real URLs instead of example.com.
 */
export function resolveSiteUrl(settings?: Pick<Settings, "siteUrl"> | null): string {
  const raw = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || PLACEHOLDER;
  return raw.replace(/\/$/, "");
}

/** True when we could not resolve a real URL (still on the placeholder). */
export function isPlaceholderSiteUrl(settings?: Pick<Settings, "siteUrl"> | null): boolean {
  return resolveSiteUrl(settings) === PLACEHOLDER;
}
