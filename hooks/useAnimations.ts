'use client';
import {useEffect, useRef, useCallback} from 'react';

/* IntersectionObserver-based reveal */
export function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); io.unobserve(el); }
    }, {threshold});
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/* 3D tilt on pointer move */
export function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLElement>(null);
  const handleMove = useCallback((e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) translateY(-5px)`;
  }, [maxTilt]);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerleave', handleLeave);
    return () => { el.removeEventListener('pointermove', handleMove); el.removeEventListener('pointerleave', handleLeave); };
  }, [handleMove, handleLeave]);
  return ref;
}

/* Parallax scroll offset */
export function useParallax(speed = 0.15) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const fn = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
      ref.current.style.transform = `translateY(${offset}px)`;
    };
    addEventListener('scroll', fn, {passive: true});
    fn();
    return () => removeEventListener('scroll', fn);
  }, [speed]);
  return ref;
}

/* Particle canvas */
export function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number, particles: {x: number; y: number; vx: number; vy: number; r: number; a: number}[] = [];
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      W = canvas!.width = innerWidth * dpr;
      H = canvas!.height = innerHeight * dpr;
      canvas!.style.width = innerWidth + 'px';
      canvas!.style.height = innerHeight + 'px';
      ctx!.scale(dpr, dpr);
      const count = innerWidth < 700 ? 30 : 60;
      particles = Array.from({length: count}, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.3 + 0.1,
      }));
    }
    resize();
    addEventListener('resize', resize);

    let raf: number;
    function draw() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      ctx!.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(140,97,245,${p.a})`;
        ctx!.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(100,80,200,${(1 - d / 120) * 0.08})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, [canvasRef]);
}
