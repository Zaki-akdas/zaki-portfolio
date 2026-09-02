"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav({
  name,
  availability,
  availabilityText,
}: {
  name: string;
  availability: string;
  availabilityText: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/5 bg-ink/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <Link href="/#top" className="flex min-h-[44px] items-center gap-2.5 font-display font-bold text-white" data-cursor>
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs text-ink"
            style={{ background: "linear-gradient(135deg, var(--accent), #4cc9f0)" }}>
            {initials}
          </span>
          <span className="hidden sm:inline">{name}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm text-slate-300 transition hover:text-white" data-cursor>
                {l.label}
              </Link>
            </li>
          ))}
          <li className="ml-2">
            <Link href="/#contact"
              className="magnetic inline-flex min-h-[44px] items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink transition hover:brightness-110"
              data-cursor>
              Hire me
            </Link>
          </li>
        </ul>

        {/* hamburger */}
        <button
          className="relative z-[80] flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-full border border-white/20 bg-panel md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`h-[3px] w-6 rounded-full bg-white transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-[3px] w-6 rounded-full bg-white transition-all duration-300 ${open ? "scale-x-0 opacity-0" : ""}`} />
          <span className={`h-[3px] w-6 rounded-full bg-white transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* mobile off-canvas menu */}
      <div
        className={`fixed inset-0 z-[70] flex flex-col bg-ink transition-all duration-400 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="mt-28 flex flex-col gap-1 px-8">
          {LINKS.map((l, i) => (
            <li key={l.href}
              className={`transition-all duration-500 ${open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
              style={{ transitionDelay: open ? `${i * 60 + 80}ms` : "0ms" }}>
              <Link href={l.href} onClick={() => setOpen(false)}
                className="block py-3 font-display text-3xl font-semibold text-white">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={`mt-auto px-8 pb-12 transition-all duration-500 ${open ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: open ? "480ms" : "0ms" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
            <span className={`h-2 w-2 rounded-full ${availability === "open" ? "bg-emerald-400" : "bg-amber-400"}`} />
            {availabilityText || (availability === "open" ? "Open for projects" : "Currently booked")}
          </span>
        </div>
      </div>
    </header>
  );
}
