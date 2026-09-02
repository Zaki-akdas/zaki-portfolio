import type { Profile } from "@/lib/store";

export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="relative border-t border-white/5 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {profile.name}. Handcrafted among the stars.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {profile.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-sm text-slate-400 transition hover:text-white" data-cursor>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
