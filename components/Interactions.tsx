"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global micro-interaction engine for the public site:
 *  - .reveal          → scroll-triggered entrance (adds .in)
 *  - .words-container → staggered word reveal (adds .words-in)
 *  - [data-count]     → animated counters
 *  - .tilt            → 3D hover tilt (pointer: fine only)
 *  - .magnetic        → magnetic hover pull (pointer: fine only)
 *
 * Re-wires on every route change: this layout persists across client-side
 * navigation, but each page's DOM is rebuilt — fresh .reveal elements must be
 * observed again or they stay invisible (opacity 0).
 */
export default function Interactions() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    /* ---------- scroll progress bar ---------- */
    const bar = document.getElementById("scroll-progress");
    const onScrollBar = () => {
      if (!bar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    };
    onScrollBar();
    window.addEventListener("scroll", onScrollBar, { passive: true });
    window.addEventListener("resize", onScrollBar, { passive: true });

    /* ---------- scroll reveal ---------- */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in", "words-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal, .words-container").forEach((el) => io.observe(el));

    /* ---------- animated counters ---------- */
    const cio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          cio.unobserve(el);
          if (el.dataset.counted) continue; // don't re-run after route changes
          el.dataset.counted = "1";
          const end = parseInt(el.dataset.count || "0", 10);
          if (reduced) { el.textContent = String(end); continue; }
          const dur = 1600;
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(end * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

    const cleanups: (() => void)[] = [];

    if (fine && !reduced) {
      /* ---------- tilt cards ---------- */
      document.querySelectorAll<HTMLElement>(".tilt").forEach((card) => {
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
        };
        const onLeave = () => { card.style.transform = ""; };
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });

      /* ---------- magnetic buttons ---------- */
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((btn) => {
        const onMove = (e: PointerEvent) => {
          const r = btn.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
        };
        const onLeave = () => { btn.style.transform = ""; };
        btn.addEventListener("pointermove", onMove);
        btn.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          btn.removeEventListener("pointermove", onMove);
          btn.removeEventListener("pointerleave", onLeave);
        });
      });
    }

    return () => {
      io.disconnect();
      cio.disconnect();
      cleanups.forEach((fn) => fn());
      window.removeEventListener("scroll", onScrollBar);
      window.removeEventListener("resize", onScrollBar);
    };
  }, [pathname]);

  return null;
}
