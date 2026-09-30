import type { MetadataRoute } from "next";
import { getContentAsync } from "@/lib/store";
import { resolveSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export default async function robots() {
  const c = await getContentAsync();
  const base = resolveSiteUrl(c.settings);
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
