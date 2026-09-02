"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { view } from "@/lib/scrollState";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "loading" | "full" | "lite" | "css";

export default function Background({ effects3d }: { effects3d: boolean }) {
  const [mode, setMode] = useState<Mode>("loading");

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

  // Capability detection → pick full / lite / css fallback
  useEffect(() => {
    if (!effects3d) return setMode("css");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return setMode("css");

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
