"use client";

export async function apiGet<T>(collection: string): Promise<T> {
  const res = await fetch(`/api/admin/data/${collection}`, { cache: "no-store" });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to load " + collection);
  return res.json();
}

export async function apiPut(collection: string, data: unknown): Promise<void> {
  const res = await fetch(`/api/admin/data/${collection}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to save " + collection);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
