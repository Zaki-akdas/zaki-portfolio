import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "◧" },
  { href: "/admin/projects", label: "Projects", icon: "▣" },
  { href: "/admin/blog", label: "Blog", icon: "✎" },
  { href: "/admin/skills", label: "Skills", icon: "◈" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "❝" },
  { href: "/admin/media", label: "Media", icon: "▤" },
  { href: "/admin/messages", label: "Inbox", icon: "✉" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!verifyToken(token)) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0a0c18] text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <aside className="shrink-0 border-b border-white/10 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
            <Link href="/admin" className="font-bold text-white">
              ⬢ Mission Control
            </Link>
            <Link href="/" target="_blank" className="text-xs text-indigo-300 hover:text-indigo-200 md:mt-1 md:block">
              View site ↗
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-6" aria-label="Admin">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                <span className="text-indigo-300" aria-hidden>{n.icon}</span> {n.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
