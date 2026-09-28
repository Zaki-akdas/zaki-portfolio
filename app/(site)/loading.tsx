export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <div className="preload-orbit relative h-16 w-16 rounded-full border border-white/10">
          <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_14px_var(--accent)]" />
        </div>
        <p className="font-display text-xs tracking-[0.3em] text-slate-500">LOADING</p>
      </div>
    </div>
  );
}
