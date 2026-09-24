// Supabase Storage for the media library — durable uploads that survive
// cold starts, taking priority over the local-disk backend when
// SUPABASE_URL + SUPABASE_SECRET_KEY are present. Without them everything
// here is inert and the file path behaves exactly as before.
//
// Files live in a public `media` bucket; public URLs are served straight
// from Supabase's CDN (`<url>/storage/v1/object/public/media/<name>`).
// SVGs keep the scrub-on-upload treatment; public Storage responses get the
// same sandbox/CSP headers via bucket config on the Supabase side.

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;

export const STORAGE_ENABLED = Boolean(SB_URL && SB_SECRET);

const BUCKET = "media";

export type MediaFile = { name: string; url: string; size: number; mtime: number };

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: SB_SECRET!, Authorization: `Bearer ${SB_SECRET}`, ...extra };
}

function publicUrl(name: string): string {
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${name}`;
}

export async function listMedia(): Promise<MediaFile[]> {
  const res = await fetch(`${SB_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix: "", limit: 500, sortBy: { column: "created_at", order: "desc" } }),
  });
  if (!res.ok) throw new Error(`Storage list failed: ${res.status}`);
  const rows = (await res.json()) as { name: string; id: string | null; metadata?: { size?: number; lastModified?: string } }[];
  return rows
    .filter((r) => r.id !== null) // id null = folder placeholder
    .map((r) => ({
      name: r.name,
      url: publicUrl(r.name),
      size: r.metadata?.size ?? 0,
      mtime: r.metadata?.lastModified ? new Date(r.metadata.lastModified).getTime() : 0,
    }));
}

export async function uploadMedia(name: string, buf: Uint8Array, contentType: string): Promise<MediaFile> {
  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": contentType, "x-upsert": "false" }),
    body: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return { name, url: publicUrl(name), size: buf.byteLength, mtime: Date.now() };
}

export async function deleteMedia(name: string): Promise<boolean> {
  const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  // 200 = deleted; Storage returns 200 with empty body even for missing keys
  // in some versions — treat both as success to keep DELETE idempotent.
  return res.ok;
}
