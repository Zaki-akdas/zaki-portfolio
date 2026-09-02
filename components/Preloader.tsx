"use client";

import { useEffect, useRef, useState } from "react";
import PreloaderScene from "./PreloaderScene";

export default function Preloader({ name }: { name: string }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [pct, setPct] = useState(0);
  // null = detecting, true = 3D movie, false = CSS fallback
  const [use3d, setUse3d] = useState<boolean | null>(null);
  const skipped = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // 3D black-hole movie whenever the device can run it
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch { webgl = false; }
    setUse3d(webgl && !reduced && (navigator.hardwareConcurrency || 4) > 3);

    let ready = false;
    let sceneReady = false;
    let current = 0;
    let raf = 0;
    const started = performance.now();

    const markReady = () => { ready = true; };
    const markScene = () => { sceneReady = true; };

    if (document.readyState === "complete") ready = true;
    else window.addEventListener("load", markReady);
    window.addEventListener("scene-ready", markScene);

    const MIN_MS = reduced ? 800 : 4200; // let the black hole feast
    const MAX_MS = 7000; // never trap the user

    const tick = () => {
      const elapsed = performance.now() - started;
      const allReady = ready && (sceneReady || elapsed > 3200);
      const target = allReady && elapsed >= MIN_MS ? 100 : Math.min(88, (elapsed / MIN_MS) * 70 + (ready ? 18 : 0));
      current += (target - current) * 0.1;
      setPct(Math.round(current));
      if ((current >= 99.4 && allReady) || elapsed > MAX_MS) {
        setPct(100);
        setLeaving(true); // camera plunge into the event horizon
        setTimeout(() => {
          setVisible(false);
          document.body.style.overflow = "";
        }, 3100); // full 2.5s Hollywood plunge + fade
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", markReady);
      window.removeEventListener("scene-ready", markScene);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  const initials = name
    .split(" ")
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`fixed inset-0 z-[100] bg-ink transition-opacity duration-[600ms] ${
        leaving ? "pointer-events-none" : ""
      } ${leaving && pct === 100 ? "delay-[2400ms] opacity-0" : "opacity-100"}`}
      aria-label="Loading"
      role="status"
    >
      {/* 3D black-hole feeding frenzy — mounted client-side, chunk pre-bundled */}
      {use3d === true && <PreloaderScene leaving={leaving} />}

      {/* cinematic vignette over the movie */}
      <div className="vignette absolute inset-0 pointer-events-none" />

      {/* CSS fallback animation when 3D isn't available */}
      {use3d === false && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <div className="preload-orbit absolute inset-0 rounded-full border border-white/10">
              <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_14px_var(--accent)]" />
            </div>
            <div className="preload-orbit absolute inset-4 rounded-full border border-white/5" style={{ animationDuration: "2.6s", animationDirection: "reverse" }}>
              <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_#4cc9f0]" />
            </div>
            <div className="pulse-glow flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold text-white"
              style={{ background: "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--accent) 80%, white), var(--accent) 55%, #2b2470)", boxShadow: "0 0 40px color-mix(in srgb, var(--accent) 55%, transparent)" }}>
              {initials}
            </div>
          </div>
        </div>
      )}

      {/* HUD overlay */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-[10%] flex flex-col items-center px-6 transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
        <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold text-ink"
          style={{ background: "linear-gradient(135deg, var(--accent), #4cc9f0)" }}>
          {initials}
        </span>
        <p className="mt-4 font-display text-xs tracking-[0.4em] text-slate-400">
          {pct >= 100 ? "CROSSING THE EVENT HORIZON" : "APPROACHING EVENT HORIZON"}
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-white tabular-nums">{pct}%</p>
        <div className="mt-4 h-0.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), #4cc9f0)" }} />
        </div>
      </div>
    </div>
  );
}
