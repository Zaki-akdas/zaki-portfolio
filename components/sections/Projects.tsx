"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/store";

const HUES = [258, 195, 330, 40, 150];

export default function Projects({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");

  // Build category list from data, preserving order of first appearance
  const categories = Array.from(new Set(projects.map((p) => p.category)));

  const filtered =
    active === "All"
      ? projects.slice(0, 6)
      : projects.filter((p) => p.category === active);

  return (
    <section id="projects" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <p className="reveal text-sm font-medium uppercase tracking-[0.25em] text-accent">03 · Selected work</p>
      <h2 className="reveal section-title h-section mt-3 max-w-2xl font-display font-bold text-white" style={{ ["--d" as never]: "80ms" }}>
        Missions I&apos;ve launched
      </h2>
      <p className="reveal mt-4 max-w-xl text-slate-400" style={{ ["--d" as never]: "140ms" }}>
        {projects.length} live client websites across Bhopal, Dubai, Abu Dhabi, London and Toronto. Here are the highlights.
      </p>

      {/* ── Filter tabs ────────────────────────────────────────────── */}
      <div className="reveal mt-10 flex flex-wrap gap-2" style={{ ["--d" as never]: "200ms" }}>
        {["All", ...categories].map((cat) => {
          const isActive = active === cat;
          const count = cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              data-cursor
              className={`relative rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
              }`}
            >
              {cat}
              <span className={`ml-1.5 text-xs ${isActive ? "text-accent/70" : "text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Project grid ──────────────────────────────────────────── */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2" key={active}>
        {filtered.map((p, i) => {
          const hue = HUES[i % HUES.length];
          return (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              data-cursor
              className={`tilt reveal group relative overflow-hidden rounded-2xl border border-white/10 bg-panel p-6 sm:p-8 ${
                active === "All" && i === 0 ? "sm:col-span-2" : ""
              }`}
              style={{ ["--d" as never]: `${(i % 2) * 100}ms`, animationFillMode: "both" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse 90% 100% at 85% 0%, hsla(${hue}, 90%, 62%, 0.22), transparent 60%)`,
                }}
              />
              <div className="tilt-inner relative">
                {p.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover} alt={`${p.title} cover`} className="zoom-img mb-5 h-44 w-full rounded-xl border border-white/10 object-cover" />
                )}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    {p.category} · {p.year}
                  </p>
                  {p.featured && (
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">Featured</span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{p.title}</h3>
                <p className="mt-3 max-w-xl leading-relaxed text-slate-400">{p.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.stack.slice(0, 5).map((s) => (
                    <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  Read case study
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden>→</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── View all link (only on "All" tab when there are more) ─── */}
      {active === "All" && projects.length > filtered.length && (
        <div className="reveal mt-10 text-center">
          <Link href="/projects" data-cursor
            className="magnetic inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
            View all {projects.length} projects <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
