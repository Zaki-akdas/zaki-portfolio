'use client';

import {motion} from 'framer-motion';

const mockups: Record<string, {lines: number; colors: string[]; headerColor: string}> = {
  food: {lines: 6, colors: ['#dc2626', '#f59e0b', '#ef4444', '#fbbf24', '#dc2626', '#f59e0b'], headerColor: '#991b1b'},
  night: {lines: 5, colors: ['#3b82f6', '#8b5cf6', '#6366f1', '#a78bfa', '#3b82f6'], headerColor: '#1e3a8a'},
  fashion: {lines: 5, colors: ['#e11d48', '#db2777', '#f43f5e', '#be185d', '#e11d48'], headerColor: '#9f1239'},
  design: {lines: 6, colors: ['#d97706', '#f59e0b', '#b45309', '#fbbf24', '#d97706', '#f59e0b'], headerColor: '#78350f'},
  boutique: {lines: 6, colors: ['#d97706', '#f59e0b', '#b45309', '#fbbf24', '#d97706', '#f59e0b'], headerColor: '#78350f'},
};

export default function ProjectMockup({theme, className = ''}: {theme: string; className?: string}) {
  const m = mockups[theme] ?? mockups.night;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <svg viewBox="0 0 400 280" className="w-full h-full" aria-hidden="true">
        {/* Window chrome */}
        <rect x="0" y="0" width="400" height="280" rx="8" fill="rgba(0,0,0,0.3)" />
        <rect x="0" y="0" width="400" height="28" rx="8" fill={m.headerColor} />
        <rect x="0" y="20" width="400" height="8" fill={m.headerColor} />
        {/* Traffic lights */}
        <circle cx="18" cy="14" r="4" fill="#ef4444" opacity="0.8" />
        <circle cx="32" cy="14" r="4" fill="#eab308" opacity="0.8" />
        <circle cx="46" cy="14" r="4" fill="#22c55e" opacity="0.8" />
        {/* URL bar */}
        <rect x="160" y="8" width="180" height="12" rx="4" fill="rgba(255,255,255,0.1)" />

        {/* Content area */}
        <rect x="16" y="40" width="368" height="224" rx="4" fill="rgba(255,255,255,0.05)" />

        {/* Hero block */}
        <rect x="28" y="52" width="200" height="8" rx="2" fill={m.colors[0]} opacity="0.7" />
        <rect x="28" y="68" width="140" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
        <rect x="28" y="80" width="160" height="6" rx="2" fill="rgba(255,255,255,0.15)" />

        {/* Animated image placeholder */}
        <motion.rect
          x="240" y="48" width="130" height="90" rx="6"
          fill={m.colors[1]}
          opacity="0.2"
          animate={{opacity: [0.15, 0.3, 0.15]}}
          transition={{duration: 3, repeat: Infinity, ease: 'easeInOut'}}
        />
        <motion.circle
          cx="305" cy="93" r="20"
          fill={m.colors[2]}
          opacity="0.3"
          animate={{r: [18, 22, 18], opacity: [0.2, 0.4, 0.2]}}
          transition={{duration: 4, repeat: Infinity, ease: 'easeInOut'}}
        />

        {/* Content lines */}
        {m.lines > 0 && (
          <>
            <motion.rect
              x="28" y="110" width="344" height="3" rx="1.5"
              fill={m.colors[0]} opacity="0.15"
              animate={{opacity: [0.1, 0.25, 0.1]}}
              transition={{duration: 2.5, repeat: Infinity, delay: 0.3}}
            />
            <rect x="28" y="122" width="280" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
            <rect x="28" y="130" width="320" height="2" rx="1" fill="rgba(255,255,255,0.06)" />
            <rect x="28" y="138" width="240" height="2" rx="1" fill="rgba(255,255,255,0.05)" />
          </>
        )}

        {/* Card grid */}
        {m.lines > 2 && (
          <>
            <rect x="28" y="155" width="105" height="45" rx="4" fill={m.colors[3]} opacity="0.12" />
            <rect x="140" y="155" width="105" height="45" rx="4" fill={m.colors[4]} opacity="0.1" />
            <rect x="252" y="155" width="105" height="45" rx="4" fill={m.colors[5] || m.colors[0]} opacity="0.08" />
            <motion.rect
              x="28" y="210" width="105" height="45" rx="4"
              fill={m.colors[0]} opacity="0.1"
              animate={{opacity: [0.08, 0.18, 0.08]}}
              transition={{duration: 3, repeat: Infinity, delay: 1}}
            />
            <rect x="140" y="210" width="105" height="45" rx="4" fill={m.colors[1]} opacity="0.08" />
            <rect x="252" y="210" width="105" height="45" rx="4" fill={m.colors[2]} opacity="0.06" />
          </>
        )}

        {/* Floating accent dot */}
        <motion.circle
          cx="350" cy="260" r="3"
          fill={m.colors[0]}
          animate={{cy: [260, 250, 260], opacity: [0.4, 0.8, 0.4]}}
          transition={{duration: 2, repeat: Infinity, ease: 'easeInOut'}}
        />
      </svg>
    </div>
  );
}
