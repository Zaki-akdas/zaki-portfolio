// Thumbnail variant of a stored image via Supabase Storage's built-in image
// transformations (`/render/image/...`). Same bucket, same CDN, and the
// rendered variant carries the same 1-year immutable cache-control as the
// original object, so grid thumbnails never re-fetch. Accepts either the
// full CDN URL or the historical `/uploads/<name>` path; returns null for
// anything that can't/shouldn't be transformed (non-raster files, external
// hosts, or when Storage isn't configured) so callers fall back to the
// original URL unchanged.
//
// Server-side only: `process.env.SUPABASE_URL` is not available in client
// bundles, so client components must receive pre-rewritten URLs as props.

const SB_URL = process.env.SUPABASE_URL;
const TRANSFORMABLE = /\.(jpe?g|png|webp)(\?|$)/i;

export function thumbUrl(url: string | null | undefined, width: number, height?: number): string | null {
  if (!url || !SB_URL || !TRANSFORMABLE.test(url)) return null;
  let name: string | null = null;
  if (url.startsWith("/uploads/")) {
    name = decodeURIComponent(url.slice("/uploads/".length));
  } else {
    const m = url.match(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/media\/(.+)$/i);
    if (m) name = decodeURIComponent(m[1]);
  }
  // Only flat bucket names — never transform path-y input.
  if (!name || name.includes("/") || name.includes("..")) return null;
  const params = new URLSearchParams({ width: String(width), format: "webp", quality: "70" });
  if (height) params.set("height", String(height));
  return `${SB_URL}/storage/v1/render/image/public/media/${encodeURIComponent(name)}?${params}`;
}

/** thumbUrl with fallback to the original URL, for direct `src` use. */
export function thumbOrOriginal(url: string | null | undefined, width: number, height?: number): string {
  return (SB_URL && thumbUrl(url, width, height)) || url || "";
}

// ---- srcset helpers -------------------------------------------------------

// Render-variant widths offered to browsers via `srcset`. Covers ~1x/2x DPR
// at every card layout width (phones render cards at ~360 CSS px, desktops
// at ~400-640 CSS px).
const SRCSET_WIDTHS = [240, 360, 480, 640, 960];

/**
 * Server-side srcset builder: one transform URL per candidate width.
 * Returns "" when the cover isn't transformable (caller keeps plain `src`).
 * URLs embed the ORIGINAL source URL, so a client component can safely
 * re-derive smaller variants later via `rewidthThumb` (see below).
 */
export function thumbSrcset(url: string | null | undefined, height?: number): string {
  const parts: string[] = [];
  for (const w of SRCSET_WIDTHS) {
    const u = thumbUrl(url, w, height);
    if (u) parts.push(`${u} ${w}w`);
  }
  return parts.join(", ");
}

/**
 * Client-safe: derive a new transform URL from an ALREADY-TRANSFORMED url.
 * Matches the render endpoint and swaps the width query param; returns the
 * input untouched for originals/external URLs. Lets a client component (home
 * grid) pick per-DPR variants without ever touching server env vars.
 */
export function rewidthThumb(renderedUrl: string, width: number): string {
  if (!renderedUrl.includes("/storage/v1/render/image/")) return renderedUrl;
  try {
    const u = new URL(renderedUrl);
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return renderedUrl;
  }
}
