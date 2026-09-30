import { getContentAsync } from "@/lib/store";
import type { Metadata } from "next";
import Background from "@/components/Background";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Interactions from "@/components/Interactions";
import Nav from "@/components/Nav";
import SoundToggle from "@/components/SoundToggle";
import BackToTop from "@/components/BackToTop";

export const dynamic = "force-dynamic";

// Default social card for every (site) route. Served by the /og route handler
// rather than an opengraph-image file so it isn't prerendered at build time.
// Blog posts and project pages ship their own opengraph-image, which overrides.
export async function generateMetadata(): Promise<Metadata> {
  return {
    openGraph: {
      images: [{ url: "/og", width: 1200, height: 630, alt: "Portfolio" }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og"],
    },
  };
}


export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await getContentAsync();
  return (
    <>
      {c.settings?.preloader && <Preloader name={c.profile?.name || "Portfolio"} />}
      <Background effects3d={c.settings?.effects3d !== false} />
      <Cursor />
      <Interactions />
      <SoundToggle />
      <BackToTop />
      <div id="scroll-progress" aria-hidden />
      <Nav
        name={c.profile?.name || "Portfolio"}
        availability={c.settings?.availability || "open"}
        availabilityText={c.settings?.availabilityText || ""}
      />
      {children}
    </>
  );
}
