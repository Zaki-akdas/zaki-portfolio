import Link from "next/link";
import type { Metadata } from "next";
import { getContent } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = getContent();
  return {
    title: `Blog — ${c.profile?.name || "Portfolio"}`,
    description: "Notes on web development, WebGL performance, and case studies from real client projects.",
  };
}

export default function BlogPage() {
  const c = getContent();
  const posts = (c.posts || [])
    .filter((p) => p.published)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-32 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">Transmissions</p>
      <h1 className="h-section mt-3 font-display font-bold text-white">Blog &amp; case studies</h1>
      <p className="mt-4 max-w-xl text-slate-400">
        Field notes from the frontier — performance engineering, 3D on the web, and what actually moved the needle for clients.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {posts.map((post, i) => (
          <Link key={post.id} href={`/blog/${post.slug}`} data-cursor
            className="tilt group overflow-hidden rounded-2xl border border-white/10 bg-panel transition hover:border-accent/40">
            {post.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.cover} alt="" className="zoom-img h-44 w-full object-cover" />
            ) : (
              <div className="h-44 w-full"
                style={{ background: `radial-gradient(ellipse 90% 100% at ${i % 2 ? 15 : 85}% 0%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 65%), #0b0d1a` }} />
            )}
            <div className="tilt-inner p-6">
              <p className="text-xs text-slate-500">
                {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-white group-hover:text-accent">{post.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="mt-12 text-slate-500">No transmissions yet — check back soon.</p>}
    </main>
  );
}
