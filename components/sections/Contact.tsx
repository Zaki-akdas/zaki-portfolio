"use client";

import { useState } from "react";
import type { Profile, Settings } from "@/lib/store";

export default function Contact({ profile, settings }: { profile: Profile; settings: Settings }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <p className="reveal text-sm font-medium uppercase tracking-[0.25em] text-accent">06 · Contact</p>
      <h2 className="reveal section-title h-section mt-3 max-w-2xl font-display font-bold text-white" style={{ ["--d" as never]: "80ms" }}>
        Ready for lift-off?
      </h2>
      <p className="reveal mt-4 max-w-xl text-slate-400" style={{ ["--d" as never]: "140ms" }}>
        Tell me about your project — I usually reply within 24 hours.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr,1fr]">
        <form onSubmit={onSubmit} className="reveal space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-300">Name</span>
              <input name="name" required autoComplete="name" placeholder="Ada Lovelace"
                className="min-h-[48px] w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-accent" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-300">Email</span>
              <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@company.com"
                className="min-h-[48px] w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-accent" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Subject</span>
            <input name="subject" placeholder="New website / web app / 3D experience…"
              className="min-h-[48px] w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-accent" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-300">Message</span>
            <textarea name="message" required rows={5} placeholder="What are we building? Budget range and timeline help too."
              className="w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-white placeholder:text-slate-600 focus:border-accent" />
          </label>
          <button type="submit" disabled={status === "sending"} data-cursor
            className="magnetic inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60 sm:w-auto">
            {status === "sending" ? "Transmitting…" : "Send message 🚀"}
          </button>
          {status === "ok" && (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300" role="status">
              Message received — I&apos;ll get back to you within 24 hours. 🛰️
            </p>
          )}
          {status === "error" && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}
        </form>

        <div className="reveal space-y-6" style={{ ["--d" as never]: "150ms" }}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
              <span className={`h-2 w-2 rounded-full ${settings.availability === "open" ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
              {settings.availabilityText}
            </span>
            <p className="mt-6 text-sm text-slate-400">Email</p>
            <a href={`mailto:${profile.email}`} className="font-display text-lg font-semibold text-white transition hover:text-accent" data-cursor>
              {profile.email}
            </a>
            {profile.phone && (
              <>
                <p className="mt-4 text-sm text-slate-400">Phone / WhatsApp</p>
                <a href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                  className="font-display text-lg font-semibold text-white transition hover:text-accent" data-cursor>
                  {profile.phone}
                </a>
              </>
            )}
            <p className="mt-4 text-sm text-slate-400">Based in</p>
            <p className="font-display text-lg font-semibold text-white">{profile.location}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-sm text-slate-400">Find me around the galaxy</p>
            <ul className="mt-4 space-y-1">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" data-cursor
                    className="inline-flex min-h-[44px] items-center gap-2 text-slate-200 transition hover:text-accent">
                    {s.label} <span aria-hidden className="text-xs">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
