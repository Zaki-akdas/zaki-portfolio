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
