"use client";

import React from "react";
import { apiGet } from "@/lib/adminApi";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full min-h-[44px] rounded-lg border border-white/10 bg-[#0d1020] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-400";

export function Button({
  children,
  variant = "primary",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-400",
    ghost: "border border-white/15 text-slate-200 hover:bg-white/10",
    danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30",
  }[variant];
  return (
    <button
      {...rest}
      className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles} ${rest.className || ""}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-white/10 bg-[#101427] p-5 ${className}`}>{children}</div>;
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function useSaveState() {
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };
  const wrap = async (fn: () => Promise<void>) => {
    setState("saving");
    try {
      await fn();
      setState("saved");
      later(() => setState("idle"), 1600);
    } catch {
      setState("error");
      later(() => setState("idle"), 2600);
    }
  };
  const label = { idle: "Save changes", saving: "Saving…", saved: "Saved ✓", error: "Error — retry" }[state];
  return { state, wrap, label };
}

/**
 * Fetch an admin collection with built-in loading + error state. Surfaces a
 * message (and a retry) instead of leaving the page stuck on "Loading…" when
 * the API 503s (Postgres/Redis down) or rejects — the old bare
 * `apiGet().then()` swallowed those as unhandled rejections.
 */
export function useCollection<T>(collection: string, initial: T, transform?: (d: T) => T) {
  const [data, setData] = React.useState<T>(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const reload = React.useCallback(() => {
    setLoading(true);
    apiGet<T>(collection)
      .then((d) => {
        const value = (d ?? initial) as T;
        setData(transform ? transform(value) : value);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : `Failed to load ${collection}`))
      .finally(() => setLoading(false));
    // transform/initial are stable per call site; collection drives reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);
  React.useEffect(() => {
    reload();
  }, [reload]);
  return { data, setData, error, loading, reload };
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[36px] items-center rounded-md border border-rose-400/40 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
        >
          Retry
        </button>
      )}
    </div>
  );
}
