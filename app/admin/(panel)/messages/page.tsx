"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/adminApi";
import { Button, Card, PageHead, useSaveState } from "@/components/admin/ui";
import type { Message } from "@/lib/store";

export default function MessagesAdmin() {
  const [items, setItems] = useState<Message[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const save = useSaveState();

  useEffect(() => {
    apiGet<Message[]>("messages").then((m) => setItems(m || []));
  }, []);

  async function persist(next: Message[]) {
    setItems(next);
    await save.wrap(() => apiPut("messages", next));
  }

  function toggleOpen(m: Message) {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) persist(items.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
  }

  const unread = items.filter((m) => !m.read).length;

  return (
    <div>
      <PageHead title="Inbox" sub={`${items.length} messages · ${unread} unread · ${save.label}`}>
        {items.length > 0 && (
          <Button variant="ghost" onClick={() => persist(items.map((m) => ({ ...m, read: true })))}>
            Mark all read
          </Button>
        )}
      </PageHead>

      <Card className="p-0">
        {items.length === 0 && <p className="p-5 text-sm text-slate-500">No messages yet. Contact form submissions land here.</p>}
        <ul className="divide-y divide-white/5">
          {items.map((m) => (
            <li key={m.id}>
              <button onClick={() => toggleOpen(m)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03]">
                <span className={`h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-indigo-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${m.read ? "text-slate-300" : "font-semibold text-white"}`}>
                    {m.name} <span className="font-normal text-slate-500">· {m.email}</span>
                  </p>
                  <p className="truncate text-sm text-slate-400">{m.subject || m.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{new Date(m.date).toLocaleString()}</span>
              </button>
              {open === m.id && (
                <div className="border-t border-white/5 bg-[#0d1020] px-5 py-4">
                  {m.subject && <p className="mb-2 text-sm font-semibold text-white">{m.subject}</p>}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{m.message}</p>
                  <div className="mt-4 flex gap-3">
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "your message")}`}
                      className="inline-flex min-h-[40px] items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400">
                      Reply by email
                    </a>
                    <Button variant="danger" onClick={() => { if (confirm("Delete this message?")) persist(items.filter((x) => x.id !== m.id)); }}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
