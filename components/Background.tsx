"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { view } from "@/lib/scrollState";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "loading" | "full" | "lite" | "css";

export default function Background({ effects3d }: { effects3d: boolean }) {
  const [mode, setMode] = useState<Mode>("loading");
  // The WebGL journey mounts only after the cinematic preloader finishes
  // (or, when the preloader is off, once the browser has painted the page
  // and gone idle) — keeps two heavy three.js scenes from ever running at
  // the same time and lets the page content paint first.
  const [allow3d, setAllow3d] = useState(false);

  // Wire scroll + pointer listeners into the shared view state
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      view.scroll = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      view.section = Math.min(6, Math.floor(view.scroll * 6.999));
    };
    const onPointer = (e: PointerEvent) => {
      view.px = (e.clientX / window.innerWidth) * 2 - 1;
      view.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // Capability detection → pick full / lite / css fallback. The 3D scene
  // itself stays unmounted until the page has painted (allow3d below).
  useEffect(() => {
    const start = () => {
      const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      if (idle) idle(() => setAllow3d(true));
      else setTimeout(() => setAllow3d(true), 200);
    };
    const done = (window as unknown as { __preloaderDone?: boolean }).__preloaderDone;
    const preloader = document.querySelector('[aria-label="Loading"]');
    if (!done && preloader && !preloader.classList.contains("pointer-events-none")) {
      // preloader actively running: mount the journey scene after it signals done
      window.addEventListener("preloader-done", () => setAllow3d(true), { once: true });
      return;
    }
    // no preloader (disabled or already skipped by a returning visitor):
    // mount once the page has painted and the browser goes idle
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  // Capability detection → pick full / lite / css fallback
  useEffect(() => {
    if (!effects3d) return setMode("css");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return setMode("css");

    // Data-saver users opted out of heavy media — the ~700 KB three.js
    // journey is exactly what Save-Data asks us not to send
    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return setMode("css");

    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
    if (!webgl) return setMode("css");

    const cores = navigator.hardwareConcurrency || 4;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const lowEnd = cores <= 3 || (mem !== undefined && mem <= 2);

    if (lowEnd) return setMode("css");
    setMode(mobile || cores <= 5 ? "lite" : "full");
  }, [effects3d]);

  if (mode === "loading") {
    return <div className="css-stars fixed inset-0 -z-10" aria-hidden />;
  }
  if (mode === "css") {
    return <div className="css-stars fixed inset-0 -z-10" aria-hidden />;
  }
  if (!allow3d) {
    return <div className="css-stars fixed inset-0 -z-10" aria-hidden />;
  }
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-ink" aria-hidden>
        <Scene quality={mode} />
        {/* cinematic overlays */}
        <div className="vignette absolute inset-0" />
        <div className="film-grain absolute inset-0" />
      </div>
      <div id="planet-label" aria-hidden />
    </>
  );
}
