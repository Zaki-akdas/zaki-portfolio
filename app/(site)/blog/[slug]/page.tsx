import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/store";
import { mdToHtml } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getContent();
  const post = (c.posts || []).find((p) => p.slug === params.slug && p.published);
  if (!post) return { title: "Post not found" };
  return {
    title: post.metaTitle || `${post.title} — ${c.profile?.name}`,
    description: post.metaDescription || post.excerpt,
    openGraph: { title: post.metaTitle || post.title, description: post.metaDescription || post.excerpt },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const c = getContent();
  const post = (c.posts || []).find((p) => p.slug === params.slug && p.published);
  if (!post) notFound();

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <Link href="/blog" data-cursor
        className="inline-flex min-h-[44px] items-center gap-2 text-sm text-slate-400 transition hover:text-white">
        <span aria-hidden>←</span> All posts
      </Link>

      <p className="mt-8 text-xs text-slate-500">
        {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {" · "}by {c.profile?.name}
      </p>
      <h1 className="h-section mt-3 font-display font-bold text-white">{post.title}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{t}</span>
        ))}
      </div>

      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className="mt-10 w-full rounded-2xl border border-white/10 object-cover" />
      )}

      <article className="prose-md mt-10" dangerouslySetInnerHTML={{ __html: mdToHtml(post.content) }} />

      <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:p-8">
        <p className="font-display text-lg font-semibold text-white">Enjoyed this? Let&apos;s build something together.</p>
        <Link href="/#contact" data-cursor
          className="magnetic mt-4 inline-flex min-h-[44px] items-center rounded-full bg-accent px-7 py-3 text-sm font-semibold text-ink transition hover:brightness-110">
          Start a project
        </Link>
      </div>
    </main>
  );
}
