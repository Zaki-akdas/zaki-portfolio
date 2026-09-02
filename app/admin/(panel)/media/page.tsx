"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, PageHead } from "@/components/admin/ui";

type MediaFile = { name: string; url: string; size: number; mtime: number };

const IMG_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

export default function MediaAdmin() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/media", { cache: "no-store" });
    if (res.status === 401) { window.location.href = "/admin/login"; return; }
    setFiles(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function upload(list: FileList | File[]) {
    setError("");
    setBusy(true);
    for (const file of Array.from(list)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(`${file.name}: ${data.error || "upload failed"}`);
      }
    }
    setBusy(false);
    load();
  }

  async function copyUrl(url: string) {
    try { await navigator.clipboard.writeText(url); } catch { /* http fallback */ }
    setCopied(url);
    setTimeout(() => setCopied(""), 1500);
  }

  function fmtSize(b: number) {
    return b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + " MB" : Math.round(b / 1024) + " KB";
  }

  return (
    <div>
      <PageHead title="Media library" sub="Images, videos, PDFs and 3D models. Paste URLs into projects & blog posts." />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}
        className={`mb-6 flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver ? "border-indigo-400 bg-indigo-500/10" : "border-white/15 bg-[#101427] hover:border-white/30"
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <p className="text-sm text-slate-300">{busy ? "Uploading…" : "Drag & drop files here, or click to browse"}</p>
        <p className="mt-1 text-xs text-slate-500">png · jpg · webp · gif · svg · pdf · glb · mp4 — max 8 MB each</p>
        <input ref={inputRef} type="file" multiple hidden
          accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.pdf,.glb,.mp4,.webm"
          onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>

      {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {files.map((f) => (
          <Card key={f.name} className="p-3">
            {IMG_EXT.test(f.name) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt={f.name} className="h-28 w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-28 w-full items-center justify-center rounded-lg bg-[#0d1020] text-3xl">
                {f.name.endsWith(".pdf") ? "📄" : f.name.endsWith(".glb") ? "🧊" : "🎬"}
              </div>
            )}
            <p className="mt-2 truncate text-xs text-slate-300" title={f.name}>{f.name}</p>
            <p className="text-xs text-slate-500">{fmtSize(f.size)}</p>
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" className="flex-1 !min-h-[34px] !px-2 !text-xs" onClick={() => copyUrl(f.url)}>
                {copied === f.url ? "Copied ✓" : "Copy URL"}
              </Button>
              <Button variant="danger" className="!min-h-[34px] !px-2 !text-xs"
                onClick={async () => {
                  if (!confirm(`Delete ${f.name}?`)) return;
                  await fetch(`/api/admin/media?name=${encodeURIComponent(f.name)}`, { method: "DELETE" });
                  load();
                }}>
                ✕
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {files.length === 0 && <p className="text-sm text-slate-500">No files yet — upload your first image above.</p>}
    </div>
  );
}
