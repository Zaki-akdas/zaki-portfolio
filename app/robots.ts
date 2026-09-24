import type { MetadataRoute } from "next";
import { getContentAsync } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function robots() {
  const c = await getContentAsync();
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
