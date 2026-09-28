/**
 * JSON-LD structured data (schema.org) builders. Server-only: they read the
 * content object and emit plain objects that <JsonLd> serializes into a
 * <script type="application/ld+json"> tag. Gives search engines an explicit
 * Person/WebSite/BlogPosting/CreativeWork graph for the portfolio.
 */
import type { Content, Post, Project } from "./store";
import { resolveSiteUrl } from "./siteUrl";

/** Make a possibly-relative image/URL absolute against the site base. */
function abs(url: string | undefined, base: string): string | undefined {
  if (!url) return undefined;
  return /^https?:\/\//.test(url) ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function person(c: Content) {
  const p = c.profile;
  return {
    "@type": "Person",
    name: p?.name,
    ...(p?.role ? { jobTitle: p.role } : {}),
    ...(p?.email ? { email: `mailto:${p.email}` } : {}),
    ...(p?.location
      ? { address: { "@type": "PostalAddress", addressLocality: p.location } }
      : {}),
    ...(p?.socials?.length
      ? { sameAs: p.socials.map((s) => s.url).filter(Boolean) }
      : {}),
  };
}

/** Homepage: a Person + WebSite graph. */
export function personWebSiteJsonLd(c: Content) {
  const base = resolveSiteUrl(c.settings);
  return {
    "@context": "https://schema.org",
    "@graph": [
      person(c),
      {
        "@type": "WebSite",
        name: c.settings?.metaTitle || c.profile?.name,
        url: base,
        ...(c.settings?.metaDescription ? { description: c.settings.metaDescription } : {}),
      },
    ],
  };
}

/** Blog post detail: BlogPosting. */
export function blogPostingJsonLd(c: Content, post: Post) {
  const base = resolveSiteUrl(c.settings);
  const image = abs(post.cover, base);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image } : {}),
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    author: { "@type": "Person", name: c.profile?.name },
    publisher: { "@type": "Person", name: c.profile?.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/blog/${post.slug}` },
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
  };
}

/** Project detail: CreativeWork. */
export function projectJsonLd(c: Content, project: Project) {
  const base = resolveSiteUrl(c.settings);
  const image = abs(project.cover, base);
  const live = project.liveUrl && project.liveUrl !== "#" ? project.liveUrl : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    ...(project.summary ? { description: project.summary } : {}),
    url: live || `${base}/projects/${project.slug}`,
    ...(image ? { image } : {}),
    ...(project.stack?.length ? { keywords: project.stack.join(", ") } : {}),
    ...(project.year ? { dateCreated: project.year } : {}),
    creator: { "@type": "Person", name: c.profile?.name },
  };
}
