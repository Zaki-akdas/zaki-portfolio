import type { Metadata } from "next";
import { getContentAsync } from "@/lib/store";
import { resolveSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContentAsync();
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(resolveSiteUrl(c.settings));
  } catch { metadataBase = undefined; }
  return {
    metadataBase,
    title: c.settings?.metaTitle || "Freelance Web Developer",
    description: c.settings?.metaDescription || "Portfolio",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getContentAsync();
  const accent = c.settings?.accent || "#8b7cff";
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The hero headline is the LCP element and renders in Space Grotesk
            700 — loading the font stylesheet early removes a full font-download
            round trip from the LCP path (measured ~1s on a fast connection). */}
        {/* Root-layout <head> fonts apply to every page in the App Router, so
            the Pages-Router no-page-custom-font heuristic is a false positive
            here; kept manual (not next/font) to preserve the preload LCP path. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ ["--accent" as never]: accent }}>{children}</body>
    </html>
  );
}
