import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Background elements */}
      <div className="nebula-1" />
      <div className="nebula-2" />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Large 404 */}
        <div className="relative mb-8">
          <span className="text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter gradient-text opacity-20 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl md:text-8xl">🌌</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
          Lost in <span className="gradient-text-accent">deep space</span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          This page has drifted beyond the observable universe. Let&apos;s get you back to familiar territory.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5"
          >
            ← Back to home
          </Link>
          <Link
            href="/#contact"
            className="flex items-center gap-2 border border-white/10 text-gray-300 font-bold px-8 py-3.5 rounded-xl hover:border-purple-500/40 hover:text-white transition-all"
          >
            Contact Zaki
          </Link>
        </div>

        {/* Decorative stars */}
        <div className="mt-16 flex items-center justify-center gap-2 text-gray-600 text-xs tracking-widest uppercase">
          <span className="w-1 h-1 rounded-full bg-purple-500" />
          <span>404 · Not Found</span>
          <span className="w-1 h-1 rounded-full bg-purple-500" />
        </div>
      </div>
    </div>
  )
}
