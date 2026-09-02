import type { Service, ProcessStep } from "@/lib/store";

export default function Services({ services, process }: { services: Service[]; process: ProcessStep[] }) {
  return (
    <section id="services" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <p className="reveal text-sm font-medium uppercase tracking-[0.25em] text-accent">04 · Services</p>
      <h2 className="reveal section-title h-section mt-3 max-w-2xl font-display font-bold text-white" style={{ ["--d" as never]: "80ms" }}>
        How I can help you launch
      </h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {services.map((s, i) => (
          <div key={s.id} className="tilt reveal rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
            style={{ ["--d" as never]: `${(i % 2) * 100}ms` }} data-cursor>
            <div className="tilt-inner">
              <span className="font-display text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-400">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* process */}
      <h3 className="reveal mt-20 font-display text-xl font-semibold text-white">The flight plan</h3>
      <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {process.map((p, i) => (
          <li key={p.step} className="reveal relative rounded-2xl border border-white/10 bg-panel p-5"
            style={{ ["--d" as never]: `${i * 100}ms` }}>
            <span className="font-display text-3xl font-bold" style={{ color: "color-mix(in srgb, var(--accent) 55%, transparent)" }}>
              {p.step}
            </span>
            <h4 className="mt-2 font-display font-semibold text-white">{p.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
