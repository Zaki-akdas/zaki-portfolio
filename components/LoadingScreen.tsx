'use client';
import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

export default function LoadingScreen({onComplete}: {onComplete: () => void}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading');

  useEffect(() => {
    // Simulate loading progress with easing
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setPhase('revealing'), 300);
        setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 1200);
      } else {
        setProgress(Math.round(current));
      }
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="loader"
          initial={{opacity: 1}}
          exit={{opacity: 0, scale: 1.05}}
          transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030014]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading portfolio"
        >
          {/* Background nebula glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.15),transparent_70%)] blur-[100px] pointer-events-none" />

          {/* Floating stars in loader */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({length: 30}).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.2,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Logo */}
          <motion.div
            initial={{opacity: 0, y: 20, scale: 0.8}}
            animate={{opacity: 1, y: 0, scale: 1}}
            transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            {/* ZA logo */}
            <motion.div
              animate={{rotateY: phase === 'revealing' ? 360 : 0}}
              transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
              className="text-6xl md:text-7xl font-black"
              style={{fontFamily: "'JetBrains Mono', monospace"}}
            >
              <span className="text-white">ZA</span>
              <span className="text-[#7042f8]">.</span>
            </motion.div>

            {/* Progress bar */}
            <div className="w-48 md:w-64">
              <div className="h-[2px] bg-[#1a0a3e] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(to right, #7042f8, #06b6d4)',
                    boxShadow: '0 0 12px rgba(112,66,248,0.6)',
                  }}
                  initial={{width: '0%'}}
                  animate={{width: `${progress}%`}}
                  transition={{duration: 0.3, ease: 'easeOut'}}
                />
              </div>

              {/* Status text */}
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.4}}
                className="mt-4 text-center"
              >
                {phase === 'loading' ? (
                  <span className="text-xs text-gray-500 tracking-widest uppercase font-medium">
                    {progress < 30 ? 'Initializing' : progress < 70 ? 'Loading assets' : 'Almost ready'}…
                  </span>
                ) : (
                  <motion.span
                    initial={{opacity: 0, y: 5}}
                    animate={{opacity: 1, y: 0}}
                    className="text-xs tracking-widest uppercase font-medium"
                    style={{
                      background: 'linear-gradient(to right, #a855f7, #06b6d4)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Welcome
                  </motion.span>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{
              background: 'linear-gradient(to right, transparent, #7042f8, #06b6d4, transparent)',
            }}
            initial={{width: '0%'}}
            animate={{width: '100%'}}
            transition={{duration: 2, ease: 'easeInOut', repeat: phase === 'loading' ? Infinity : 0}}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
