import { ImageResponse } from "next/og";
import { getContent } from "@/lib/store";

export const runtime = "nodejs";
export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PostOgImage({ params }: { params: { slug: string } }) {
  const c = getContent();
  const post = (c.posts || []).find((p) => p.slug === params.slug);
  const accent = c.settings?.accent || "#8b7cff";
  const title = post?.title || "Blog";
  const tags = (post?.tags || []).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px",
          background: "#05060d",
          backgroundImage:
            `radial-gradient(ellipse 70% 60% at 90% 0%, ${accent}55, transparent 65%),` +
            "radial-gradient(ellipse 50% 40% at 5% 100%, #4cc9f033, transparent 60%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: 80, left: 80, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 40, background: `linear-gradient(135deg, ${accent}, #4cc9f0)`, display: "flex" }} />
          <div style={{ fontSize: 28, color: "#94a3b8", display: "flex" }}>{c.profile?.name} · Blog</div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {tags.map((t) => (
            <div key={t} style={{ fontSize: 22, color: "#cfd6ff", border: "1px solid #ffffff33", borderRadius: 30, padding: "8px 22px", display: "flex" }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000, display: "flex" }}>
          {title}
        </div>
      </div>
    ),
    { ...size }
  );
}
