/**
 * Strip active content from SVG uploads.
 *
 * SVGs are served from our own origin, so a script inside one would run with
 * full site privileges if the file is ever opened directly in a tab. Scripts
 * never execute when an SVG is embedded via <img>, and the serving layer also
 * sends a `Content-Security-Policy: … sandbox` header — this scrubber is the
 * third layer, applied once at write time so it protects every serving path.
 *
 * Legit design-tool SVGs (Figma, Illustrator, Inkscape) contain none of these
 * constructs, so stripping is safe for anything an admin would upload.
 */
export function scrubSvg(input: Buffer): Buffer {
  const after = input
    .toString("utf8")
    // <script>…</script>, including CDATA-wrapped bodies and unclosed
    // <script> (no closer ⇒ the parser reads to EOF, so we drop to EOF too)
    .replace(/<script\b[^>]*>[\s\S]*?(?:<\/script\s*>|$)/gi, "")
    // inline event handlers: onclick=, onload=, onmouseover= …
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // javascript: URLs in href / xlink:href
    .replace(
      /(href|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]*)/gi,
      '$1="#"'
    );
  return Buffer.from(after, "utf8");
}
