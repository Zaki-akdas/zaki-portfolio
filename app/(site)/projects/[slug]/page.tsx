import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/store";
import LiveSite from "@/components/LiveSite";

export const dynamic = "force-dynamic";

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const c = getContent();
  const project = (c.projects || []).find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8">
      <Link
        href="/#projects"
        className="inline-flex min-h-[44px] items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        data-cursor
      >
        <span aria-hidden>←</span> Back to all projects
      </Link>

      <p className="mt-8 text-sm font-medium uppercase tracking-[0.25em] text-accent">
        {project.category} · {project.year}
      </p>
      <h1 className="h-section mt-3 font-display font-bold text-white">{project.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">{project.summary}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        {project.liveUrl && project.liveUrl !== "#" && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor
            className="magnetic inline-flex min-h-[44px] items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110">
            Visit live site ↗
          </a>
        )}
        {project.repoUrl && project.repoUrl !== "#" && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" data-cursor
            className="magnetic inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            View code
          </a>
        )}
      </div>

      {project.liveUrl && project.liveUrl !== "#" ? (
        <LiveSite
          url={project.liveUrl}
          cover={project.cover}
          title={project.title}
          embeddable={project.embed !== false}
        />
      ) : project.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.cover} alt={`${project.title} cover`}
          className="mt-12 max-h-96 w-full rounded-2xl border border-white/10 object-cover" />
      ) : (
        <div
          className="mt-12 h-56 rounded-2xl border border-white/10 sm:h-80"
          style={{
            background:
              "radial-gradient(ellipse 80% 90% at 30% 20%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 70%), radial-gradient(ellipse 70% 80% at 80% 80%, rgba(76,201,240,.25), transparent 70%), #0b0d1a",
          }}
          role="img"
          aria-label={`${project.title} cover artwork`}
        />
      )}

      <div className="prose-invert mt-12 space-y-5 text-base leading-relaxed text-slate-300">
        {project.description.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </main>
  );
}
