"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, uid } from "@/lib/adminApi";
import { Button, Card, Field, PageHead, inputCls, useSaveState } from "@/components/admin/ui";
import type { Project } from "@/lib/store";

const EMPTY: Project = {
  id: "", slug: "", title: "", summary: "", description: "",
  stack: [], category: "", liveUrl: "", repoUrl: "", featured: false, order: 99, year: "2025",
};

export default function ProjectsAdmin() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const save = useSaveState();

  useEffect(() => {
    apiGet<Project[]>("projects").then((p) => setItems((p || []).sort((a, b) => a.order - b.order)));
  }, []);

  async function persist(next: Project[]) {
    setItems(next);
    await save.wrap(() => apiPut("projects", next));
  }

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const item = { ...editing, slug: editing.slug || slugify(editing.title) };
    const exists = items.some((p) => p.id === item.id);
    const next = exists ? items.map((p) => (p.id === item.id ? item : p)) : [...items, { ...item, id: uid() }];
    persist(next.sort((a, b) => a.order - b.order));
    setEditing(null);
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    persist(next.map((p, i) => ({ ...p, order: i + 1 })));
  }

  return (
    <div>
      <PageHead title="Projects" sub={`${items.length} projects · drag order via arrows · ${save.label}`}>
        <Button onClick={() => setEditing({ ...EMPTY, order: items.length + 1 })}>+ New project</Button>
      </PageHead>

      {editing && (
        <Card className="mb-6">
          <h2 className="mb-4 font-semibold text-white">{editing.id ? "Edit project" : "New project"}</h2>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input className={inputCls} required value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <Field label="Slug (URL)">
              <input className={inputCls} value={editing.slug} placeholder="auto from title"
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Summary (card text)">
                <input className={inputCls} required value={editing.summary}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Full description (blank line = new paragraph)">
                <textarea className={inputCls} rows={6} value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
            </div>
            <Field label="Tech stack (comma separated)">
              <input className={inputCls} value={editing.stack.join(", ")}
                onChange={(e) => setEditing({ ...editing, stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </Field>
            <Field label="Category">
              <input className={inputCls} value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </Field>
            <Field label="Live URL">
              <input className={inputCls} type="url" placeholder="https://…" value={editing.liveUrl}
                onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })} />
            </Field>
            <Field label="Repo URL">
              <input className={inputCls} type="url" placeholder="https://…" value={editing.repoUrl}
                onChange={(e) => setEditing({ ...editing, repoUrl: e.target.value })} />
            </Field>
            <Field label="Cover image URL (upload in Media library)">
              <input className={inputCls} placeholder="/uploads/…" value={editing.cover || ""}
                onChange={(e) => setEditing({ ...editing, cover: e.target.value })} />
            </Field>
            <Field label="Year">
              <input className={inputCls} value={editing.year}
                onChange={(e) => setEditing({ ...editing, year: e.target.value })} />
            </Field>
            <label className="flex min-h-[44px] items-center gap-2.5 self-end text-sm text-slate-300">
              <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Featured project
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">Save project</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {items.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="flex flex-col gap-0.5">
                <button aria-label="Move up" onClick={() => move(i, -1)} className="text-xs text-slate-500 hover:text-white">▲</button>
                <button aria-label="Move down" onClick={() => move(i, 1)} className="text-xs text-slate-500 hover:text-white">▼</button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {p.title} {p.featured && <span className="ml-1.5 rounded bg-indigo-500/20 px-1.5 py-0.5 text-xs text-indigo-300">featured</span>}
                </p>
                <p className="truncate text-sm text-slate-400">/{p.slug} · {p.category} · {p.year}</p>
              </div>
              <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
              <Button variant="danger"
                onClick={() => { if (confirm(`Delete "${p.title}"? This cannot be undone.`)) persist(items.filter((x) => x.id !== p.id)); }}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
        {items.length === 0 && <p className="p-5 text-sm text-slate-500">No projects yet — add your first one.</p>}
      </Card>
    </div>
  );
}
