"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, uid } from "@/lib/adminApi";
import { Button, Card, Field, PageHead, inputCls, useSaveState } from "@/components/admin/ui";
import type { Testimonial } from "@/lib/store";

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const save = useSaveState();

  useEffect(() => {
    apiGet<Testimonial[]>("testimonials").then((t) => setItems(t || []));
  }, []);

  async function persist(next: Testimonial[]) {
    setItems(next);
    await save.wrap(() => apiPut("testimonials", next));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const exists = items.some((t) => t.id === editing.id);
    persist(exists ? items.map((t) => (t.id === editing.id ? editing : t)) : [...items, { ...editing, id: uid() }]);
    setEditing(null);
  }

  return (
    <div>
      <PageHead title="Testimonials" sub={`${items.length} testimonials · ${save.label}`}>
        <Button onClick={() => setEditing({ id: "", name: "", role: "", rating: 5, quote: "", published: true })}>
          + New testimonial
        </Button>
      </PageHead>

      {editing && (
        <Card className="mb-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name">
              <input className={inputCls} required value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Role / company">
              <input className={inputCls} value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Quote">
                <textarea className={inputCls} rows={4} required value={editing.quote}
                  onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
              </Field>
            </div>
            <Field label={`Rating: ${editing.rating} / 5`}>
              <input type="range" min={1} max={5} value={editing.rating} className="mt-3 w-full accent-indigo-500"
                onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} />
            </Field>
            <label className="flex min-h-[44px] items-center gap-2.5 self-end text-sm text-slate-300">
              <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              Published (visible on site)
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">Save testimonial</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {items.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">
                  {t.name} <span className="text-amber-300">{"★".repeat(t.rating)}</span>
                  {!t.published && <span className="ml-2 rounded bg-slate-500/20 px-1.5 py-0.5 text-xs text-slate-400">draft</span>}
                </p>
                <p className="truncate text-sm text-slate-400">{t.quote}</p>
              </div>
              <Button variant="ghost" onClick={() => persist(items.map((x) => x.id === t.id ? { ...x, published: !x.published } : x))}>
                {t.published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(t)}>Edit</Button>
              <Button variant="danger" onClick={() => { if (confirm(`Delete testimonial from "${t.name}"?`)) persist(items.filter((x) => x.id !== t.id)); }}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
        {items.length === 0 && <p className="p-5 text-sm text-slate-500">No testimonials yet.</p>}
      </Card>
    </div>
  );
}
