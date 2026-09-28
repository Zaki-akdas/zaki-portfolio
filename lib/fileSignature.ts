/**
 * Magic-byte (file signature) validation for media uploads.
 *
 * The upload route already checks the extension, but an extension is just a
 * string in the filename — it says nothing about the bytes. A file whose
 * content doesn't match its declared type (a mislabel, or a polyglot planted
 * through a hijacked admin session) shouldn't land in the public bucket. This
 * is defense-in-depth: cheap, and it rejects the mismatch before storage.
 *
 * SVG is intentionally excluded — it's XML text with no fixed magic bytes, and
 * it's already neutralized by scrubSvg() at write time.
 */

/** True when `buf` starts with the given byte sequence at `offset`. */
function hasPrefix(buf: Buffer, bytes: number[], offset = 0): boolean {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

/** ASCII string → byte array, for readability at the call sites. */
function ascii(s: string): number[] {
  return Array.from(s, (ch) => ch.charCodeAt(0));
}

/**
 * Whether the buffer's leading bytes are consistent with `ext`. Returns true
 * for extensions we can't fingerprint (svg) so they fall through unchanged.
 */
export function matchesSignature(ext: string, buf: Buffer): boolean {
  switch (ext) {
    case "png":
      return hasPrefix(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "jpg":
    case "jpeg":
      return hasPrefix(buf, [0xff, 0xd8, 0xff]);
    case "gif":
      return hasPrefix(buf, ascii("GIF87a")) || hasPrefix(buf, ascii("GIF89a"));
    case "webp":
      // RIFF....WEBP
      return hasPrefix(buf, ascii("RIFF")) && hasPrefix(buf, ascii("WEBP"), 8);
    case "avif":
    case "mp4":
      // ISO base media: ....ftyp, brand follows
      return hasPrefix(buf, ascii("ftyp"), 4);
    case "pdf":
      return hasPrefix(buf, ascii("%PDF"));
    case "glb":
      // glTF binary container: magic "glTF", version 2
      return hasPrefix(buf, ascii("glTF")) && buf.length >= 8 && buf.readUInt32LE(4) === 2;
    case "webm":
      // EBML header (Matroska/WebM)
      return hasPrefix(buf, [0x1a, 0x45, 0xdf, 0xa3]);
    case "svg":
      return true; // text format, no magic bytes; scrubSvg handles safety
    default:
      return false;
  }
}
