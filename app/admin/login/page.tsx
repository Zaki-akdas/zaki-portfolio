"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0c18] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101427] p-8">
        <h1 className="text-xl font-bold text-white">Admin access</h1>
        <p className="mt-1 text-sm text-slate-400">Mission control for your portfolio.</p>
        <label className="mt-6 block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full min-h-[44px] rounded-lg border border-white/10 bg-[#0d1020] px-3.5 py-2.5 text-white focus:border-indigo-400"
          />
        </label>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={busy || !password}
          className="mt-5 w-full min-h-[44px] rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-xs text-slate-500">Default password: <code className="text-slate-400">admin123</code> — change it in Settings after first login.</p>
      </form>
    </div>
  );
}
