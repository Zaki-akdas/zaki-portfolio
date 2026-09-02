import type { MetadataRoute } from "next";
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const c = getContent();
  const base = (c.settings?.siteUrl || "https://example.com").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
