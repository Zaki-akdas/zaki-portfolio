'use client';

import {useEffect, useRef} from 'react';

export default function AnimatedMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };

    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      {x: 0.3, y: 0.3, r: 300, color: [112, 66, 248], speed: 0.0003, phase: 0},
      {x: 0.7, y: 0.6, r: 250, color: [6, 182, 212], speed: 0.0004, phase: 2},
      {x: 0.5, y: 0.8, r: 200, color: [168, 85, 247], speed: 0.00025, phase: 4},
      {x: 0.2, y: 0.7, r: 180, color: [59, 130, 246], speed: 0.00035, phase: 1},
    ];

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const orb of orbs) {
        const cx = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.15) * w;
        const cy = (orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.1) * h;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        grad.addColorStop(0, `rgba(${orb.color.join(',')},0.15)`);
        grad.addColorStop(0.5, `rgba(${orb.color.join(',')},0.05)`);
        grad.addColorStop(1, `rgba(${orb.color.join(',')},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{zIndex: -1, opacity: 0.8}}
      aria-hidden="true"
    />
  );
}
