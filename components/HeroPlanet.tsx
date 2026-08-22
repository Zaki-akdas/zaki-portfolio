'use client';
import {motion} from 'framer-motion';

export default function HeroPlanet() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Outer glow */}
      <div className="absolute w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] rounded-full"
        style={{background: 'radial-gradient(circle, rgba(99,102,241,0.08), rgba(139,92,246,0.04), transparent 70%)'}} />

      {/* Orbit ring 1 */}
      <motion.div
        className="absolute w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] rounded-full border border-[rgba(139,92,246,0.12)]"
        animate={{rotate: 360}}
        transition={{duration: 60, repeat: Infinity, ease: 'linear'}}
        style={{transformStyle: 'preserve-3d', transform: 'rotateX(70deg)'}}
      />
      {/* Orbit ring 2 */}
      <motion.div
        className="absolute w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] rounded-full border border-[rgba(6,182,212,0.1)]"
        animate={{rotate: -360}}
        transition={{duration: 45, repeat: Infinity, ease: 'linear'}}
        style={{transformStyle: 'preserve-3d', transform: 'rotateX(75deg) rotateZ(30deg)'}}
      />
      {/* Orbit ring 3 */}
      <motion.div
        className="absolute w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] rounded-full border border-[rgba(168,85,247,0.08)]"
        animate={{rotate: 360}}
        transition={{duration: 35, repeat: Infinity, ease: 'linear'}}
        style={{transformStyle: 'preserve-3d', transform: 'rotateX(65deg) rotateZ(-20deg)'}}
      />

      {/* Planet */}
      <motion.div
        className="relative"
        animate={{y: [-8, 8, -8]}}
        transition={{duration: 8, repeat: Infinity, ease: 'easeInOut'}}
      >
        {/* Atmospheric glow */}
        <div className="absolute -inset-16 rounded-full"
          style={{background: 'radial-gradient(circle, rgba(99,102,241,0.15), rgba(139,92,246,0.08), transparent 70%)', filter: 'blur(20px)'}} />

        <svg width="180" height="180" viewBox="0 0 180 180" className="relative z-10 drop-shadow-2xl">
          <defs>
            <radialGradient id="planetGrad" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#312e81" />
            </radialGradient>
            <radialGradient id="planetGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Glow */}
          <circle cx="90" cy="90" r="85" fill="url(#planetGlow)" />
          {/* Planet body */}
          <circle cx="90" cy="90" r="65" fill="url(#planetGrad)" filter="url(#softGlow)" />
          {/* Surface detail */}
          <ellipse cx="70" cy="75" rx="20" ry="12" fill="rgba(129,140,248,0.2)" transform="rotate(-15 70 75)" />
          <ellipse cx="105" cy="95" rx="15" ry="8" fill="rgba(99,102,241,0.15)" transform="rotate(10 105 95)" />
          {/* Highlight */}
          <ellipse cx="72" cy="65" rx="22" ry="16" fill="rgba(255,255,255,0.08)" transform="rotate(-20 72 65)" />
        </svg>

        {/* Small orbiting dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#22d3ee]"
          style={{boxShadow: '0 0 8px rgba(34,211,238,0.6)'}}
          animate={{
            x: [80, 0, -80, 0, 80],
            y: [0, -30, 0, 30, 0],
          }}
          transition={{duration: 10, repeat: Infinity, ease: 'easeInOut'}}
        />
        {/* Second orbiting dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#a78bfa]"
          style={{boxShadow: '0 0 6px rgba(167,139,250,0.5)'}}
          animate={{
            x: [0, -60, 0, 60, 0],
            y: [-50, 0, 50, 0, -50],
          }}
          transition={{duration: 14, repeat: Infinity, ease: 'easeInOut'}}
        />
      </motion.div>
    </div>
  );
}
