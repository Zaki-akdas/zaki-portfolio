'use client';
import {useEffect, useRef, useCallback} from 'react';

interface Star {
  x: number; y: number; r: number; a: number; speed: number;
  twinkle: number; offset: number; layer: number; color: string;
}
interface ShootingStar {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
}
interface Planet {
  x: number; y: number; r: number; orbitR: number; speed: number;
  angle: number; color1: string; color2: string; ringColor: string;
  hasRing: boolean; layer: number;
}

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({x: 0, y: 0});
  const smoothMouseRef = useRef({x: 0, y: 0});

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2};
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    const dpr = Math.min(window.devicePixelRatio, 2);
    let time = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let planets: Planet[] = [];
    let lastSS = 0;
    let raf: number;

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 200 : 500;
    const planetCount = isMobile ? 3 : 6;

    function resize() {
      W = innerWidth;
      H = innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
      initPlanets();
    }

    function initStars() {
      const colors = ['230,225,255', '200,200,255', '180,160,255', '220,230,255', '255,240,240'];
      stars = Array.from({length: starCount}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.2,
        a: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.15 + 0.01,
        twinkle: Math.random() * 0.04 + 0.005,
        offset: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3),
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function initPlanets() {
      const pColors = [
        ['#6366f1', '#4338ca', 'rgba(99,102,241,0.15)'],
        ['#8b5cf6', '#6d28d9', 'rgba(139,92,246,0.12)'],
        ['#06b6d4', '#0891b2', 'rgba(6,182,212,0.1)'],
        ['#a855f7', '#7c3aed', 'rgba(168,85,247,0.1)'],
        ['#3b82f6', '#2563eb', 'rgba(59,130,246,0.1)'],
        ['#22d3ee', '#06b6d4', 'rgba(34,211,238,0.08)'],
      ];
      planets = Array.from({length: planetCount}, (_, i) => {
        const c = pColors[i % pColors.length];
        return {
          x: W * (0.15 + Math.random() * 0.7),
          y: H * (0.15 + Math.random() * 0.7),
          r: 6 + Math.random() * 18,
          orbitR: 30 + Math.random() * 60,
          speed: 0.0003 + Math.random() * 0.0005,
          angle: Math.random() * Math.PI * 2,
          color1: c[0], color2: c[1], ringColor: c[2],
          hasRing: Math.random() > 0.4,
          layer: Math.floor(Math.random() * 3),
        };
      });
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    function draw() {
      time += 0.016;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      // Smooth mouse interpolation
      smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.03;
      smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.03;
      const mx = smoothMouseRef.current.x;
      const my = smoothMouseRef.current.y;

      const cx = W * 0.5;
      const cy = H * 0.42;

      // Layer offsets for parallax
      const layerOffset = [0.02, 0.05, 0.1];

      // ── Galaxy spiral ──
      ctx!.save();
      ctx!.translate(cx + mx * 15, cy + my * 10);
      ctx!.rotate(time * 0.006);
      for (let arm = 0; arm < 3; arm++) {
        ctx!.rotate((Math.PI * 2) / 3);
        for (let i = 0; i < 100; i++) {
          const angle = i * 0.1;
          const dist = i * 2.8;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          const alpha = (1 - i / 100) * 0.1;
          const size = (1 - i / 100) * 2.2;
          ctx!.beginPath();
          ctx!.arc(x, y, size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(140, 100, 255, ${alpha})`;
          ctx!.fill();
        }
      }
      ctx!.restore();

      // ── Blackhole center ──
      const bhGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 150);
      bhGrad.addColorStop(0, 'rgba(3, 0, 20, 0.95)');
      bhGrad.addColorStop(0.15, 'rgba(3, 0, 20, 0.8)');
      bhGrad.addColorStop(0.4, 'rgba(80, 30, 180, 0.06)');
      bhGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.03)');
      bhGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = bhGrad;
      ctx!.fillRect(0, 0, W, H);

      // ── Accretion disk ──
      for (let ring = 0; ring < 4; ring++) {
        ctx!.save();
        ctx!.translate(cx + mx * 8, cy + my * 5);
        ctx!.rotate(time * 0.012 + ring * 0.3);
        ctx!.beginPath();
        const rx = 160 + ring * 40;
        const ry = 28 + ring * 10;
        ctx!.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        const alpha = 0.1 - ring * 0.02;
        const colors = [
          `rgba(180, 100, 255, ${alpha})`,
          `rgba(100, 180, 255, ${alpha * 0.7})`,
          `rgba(200, 120, 255, ${alpha * 0.5})`,
          `rgba(60, 200, 220, ${alpha * 0.4})`,
        ];
        ctx!.strokeStyle = colors[ring];
        ctx!.lineWidth = 2 - ring * 0.3;
        ctx!.stroke();
        ctx!.restore();
      }

      // ── Halo ──
      const haloGrad = ctx!.createRadialGradient(cx, cy, 100, cx, cy, 300);
      haloGrad.addColorStop(0, 'rgba(140, 60, 255, 0.05)');
      haloGrad.addColorStop(0.5, 'rgba(60, 120, 255, 0.02)');
      haloGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = haloGrad;
      ctx!.fillRect(0, 0, W, H);

      // ── Stars with parallax ──
      for (const s of stars) {
        const lo = layerOffset[s.layer];
        const sx = s.x + mx * lo * 100;
        const sy = s.y + my * lo * 80;
        const twinkle = Math.sin(time * s.twinkle * 60 + s.offset) * 0.4 + 0.6;
        const alpha = s.a * twinkle;
        ctx!.beginPath();
        ctx!.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx!.fill();
        if (s.r > 1.3) {
          ctx!.beginPath();
          ctx!.arc(sx, sy, s.r * 5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(167, 139, 250, ${alpha * 0.04})`;
          ctx!.fill();
        }
        s.y += s.speed * 0.15;
        if (s.y > H + 10) { s.y = -10; s.x = Math.random() * W; }
      }

      // ── Floating planets ──
      for (const p of planets) {
        p.angle += p.speed;
        const lo = layerOffset[p.layer];
        const px = p.x + Math.cos(p.angle) * p.orbitR + mx * lo * 60;
        const py = p.y + Math.sin(p.angle) * p.orbitR * 0.5 + my * lo * 40;

        // Glow
        const glowGrad = ctx!.createRadialGradient(px, py, 0, px, py, p.r * 4);
        glowGrad.addColorStop(0, p.ringColor);
        glowGrad.addColorStop(1, 'transparent');
        ctx!.fillStyle = glowGrad;
        ctx!.fillRect(px - p.r * 4, py - p.r * 4, p.r * 8, p.r * 8);

        // Planet body
        const bodyGrad = ctx!.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r);
        bodyGrad.addColorStop(0, p.color1);
        bodyGrad.addColorStop(1, p.color2);
        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = bodyGrad;
        ctx!.fill();

        // Ring
        if (p.hasRing) {
          ctx!.save();
          ctx!.translate(px, py);
          ctx!.rotate(0.4);
          ctx!.beginPath();
          ctx!.ellipse(0, 0, p.r * 2.2, p.r * 0.5, 0, 0, Math.PI * 2);
          ctx!.strokeStyle = p.ringColor;
          ctx!.lineWidth = 1.2;
          ctx!.stroke();
          ctx!.restore();
        }
      }

      // ── Shooting stars ──
      if (!isMobile && time * 1000 - lastSS > 4000 + Math.random() * 8000) {
        lastSS = time * 1000;
        shootingStars.push({
          x: Math.random() * W * 0.6,
          y: Math.random() * H * 0.3,
          vx: 5 + Math.random() * 6,
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
        const prog = ss.life / ss.maxLife;
        const alpha = prog < 0.3 ? prog / 0.3 : 1 - (prog - 0.3) / 0.7;
        const grad = ctx!.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 12, ss.y - ss.vy * 12);
        grad.addColorStop(0, `rgba(230, 225, 255, ${alpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(160, 130, 255, ${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(100, 80, 200, 0)');
        ctx!.beginPath();
        ctx!.moveTo(ss.x, ss.y);
        ctx!.lineTo(ss.x - ss.vx * 12, ss.y - ss.vy * 12);
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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-[#030014] overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Nebula clouds */}
      <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.12),transparent_70%)] blur-[100px] pointer-events-none" style={{animation: 'drift 20s ease-in-out infinite alternate'}} />
      <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08),transparent_70%)] blur-[100px] pointer-events-none" style={{animation: 'drift 25s ease-in-out infinite alternate-reverse'}} />
      <div className="absolute top-[50%] left-[20%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(200,100,255,0.05),transparent_70%)] blur-[80px] pointer-events-none" style={{animation: 'drift 18s ease-in-out infinite alternate'}} />
      <div className="absolute top-[20%] left-[60%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.04),transparent_70%)] blur-[90px] pointer-events-none" style={{animation: 'drift 22s ease-in-out infinite alternate-reverse'}} />
    </div>
  );
}
