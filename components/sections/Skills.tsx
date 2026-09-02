import type { Skill } from "@/lib/store";

export default function Skills({ skills }: { skills: Skill[] }) {
  const categories = Array.from(new Set(skills.map((s) => s.category)));
  return (
    <section id="skills" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <p className="reveal text-sm font-medium uppercase tracking-[0.25em] text-accent">02 · Skills</p>
      <h2 className="reveal section-title h-section mt-3 max-w-2xl font-display font-bold text-white" style={{ ["--d" as never]: "80ms" }}>
        Tools in my orbit
      </h2>

      {/* floating chip cloud */}
      <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--d" as never]: "150ms" }}>
        {skills.map((s, i) => (
          <span key={s.id}
            className="floaty rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
            style={{ ["--d" as never]: `${(i % 6) * 0.7}s` }}>
            {s.name}
          </span>
        ))}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {categories.map((cat, ci) => (
          <div key={cat} className="reveal rounded-2xl border border-white/10 bg-white/5 p-6" style={{ ["--d" as never]: `${ci * 120}ms` }}>
            <h3 className="font-display text-lg font-semibold text-white">{cat}</h3>
            <ul className="mt-5 space-y-5">
              {skills.filter((s) => s.category === cat).map((s, i) => (
                <li key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-slate-500">{s.level}%</span>
                  </div>
                  <div className="bar" style={{ ["--w" as never]: `${s.level}%`, ["--d" as never]: `${i * 100}ms` }}>
                    <span />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
