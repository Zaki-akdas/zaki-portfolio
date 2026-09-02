import Link from "next/link";
import type { Profile, Settings } from "@/lib/store";

export default function Hero({ profile, settings }: { profile: Profile; settings: Settings }) {
  const words = (profile.headline || "Crafting stellar digital experiences").split(" ");
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center sm:px-8">
      {/* ambient gradient orbs */}
      <div className="orb h-72 w-72 sm:h-96 sm:w-96" style={{ top: "12%", left: "-8%", background: "var(--accent)" }} aria-hidden />
      <div className="orb h-64 w-64 sm:h-80 sm:w-80" style={{ bottom: "10%", right: "-6%", background: "#4cc9f0", animationDelay: "-8s" }} aria-hidden />
      <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 sm:text-sm">
        <span className={`h-2 w-2 rounded-full ${settings.availability === "open" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
        {settings.availabilityText || "Open for new projects"}
      </span>

      <h1 className="words-container h-hero mt-6 max-w-5xl font-display font-bold text-white">
        {words.map((w, i) => (
          <span key={i} className="word-mask mr-[0.28em] last:mr-0">
            <span className="word text-shimmer" style={{ ["--d" as never]: `${i * 90 + 150}ms` }}>
              {w}
            </span>
          </span>
        ))}
      </h1>

      <p className="reveal mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg" style={{ ["--d" as never]: "500ms" }}>
        {profile.tagline}
      </p>

      <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4" style={{ ["--d" as never]: "650ms" }}>
        <Link href="/#projects" data-cursor
          className="magnetic inline-flex min-h-[48px] items-center rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-ink transition hover:brightness-110">
          Explore my universe
        </Link>
        <Link href="/#contact" data-cursor
          className="magnetic inline-flex min-h-[48px] items-center rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
          Start a project
        </Link>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
