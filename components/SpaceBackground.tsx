'use client';
import {useEffect, useRef} from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number;
    const dpr = window.devicePixelRatio || 1;
    let stars: {x: number; y: number; r: number; a: number; speed: number; twinkle: number; offset: number}[] = [];
    let dustParticles: {x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string}[] = [];
    let time = 0;

    function resize() {
      W = innerWidth;
      H = innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.scale(dpr, dpr);

      const starCount = W < 700 ? 150 : 300;
      stars = Array.from({length: starCount}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.2,
        a: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        twinkle: Math.random() * 0.03 + 0.008,
        offset: Math.random() * Math.PI * 2,
      }));

      const dustCount = W < 700 ? 20 : 40;
      dustParticles = Array.from({length: dustCount}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.15 + 0.05,
        color: ['rgba(112, 66, 248,', 'rgba(6, 182, 212,', 'rgba(168, 85, 247,', 'rgba(59, 130, 246,'][Math.floor(Math.random() * 4)],
      }));
    }
    resize();
    addEventListener('resize', resize);

    let raf: number;
    function draw() {
      time += 0.016;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      ctx!.clearRect(0, 0, W, H);

      // Draw rotating galaxy spiral (subtle)
      ctx!.save();
      ctx!.translate(W / 2, H / 2);
      ctx!.rotate(time * 0.01);
      const spiralGrad = ctx!.createRadialGradient(0, 0, 0, 0, 0, Math.min(W, H) * 0.5);
      spiralGrad.addColorStop(0, 'rgba(112, 66, 248, 0.04)');
      spiralGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.02)');
      spiralGrad.addColorStop(0.6, 'rgba(112, 66, 248, 0.01)');
      spiralGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = spiralGrad;
      ctx!.fillRect(-W, -H, W * 2, H * 2);
      ctx!.restore();

      // Draw stars
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkle * 60 + s.offset) * 0.35 + 0.65;
        const alpha = s.a * twinkle;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(220, 215, 255, ${alpha})`;
        ctx!.fill();
        // Glow for brighter stars
        if (s.r > 1.2) {
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(167, 139, 250, ${alpha * 0.06})`;
          ctx!.fill();
        }
        // Slow drift
        s.y += s.speed * 0.3;
        if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
      }

      // Draw dust particles
      for (const d of dustParticles) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        const pulse = Math.sin(time * 0.5 + d.x * 0.01) * 0.5 + 0.5;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx!.fillStyle = d.color + (d.alpha * pulse) + ')';
        ctx!.fill();
      }

      // Blackhole-like center effect
      const centerX = W * 0.5;
      const centerY = H * 0.45;
      const bhGrad = ctx!.createRadialGradient(centerX, centerY, 0, centerX, centerY, 250);
      bhGrad.addColorStop(0, 'rgba(3, 0, 20, 0.3)');
      bhGrad.addColorStop(0.3, 'rgba(112, 66, 248, 0.03)');
      bhGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.02)');
      bhGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = bhGrad;
      ctx!.fillRect(0, 0, W, H);

      // Accretion disk ring
      ctx!.save();
      ctx!.translate(centerX, centerY);
      ctx!.rotate(time * 0.02);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, 180, 40, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(112, 66, 248, ${0.06 + Math.sin(time) * 0.02})`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.ellipse(0, 0, 220, 55, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(6, 182, 212, ${0.04 + Math.sin(time * 0.7) * 0.02})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.restore();

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Nebula overlays */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.12),transparent_70%)] blur-[80px] animate-drift pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08),transparent_70%)] blur-[80px] animate-drift pointer-events-none" style={{animationDelay: '-10s', animationDirection: 'alternate-reverse'}} />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06),transparent_70%)] blur-[80px] animate-drift pointer-events-none" style={{animationDelay: '-5s'}} />
    </div>
  );
}
