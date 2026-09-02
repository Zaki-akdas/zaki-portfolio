import { getContent } from "@/lib/store";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Marquee from "@/components/Marquee";
import Projects from "@/components/sections/Projects";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  const c = getContent();
  return (
    <main id="top">
      <Hero profile={c.profile} settings={c.settings} />
      <About profile={c.profile} />
      <Skills skills={c.skills || []} />
      <Marquee />
      <Projects projects={(c.projects || []).slice().sort((a, b) => a.order - b.order)} />
      <Services services={c.services || []} process={c.process || []} />
      <Testimonials testimonials={(c.testimonials || []).filter((t) => t.published)} />
      <Contact profile={c.profile} settings={c.settings} />
      <Footer profile={c.profile} />
    </main>
  );
}
