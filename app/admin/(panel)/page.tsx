"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/adminApi";
import { Card, PageHead } from "@/components/admin/ui";
import type { Project, Skill, Testimonial, Message } from "@/lib/store";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<Project[]>("projects"),
      apiGet<Skill[]>("skills"),
      apiGet<Testimonial[]>("testimonials"),
      apiGet<Message[]>("messages"),
    ]).then(([p, s, t, m]) => {
      setProjects(p || []);
      setSkills(s || []);
      setTestimonials(t || []);
      setMessages(m || []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const unread = messages.filter((m) => !m.read).length;
  const stats = [
    { label: "Projects", value: projects.length, href: "/admin/projects" },
    { label: "Skills", value: skills.length, href: "/admin/skills" },
    { label: "Testimonials", value: testimonials.length, href: "/admin/testimonials" },
    { label: "Unread messages", value: unread, href: "/admin/messages", hot: unread > 0 },
  ];

  return (
    <div>
      <PageHead title="Dashboard" sub="Quick overview of your portfolio content." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:border-indigo-400/40">
              <p className={`text-3xl font-bold ${s.hot ? "text-indigo-300" : "text-white"}`}>
                {loaded ? s.value : "–"}
              </p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Latest messages</h2>
      <Card className="p-0">
        {messages.length === 0 && <p className="p-5 text-sm text-slate-500">{loaded ? "No messages yet." : "Loading…"}</p>}
        <ul className="divide-y divide-white/5">
          {messages.slice(0, 5).map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-5 py-3.5">
              {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" aria-label="Unread" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{m.name} <span className="font-normal text-slate-500">· {m.email}</span></p>
                <p className="truncate text-sm text-slate-400">{m.subject || m.message}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{new Date(m.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
        {messages.length > 0 && (
          <div className="border-t border-white/5 px-5 py-3">
            <Link href="/admin/messages" className="text-sm text-indigo-300 hover:text-indigo-200">Open inbox →</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
