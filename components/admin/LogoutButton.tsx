"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
    >
      <span aria-hidden>⏻</span> Sign out
    </button>
  );
}
