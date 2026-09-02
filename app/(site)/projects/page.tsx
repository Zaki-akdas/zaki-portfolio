import Link from "next/link";
import type { Metadata } from "next";
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = getContent();
  return {
    title: `Projects — ${c.profile?.name || "Portfolio"}`,
    description: `All ${c.projects?.length || 0} live client websites: boutiques, salons, cafés and stores across India, UAE, UK and Canada.`,
  };
}

const CATEGORY_ORDER = ["Boutique & Fashion", "Salon & Beauty", "Café & Restaurant", "Retail & Décor"];

export default function AllProjectsPage() {
  const c = getContent();
  const projects = (c.projects || []).slice().sort((a, b) => a.order - b.order);
  const categories = [
    ...CATEGORY_ORDER.filter((cat) => projects.some((p) => p.category === cat)),
    ...Array.from(new Set(projects.map((p) => p.category))).filter((cat) => !CATEGORY_ORDER.includes(cat)),
  ];

  return (
    <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <Link href="/#projects" data-cursor
        className="inline-flex min-h-[44px] items-center gap-2 text-sm text-slate-400 transition hover:text-white">
        <span aria-hidden>←</span> Back home
      </Link>

      <p className="mt-8 text-sm font-medium uppercase tracking-[0.25em] text-accent">Full mission log</p>
      <h1 className="h-section mt-3 font-display font-bold text-white">All {projects.length} launches</h1>
      <p className="mt-4 max-w-2xl text-slate-400">
        Live client websites delivered across Bhopal, Dubai, Abu Dhabi, London, Toronto and Brampton — every one designed, built, and shipped end to end.
      </p>

      {categories.map((cat) => (
        <section key={cat} className="mt-14">
          <h2 className="font-display text-xl font-semibold text-white">
            {cat}
            <span className="ml-3 text-sm font-normal text-slate-500">
              {projects.filter((p) => p.category === cat).length} projects
            </span>
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.filter((p) => p.category === cat).map((p) => (
              <div key={p.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel transition hover:border-accent/40">
                {p.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover} alt={`${p.title} website preview`} loading="lazy"
                    className="zoom-img h-40 w-full border-b border-white/10 object-cover object-top" />
                )}
                <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-white">
                    <Link href={`/projects/${p.slug}`} data-cursor className="after:absolute after:inset-0">
                      {p.title}
                    </Link>
                  </h3>
                  {p.featured && <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">★</span>}
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.summary}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{p.year}</span>
                  <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor
                    className="relative z-10 inline-flex min-h-[36px] items-center gap-1 font-semibold text-accent transition hover:brightness-125">
                    Live site ↗
                  </a>
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
