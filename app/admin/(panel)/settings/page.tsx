"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/adminApi";
import { Button, Card, Field, PageHead, inputCls, useSaveState } from "@/components/admin/ui";
import type { Profile, Settings } from "@/lib/store";

export default function SettingsAdmin() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const profileSave = useSaveState();
  const settingsSave = useSaveState();

  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    apiGet<Profile>("profile").then(setProfile);
    apiGet<Settings>("settings").then(setSettings);
  }, []);

  if (!profile || !settings) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <PageHead title="Site settings" sub="Global content, theme and security." />

      {/* profile / global content */}
      <Card>
        <h2 className="mb-4 font-semibold text-white">Identity & global content</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Field>
          <Field label="Role / title">
            <input className={inputCls} value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Hero headline">
              <input className={inputCls} value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Hero tagline">
              <textarea className={inputCls} rows={2} value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="About — paragraph 1">
              <textarea className={inputCls} rows={3} value={profile.about} onChange={(e) => setProfile({ ...profile, about: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="About — paragraph 2">
              <textarea className={inputCls} rows={3} value={profile.aboutMore} onChange={(e) => setProfile({ ...profile, aboutMore: e.target.value })} />
            </Field>
          </div>
          <Field label="Contact email">
            <input className={inputCls} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </Field>
          <Field label="Phone / WhatsApp (shown on site)">
            <input className={inputCls} type="tel" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </Field>
          <Field label="Location">
            <input className={inputCls} value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          </Field>
          <Field label="Résumé URL (PDF)">
            <input className={inputCls} value={profile.resumeUrl} onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Social links (one per line: Label | URL)">
              <textarea className={inputCls} rows={4}
                value={profile.socials.map((s) => `${s.label} | ${s.url}`).join("\n")}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socials: e.target.value.split("\n").map((line) => {
                      const [label, url] = line.split("|").map((s) => s.trim());
                      return { label: label || "", url: url || "" };
                    }).filter((s) => s.label),
                  })
                } />
            </Field>
          </div>
        </div>
        <Button className="mt-5" onClick={() => profileSave.wrap(() => apiPut("profile", profile))}>
          {profileSave.label}
        </Button>
      </Card>

      {/* theme + availability + seo */}
      <Card>
        <h2 className="mb-4 font-semibold text-white">Theme, availability & SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Accent color">
            <div className="flex items-center gap-3">
              <input type="color" value={settings.accent} className="h-11 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                onChange={(e) => setSettings({ ...settings, accent: e.target.value })} />
              <code className="text-sm text-slate-400">{settings.accent}</code>
            </div>
          </Field>
          <Field label="Availability">
            <select className={inputCls} value={settings.availability}
              onChange={(e) => setSettings({ ...settings, availability: e.target.value as Settings["availability"] })}>
              <option value="open">Open for work</option>
              <option value="booked">Booked</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Availability text">
              <input className={inputCls} value={settings.availabilityText}
                onChange={(e) => setSettings({ ...settings, availabilityText: e.target.value })} />
            </Field>
          </div>
          <label className="flex min-h-[44px] items-center gap-2.5 text-sm text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={settings.effects3d}
              onChange={(e) => setSettings({ ...settings, effects3d: e.target.checked })} />
            Enable 3D universe background (kill-switch)
          </label>
          <label className="flex min-h-[44px] items-center gap-2.5 text-sm text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={settings.preloader}
              onChange={(e) => setSettings({ ...settings, preloader: e.target.checked })} />
            Enable preloader animation
          </label>
          <div className="sm:col-span-2">
            <Field label="Site URL (used for sitemap.xml, robots.txt & social share images)">
              <input className={inputCls} type="url" placeholder="https://yourdomain.com" value={settings.siteUrl || ""}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Meta title (SEO)">
              <input className={inputCls} value={settings.metaTitle}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Meta description (SEO)">
              <textarea className={inputCls} rows={2} value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} />
            </Field>
          </div>
        </div>
        <Button className="mt-5" onClick={() => settingsSave.wrap(() => apiPut("settings", settings))}>
          {settingsSave.label}
        </Button>
      </Card>

      {/* password */}
      <Card>
        <h2 className="mb-4 font-semibold text-white">Change admin password</h2>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setPwMsg("");
            const res = await fetch("/api/admin/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pw),
            });
            const data = await res.json().catch(() => ({}));
            setPwMsg(res.ok ? "Password updated ✓" : data.error || "Failed to update password");
            if (res.ok) setPw({ current: "", next: "" });
          }}
        >
          <Field label="Current password">
            <input className={inputCls} type="password" required value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          </Field>
          <Field label="New password (min 8 chars)">
            <input className={inputCls} type="password" required minLength={8} value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </Field>
          <div className="flex items-center gap-4 sm:col-span-2">
            <Button type="submit">Update password</Button>
            {pwMsg && <p className={`text-sm ${pwMsg.includes("✓") ? "text-emerald-400" : "text-rose-400"}`}>{pwMsg}</p>}
          </div>
        </form>
      </Card>
    </div>
  );
}
