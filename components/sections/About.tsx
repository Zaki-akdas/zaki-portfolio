import type { Profile } from "@/lib/store";

export default function About({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <p className="reveal text-sm font-medium uppercase tracking-[0.25em] text-accent">01 · About</p>
      <h2 className="reveal section-title h-section mt-3 max-w-2xl font-display font-bold text-white" style={{ ["--d" as never]: "80ms" }}>
        The developer behind the mission
      </h2>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr,1fr]">
        <div>
          <p className="reveal text-lg leading-relaxed text-slate-300">{profile.about}</p>
          <p className="reveal mt-5 leading-relaxed text-slate-400" style={{ ["--d" as never]: "120ms" }}>
            {profile.aboutMore}
          </p>

          <div className="reveal mt-10 grid grid-cols-3 gap-4" style={{ ["--d" as never]: "200ms" }}>
            {profile.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:p-6">
                <p className="font-display text-3xl font-bold text-white sm:text-4xl">
                  <span data-count={s.value}>0</span>
                  {s.value >= 10 && <span className="text-accent">+</span>}
                </p>
                <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          <a href={profile.resumeUrl || "#"} data-cursor
            className="reveal magnetic mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            style={{ ["--d" as never]: "280ms" }}>
            Download résumé <span aria-hidden>↓</span>
          </a>
        </div>

        {/* journey timeline */}
        <ol className="relative border-l border-white/10 pl-6">
          {profile.timeline.map((t, i) => (
            <li key={t.year} className="reveal relative pb-10 last:pb-0" style={{ ["--d" as never]: `${i * 120}ms` }}>
              <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
              <p className="font-display text-sm font-semibold text-accent">{t.year}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-white">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
