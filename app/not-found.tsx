import Link from "next/link";

export default function NotFound() {
  return (
    <div className="css-stars flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">Error 404</p>
      <h1 className="h-hero mt-4 font-display font-bold text-white">Lost in space</h1>
      <p className="mt-4 max-w-md text-slate-400">
        The page you&apos;re looking for drifted out of orbit. Let&apos;s get you back to mission control.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[44px] items-center rounded-full bg-accent px-7 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
      >
        Return to Earth
      </Link>
    </div>
  );
}
