"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live embedded preview of a client website inside a browser-chrome mockup.
 * - Renders the real site in an iframe at desktop width (1280px), scaled to fit.
 * - Shows the screenshot until the iframe finishes loading (and as the
 *   permanent fallback when the site blocks embedding via X-Frame-Options).
 * - The iframe only mounts when scrolled into view, so the page stays fast.
 */
export default function LiveSite({
  url,
  cover,
  title,
  embeddable,
}: {
  url: string;
  cover?: string;
  title: string;
  embeddable: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const DESKTOP_W = 1280;
  const DESKTOP_H = 800;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / DESKTOP_W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setInView(true),
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  const frameH = DESKTOP_H * scale;

  return (
    <div className="mt-12">
      {/* browser chrome */}
      <div className="flex items-center gap-2 rounded-t-2xl border border-b-0 border-white/10 bg-white/[0.04] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 hidden flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-xs text-slate-400 sm:block">
          {url.replace(/^https?:\/\//, "")}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${embeddable && loaded ? "animate-pulse" : ""}`} />
          {embeddable && loaded ? "LIVE" : "PREVIEW"}
        </span>
      </div>

      {/* viewport */}
      <div
        ref={wrap}
        className="relative overflow-hidden rounded-b-2xl border border-white/10 bg-ink"
        style={{ height: frameH }}
      >
        {/* screenshot: placeholder while loading, permanent fallback if blocked */}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${title} website preview`}
            className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${
              embeddable && loaded ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          />
        )}

        {embeddable && inView && (
          <iframe
            src={url}
            title={`Live preview of ${title}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms"
            onLoad={() => setLoaded(true)}
            className={`origin-top-left border-0 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{
              width: DESKTOP_W,
              height: DESKTOP_H,
              transform: `scale(${scale})`,
              pointerEvents: interactive ? "auto" : "none",
            }}
          />
        )}

        {/* interaction shield: click to browse inside the frame */}
        {embeddable && loaded && !interactive && (
          <button
            type="button"
            data-cursor
            onClick={() => setInteractive(true)}
            className="group absolute inset-0 flex items-end justify-center bg-transparent pb-5"
            aria-label={`Interact with the live ${title} website`}
          >
            <span className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              Click to browse the live site ↑
            </span>
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {embeddable
          ? "Live embed of the real client website — scroll inside it or "
          : "This site prevents embedding, so you're seeing a captured preview — "}
        <a href={url} target="_blank" rel="noopener noreferrer" data-cursor className="font-semibold text-accent hover:brightness-125">
          open it full screen ↗
        </a>
      </p>
    </div>
  );
}
