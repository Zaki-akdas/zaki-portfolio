import { ImageResponse } from "next/og";
import { getContentAsync } from "@/lib/store";

export const runtime = "nodejs";
// Served from a route handler (not the opengraph-image file convention) so Next
// never prerenders it at build time. The file convention is statically generated
// even under force-dynamic, and @vercel/og's node bundle crashes resolving its
// bundled font via import.meta.url during that build-time render on Windows.
// Referenced from (site)/layout.tsx openGraph metadata instead.
export const dynamic = "force-dynamic";

// Site-wide default OG card for the (site) group — the homepage plus any route
// without its own opengraph-image (e.g. /projects, /blog index). Blog posts and
// project pages override this with their own images.
export async function GET() {
  const c = await getContentAsync();
  const accent = c.settings?.accent || "#8b7cff";
  const name = c.profile?.name || "Portfolio";
  const role = c.profile?.role || "";
  const headline = c.profile?.headline || c.settings?.metaTitle || "";
  const initials = name
    .split(" ")
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <div style={{ position: "absolute", top: 80, left: 80, display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 52,
              background: `linear-gradient(135deg, ${accent}, #4cc9f0)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#05060d",
            }}
          >
            {initials}
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", display: "flex" }}>{name}</div>
        </div>

        {role && (
          <div style={{ fontSize: 26, color: accent, marginBottom: 16, display: "flex" }}>{role}</div>
        )}
        <div
          style={{
            fontSize: headline.length > 70 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 1000,
            display: "flex",
          }}
        >
          {headline}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
