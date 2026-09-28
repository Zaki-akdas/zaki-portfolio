"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure for observability; the digest lets us correlate with
    // server logs without leaking the stack to the client.
    console.error(error);
  }, [error]);

  return (
    <div className="css-stars flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">System fault</p>
      <h1 className="h-hero mt-4 font-display font-bold text-white">Something broke orbit</h1>
      <p className="mt-4 max-w-md text-slate-400">
        An unexpected error occurred while rendering this page. Try again — if it
        keeps happening, note the reference below.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-slate-600">ref: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-accent px-7 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
      >
        Retry
      </button>
    </div>
  );
}
