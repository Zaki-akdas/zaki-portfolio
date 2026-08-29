'use client';

import {useEffect, useState, useCallback, useRef} from 'react';
import {useRouter} from 'next/navigation';

export default function IntroPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'fading-in' | 'ready' | 'fading-out'>('fading-in');
  const [dismissForever, setDismissForever] = useState(false);
  const [toggleVisible, setToggleVisible] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 50);
    // Request fullscreen on page load — works because navigation is a user gesture
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      }
    } catch {}
    return () => clearTimeout(t);
  }, []);

  // Show the toggle after a brief delay so it doesn't compete with intro loading
  useEffect(() => {
    const t = setTimeout(() => setToggleVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    // Mark intro as shown so IntroRedirect doesn't loop
    try { localStorage.setItem('intro_shown', '1'); } catch {}

    if (dismissForever) {
      try { localStorage.setItem('intro_dismissed', '1'); } catch {}
    }

    setPhase('fading-out');
    // Exit fullscreen before navigating back
    try {
      if (document.fullscreenElement) document.exitFullscreen?.();
    } catch {}
    setTimeout(() => {
      router.push('/');
    }, 800);
  }, [router, dismissForever]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'intro-complete') {
        handleComplete();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: phase === 'fading-out' ? 0 : 1,
        pointerEvents: phase === 'fading-out' ? 'none' : 'auto',
      }}
    >
      <iframe
        src="/intro.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          opacity: phase === 'fading-in' ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}
        title="ZA Cinematic Intro"
        allow="autoplay"
      />

      {/* ── "Don't show again" toggle ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          userSelect: 'none',
          opacity: toggleVisible ? 1 : 0,
          transform: toggleVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
        onClick={() => setDismissForever(v => !v)}
        role="switch"
        aria-checked={dismissForever}
        aria-label="Don't show intro again"
      >
        <div
          style={{
            width: 34,
            height: 18,
            borderRadius: 9,
            background: dismissForever ? '#7042f8' : 'rgba(255,255,255,0.15)',
            position: 'relative',
            flexShrink: 0,
            transition: 'background 0.25s ease',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: dismissForever ? 18 : 2,
              transition: 'left 0.25s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>
        <span>Don&apos;t show again</span>
      </div>
    </div>
  );
}
