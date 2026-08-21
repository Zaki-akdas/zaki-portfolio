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
    let time = 0;
    let stars: {x: number; y: number; r: number; a: number; speed: number; twinkle: number; offset: number}[] = [];
    let shootingStars: {x: number; y: number; vx: number; vy: number; life: number; maxLife: number}[] = [];
    let lastSS = 0;

    function resize() {
      W = innerWidth;
      H = innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.scale(dpr, dpr);

      const count = W < 700 ? 180 : 400;
      stars = Array.from({length: count}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.2,
        a: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.2 + 0.02,
        twinkle: Math.random() * 0.04 + 0.005,
        offset: Math.random() * Math.PI * 2,
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

      const cx = W * 0.5;
      const cy = H * 0.42;

      // ── Galaxy spiral ──
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(time * 0.008);
      for (let arm = 0; arm < 3; arm++) {
        ctx!.rotate((Math.PI * 2) / 3);
        for (let i = 0; i < 80; i++) {
          const angle = i * 0.12;
          const dist = i * 2.5;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          const alpha = (1 - i / 80) * 0.12;
          const size = (1 - i / 80) * 2.5;
          ctx!.beginPath();
          ctx!.arc(x, y, size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(140, 100, 255, ${alpha})`;
          ctx!.fill();
        }
      }
      ctx!.restore();

      // ── Blackhole center ──
      const bhGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 120);
      bhGrad.addColorStop(0, 'rgba(3, 0, 20, 0.95)');
      bhGrad.addColorStop(0.15, 'rgba(3, 0, 20, 0.8)');
      bhGrad.addColorStop(0.4, 'rgba(80, 30, 180, 0.08)');
      bhGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.04)');
      bhGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = bhGrad;
      ctx!.fillRect(0, 0, W, H);

      // ── Accretion disk ──
      for (let ring = 0; ring < 4; ring++) {
        ctx!.save();
        ctx!.translate(cx, cy);
        ctx!.rotate(time * 0.015 + ring * 0.3);
        ctx!.beginPath();
        const rx = 140 + ring * 35;
        const ry = 25 + ring * 8;
        ctx!.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        const colors = [
          `rgba(180, 100, 255, ${0.12 - ring * 0.025})`,
          `rgba(100, 180, 255, ${0.08 - ring * 0.015})`,
          `rgba(200, 120, 255, ${0.06 - ring * 0.01})`,
          `rgba(60, 200, 220, ${0.04 - ring * 0.008})`,
        ];
        ctx!.strokeStyle = colors[ring];
        ctx!.lineWidth = 2 - ring * 0.3;
        ctx!.stroke();
        ctx!.restore();
      }

      // ── Glowing halo around blackhole ──
      const haloGrad = ctx!.createRadialGradient(cx, cy, 80, cx, cy, 250);
      haloGrad.addColorStop(0, 'rgba(140, 60, 255, 0.06)');
      haloGrad.addColorStop(0.5, 'rgba(60, 120, 255, 0.03)');
      haloGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = haloGrad;
      ctx!.fillRect(0, 0, W, H);

      // ── Stars ──
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkle * 60 + s.offset) * 0.4 + 0.6;
        const alpha = s.a * twinkle;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(230, 225, 255, ${alpha})`;
        ctx!.fill();
        // Glow for bigger stars
        if (s.r > 1.3) {
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(167, 139, 250, ${alpha * 0.05})`;
          ctx!.fill();
        }
        // Slow drift
        s.y += s.speed * 0.2;
        if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
      }

      // ── Shooting stars ──
      if (time * 1000 - lastSS > 3000 + Math.random() * 5000) {
        lastSS = time * 1000;
        shootingStars.push({
          x: Math.random() * W * 0.7,
          y: Math.random() * H * 0.3,
          vx: 4 + Math.random() * 5,
          vy: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 25 + Math.random() * 15,
        });
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        const progress = ss.life / ss.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const grad = ctx!.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 10, ss.y - ss.vy * 10);
        grad.addColorStop(0, `rgba(230, 225, 255, ${alpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(160, 130, 255, ${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(100, 80, 200, 0)');
        ctx!.beginPath();
        ctx!.moveTo(ss.x, ss.y);
        ctx!.lineTo(ss.x - ss.vx * 10, ss.y - ss.vy * 10);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.fill();
        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#030014]" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Nebula blobs */}
      <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.15),transparent_70%)] blur-[100px] pointer-events-none" style={{animation: 'drift 20s ease-in-out infinite alternate'}} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)] blur-[100px] pointer-events-none" style={{animation: 'drift 25s ease-in-out infinite alternate-reverse'}} />
      <div className="absolute top-[50%] left-[20%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,100,255,0.06),transparent_70%)] blur-[80px] pointer-events-none" style={{animation: 'drift 18s ease-in-out infinite alternate'}} />
    </div>
  );
}
