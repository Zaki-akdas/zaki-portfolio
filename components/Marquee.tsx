const ROW1 = ["Next.js", "React", "Three.js", "TypeScript", "Tailwind CSS", "Node.js", "WebGL", "Vercel", "SEO"];
const ROW2 = ["Bhopal", "Dubai", "Abu Dhabi", "London", "Toronto", "Brampton", "26 live sites", "Open for projects"];

function Row({ items, reverse, speed }: { items: string[]; reverse?: boolean; speed: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee-track items-center gap-10 ${reverse ? "reverse" : ""}`} style={{ ["--speed" as never]: speed }}>
      {doubled.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center gap-10 font-display text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          {item}
          <span className="text-accent" aria-hidden>✦</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section aria-hidden className="relative space-y-5 overflow-hidden border-y border-white/5 bg-white/[0.02] py-7">
      <Row items={ROW1} speed="38s" />
      <Row items={ROW2} reverse speed="46s" />
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </section>
  );
}
