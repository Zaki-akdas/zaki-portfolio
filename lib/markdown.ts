/**
 * Tiny, dependency-free markdown → HTML renderer.
 * All input is HTML-escaped FIRST, so rendered output is XSS-safe.
 * Supports: headings, bold, italic, inline code, fenced code blocks,
 * links, ul/ol lists, blockquotes, hr, paragraphs.
 */
export function mdToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let src = md.replace(/\r\n/g, "\n");

  // pull fenced code blocks out before escaping/inline processing
  const blocks: string[] = [];
  src = src.replace(/```\w*\n([\s\S]*?)```/g, (_m, code: string) => {
    blocks.push(`<pre><code>${esc(code.trimEnd())}</code></pre>`);
    return `\u0000B${blocks.length - 1}\u0000`;
  });

  src = esc(src);

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  const lines = src.split("\n");
  const out: string[] = [];
  let inUl = false, inOl = false;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; }
  };
  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushPara(); closeLists(); continue; }

    const bm = line.match(/^\u0000B(\d+)\u0000$/);
    if (bm) { flushPara(); closeLists(); out.push(blocks[Number(bm[1])]); continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara(); closeLists();
      const lvl = h[1].length + 1; // page already has an h1
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flushPara();
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }
    if (/^&gt;\s?/.test(line)) {
      flushPara(); closeLists();
      out.push(`<blockquote>${inline(line.replace(/^&gt;\s?/, ""))}</blockquote>`);
      continue;
    }
    if (/^---+$/.test(line)) { flushPara(); closeLists(); out.push("<hr/>"); continue; }
    para.push(line);
  }
  flushPara(); closeLists();
  return out.join("\n");
}
