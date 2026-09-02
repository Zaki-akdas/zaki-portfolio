"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/store";

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx, setIdx] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    if (count < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;

  return (
    <section id="testimonials" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32">
      <p className="reveal text-sm font-medium uppercase tracking-[0.25em] text-accent">05 · Testimonials</p>
      <h2 className="reveal section-title h-section mt-3 max-w-2xl font-display font-bold text-white" style={{ ["--d" as never]: "80ms" }}>
        Transmissions from happy clients
      </h2>

      <div className="reveal relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
        style={{ ["--d" as never]: "150ms" }}>
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {testimonials.map((t) => (
            <figure key={t.id} className="w-full shrink-0 px-6 py-10 sm:px-14 sm:py-14">
              <div className="flex gap-1 text-lg text-amber-300" aria-label={`${t.rating} out of 5 stars`}>
                {"★★★★★".slice(0, t.rating)}
                <span className="text-white/15">{"★★★★★".slice(t.rating)}</span>
              </div>
              <blockquote className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-2xl sm:leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-bold text-ink"
                  style={{ background: "linear-gradient(135deg, var(--accent), #4cc9f0)" }}>
                  {t.name.split(" ").filter((w) => /^[A-Za-z0-9]/.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-slate-400">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {count > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 sm:px-14">
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button key={t.id} onClick={() => setIdx(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-accent" : "w-2.5 bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIdx((idx - 1 + count) % count)} aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10">←</button>
              <button onClick={() => setIdx((idx + 1) % count)} aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10">→</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
