import { getContent } from "@/lib/store";
import Background from "@/components/Background";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Interactions from "@/components/Interactions";
import Nav from "@/components/Nav";
import SoundToggle from "@/components/SoundToggle";
import BackToTop from "@/components/BackToTop";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = getContent();
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
