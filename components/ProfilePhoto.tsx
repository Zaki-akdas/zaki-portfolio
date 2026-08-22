'use client';
import {useState, useRef, useCallback, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

export default function ProfilePhoto() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleVideoReady = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  // Fallback: if onLoadedData doesn't fire within 3s, assume ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded) {
        setVideoLoaded(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [videoLoaded]);

  const handleTapPlay = useCallback(() => {
    const v = videoRef.current;
    if (v && v.paused) {
      v.play().then(() => setVideoLoaded(true)).catch(() => {});
    }
  }, []);

  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto" aria-label="Profile photo">
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
        style={{boxShadow: '0 0 30px rgba(99,102,241,0.2), inset 0 0 20px rgba(0,0,0,0.3)'}}
        onClick={handleTapPlay}
        role={isMobile ? 'button' : undefined}
        aria-label={isMobile ? 'Tap to play profile video' : undefined}>

        {/* Shimmer skeleton — visible while video buffers */}
        <AnimatePresence>
          {!videoLoaded && (
            <motion.div
              key="skeleton"
              initial={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.6, ease: 'easeOut'}}
              className="absolute inset-0 rounded-full bg-[rgba(99,102,241,0.15)] overflow-hidden z-10"
            >
              {/* Base pulse */}
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[rgba(99,102,241,0.2)] via-[rgba(139,92,246,0.1)] to-[rgba(6,182,212,0.15)]" />

              {/* Shimmer sweep */}
              <div className="absolute inset-0 shimmer-sweep" />

              {/* Central glow dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[rgba(99,102,241,0.3)] animate-ping" />
                <div className="absolute w-3 h-3 rounded-full bg-[rgba(139,92,246,0.6)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile video */}
        <video
          ref={videoRef}
          src="/images/profile-galaxy.mp4"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onLoadedMetadata={handleVideoReady}
        />

        {/* Gradient overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
}
