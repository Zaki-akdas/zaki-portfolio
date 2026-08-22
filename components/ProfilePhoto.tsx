'use client';
import {motion} from 'framer-motion';

export default function ProfilePhoto() {
  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto" aria-label="Profile photo placeholder">
      {/* Outer glow */}
      <div className="absolute -inset-6 rounded-full"
        style={{background: 'radial-gradient(circle, rgba(99,102,241,0.2), rgba(139,92,246,0.1), transparent 70%)'}} />

      {/* Rotating orbit ring */}
      <motion.div
        className="absolute -inset-3 rounded-full border border-[rgba(139,92,246,0.25)]"
        animate={{rotate: 360}}
        transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
      >
        {/* Orbital dot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#22d3ee]"
          style={{boxShadow: '0 0 8px rgba(34,211,238,0.6)'}} />
      </motion.div>

      {/* Second orbit ring */}
      <motion.div
        className="absolute -inset-6 rounded-full border border-dashed border-[rgba(6,182,212,0.15)]"
        animate={{rotate: -360}}
        transition={{duration: 30, repeat: Infinity, ease: 'linear'}}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#a78bfa]"
          style={{boxShadow: '0 0 6px rgba(167,139,250,0.5)'}} />
      </motion.div>

      {/* Photo container */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[rgba(139,92,246,0.4)]"
        style={{boxShadow: '0 0 30px rgba(99,102,241,0.2), inset 0 0 20px rgba(0,0,0,0.3)'}}>
        {/* Placeholder content */}
        <div className="w-full h-full bg-gradient-to-br from-[#1e1b4b] to-[#0f0a1f] flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-[#6366f1] opacity-40">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Subtle shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"
          animate={{opacity: [0, 0.1, 0]}}
          transition={{duration: 4, repeat: Infinity, ease: 'easeInOut'}}
        />
      </div>
    </div>
  );
}
