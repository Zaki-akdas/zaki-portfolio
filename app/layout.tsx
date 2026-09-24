import type { Metadata } from "next";
import { getContentAsync } from "@/lib/store";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContentAsync();
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(c.settings?.siteUrl || "https://example.com");
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ ["--accent" as never]: accent }}>{children}</body>
    </html>
  );
}
