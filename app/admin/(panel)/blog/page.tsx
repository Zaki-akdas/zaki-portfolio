"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, uid } from "@/lib/adminApi";
import { Button, Card, Field, PageHead, inputCls, useSaveState } from "@/components/admin/ui";
import type { Post } from "@/lib/store";

const EMPTY: Post = {
  id: "", slug: "", title: "", excerpt: "", content: "", cover: "",
  tags: [], published: false, date: "", metaTitle: "", metaDescription: "",
};

export default function BlogAdmin() {
  const [items, setItems] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const save = useSaveState();

  useEffect(() => {
    apiGet<Post[]>("posts").then((p) => setItems(p || []));
  }, []);

  async function persist(next: Post[]) {
    setItems(next);
    await save.wrap(() => apiPut("posts", next));
  }

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const item: Post = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      date: editing.date || new Date().toISOString(),
    };
    const exists = items.some((p) => p.id === item.id);
    persist(exists ? items.map((p) => (p.id === item.id ? item : p)) : [{ ...item, id: uid() }, ...items]);
    setEditing(null);
  }

  return (
    <div>
      <PageHead title="Blog / Case studies" sub={`${items.length} posts · markdown supported · ${save.label}`}>
        <Button onClick={() => setEditing({ ...EMPTY })}>+ New post</Button>
      </PageHead>

      {editing && (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">{editing.id ? "Edit post" : "New post"}</h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className={inputCls} required value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <Field label="Slug (URL)">
              <input className={inputCls} placeholder="auto from title" value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Excerpt (shown on cards + default meta description)">
                <textarea className={inputCls} rows={2} required value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Content — markdown: ## heading, **bold**, *italic*, `code`, ``` blocks, - lists, > quotes, [links](url)">
                <textarea className={`${inputCls} font-mono text-xs leading-relaxed`} rows={16} required value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </Field>
            </div>
            <Field label="Cover image URL (upload in Media library first)">
              <input className={inputCls} placeholder="/uploads/…" value={editing.cover || ""}
                onChange={(e) => setEditing({ ...editing, cover: e.target.value })} />
            </Field>
            <Field label="Tags (comma separated)">
              <input className={inputCls} value={editing.tags.join(", ")}
                onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
            </Field>
            <Field label="SEO meta title (optional)">
              <input className={inputCls} value={editing.metaTitle || ""}
                onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })} />
            </Field>
            <Field label="SEO meta description (optional)">
              <input className={inputCls} value={editing.metaDescription || ""}
                onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} />
            </Field>
            <label className="flex min-h-[44px] items-center gap-2.5 text-sm text-slate-300">
              <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              Published (visible on the site)
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">Save post</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {p.title}
                  {!p.published && <span className="ml-2 rounded bg-slate-500/20 px-1.5 py-0.5 text-xs text-slate-400">draft</span>}
                </p>
                <p className="truncate text-sm text-slate-400">
                  /blog/{p.slug} · {p.date ? new Date(p.date).toLocaleDateString() : "no date"} · {p.tags.join(", ")}
                </p>
              </div>
              <Button variant="ghost" onClick={() => persist(items.map((x) => x.id === p.id ? { ...x, published: !x.published } : x))}>
                {p.published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
              <Button variant="danger" onClick={() => { if (confirm(`Delete "${p.title}"?`)) persist(items.filter((x) => x.id !== p.id)); }}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
        {items.length === 0 && <p className="p-5 text-sm text-slate-500">No posts yet.</p>}
      </Card>
    </div>
  );
}
