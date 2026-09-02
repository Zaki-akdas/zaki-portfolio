"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut, uid } from "@/lib/adminApi";
import { Button, Card, Field, PageHead, inputCls, useSaveState } from "@/components/admin/ui";
import type { Skill } from "@/lib/store";

export default function SkillsAdmin() {
  const [items, setItems] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const save = useSaveState();

  useEffect(() => {
    apiGet<Skill[]>("skills").then((s) => setItems(s || []));
  }, []);

  async function persist(next: Skill[]) {
    setItems(next);
    await save.wrap(() => apiPut("skills", next));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const exists = items.some((s) => s.id === editing.id);
    persist(exists ? items.map((s) => (s.id === editing.id ? editing : s)) : [...items, { ...editing, id: uid() }]);
    setEditing(null);
  }

  return (
    <div>
      <PageHead title="Skills" sub={`${items.length} skills · ${save.label}`}>
        <Button onClick={() => setEditing({ id: "", name: "", level: 80, category: "Frontend" })}>+ New skill</Button>
      </PageHead>

      {editing && (
        <Card className="mb-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
            <Field label="Name">
              <input className={inputCls} required value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Category">
              <input className={inputCls} required list="skill-cats" value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </Field>
            <datalist id="skill-cats">
              {Array.from(new Set(items.map((s) => s.category))).map((c) => <option key={c} value={c} />)}
            </datalist>
            <Field label={`Proficiency: ${editing.level}%`}>
              <input type="range" min={10} max={100} value={editing.level} className="mt-3 w-full accent-indigo-500"
                onChange={(e) => setEditing({ ...editing, level: Number(e.target.value) })} />
            </Field>
            <div className="flex gap-3 sm:col-span-3">
              <Button type="submit">Save skill</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {items.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-sm text-slate-400">{s.category}</p>
              </div>
              <div className="hidden w-40 sm:block">
                <div className="h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-indigo-400" style={{ width: `${s.level}%` }} />
                </div>
              </div>
              <span className="w-10 text-right text-sm text-slate-400">{s.level}%</span>
              <Button variant="ghost" onClick={() => setEditing(s)}>Edit</Button>
              <Button variant="danger" onClick={() => { if (confirm(`Delete "${s.name}"?`)) persist(items.filter((x) => x.id !== s.id)); }}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
        {items.length === 0 && <p className="p-5 text-sm text-slate-500">No skills yet.</p>}
      </Card>
    </div>
  );
}
