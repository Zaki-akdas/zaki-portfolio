'use client';
import {useEffect, useRef} from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number;
    const dpr = window.devicePixelRatio || 1;
    let stars: {x: number; y: number; r: number; a: number; twinkleSpeed: number; twinkleOffset: number}[] = [];
    let shootingStars: {x: number; y: number; vx: number; vy: number; life: number; maxLife: number}[] = [];
    let lastShootingStar = 0;

    function resize() {
      W = innerWidth;
      H = innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx!.scale(dpr, dpr);
      const count = W < 700 ? 120 : 250;
      stars = Array.from({length: count}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    }
    resize();
    addEventListener('resize', resize);

    let raf: number;
    let time = 0;
    function draw() {
      time += 0.016;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      ctx!.clearRect(0, 0, W, H);

      // Draw stars with twinkling
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.3 + 0.7;
        const alpha = s.a * twinkle;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(232, 224, 255, ${alpha})`;
        ctx!.fill();
        // Star glow for brighter stars
        if (s.r > 1) {
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(167, 139, 250, ${alpha * 0.08})`;
          ctx!.fill();
        }
      }

      // Occasional shooting stars
      if (time * 1000 - lastShootingStar > 4000 + Math.random() * 6000) {
        lastShootingStar = time * 1000;
        shootingStars.push({
          x: Math.random() * W * 0.8,
          y: Math.random() * H * 0.4,
          vx: 3 + Math.random() * 4,
          vy: 1 + Math.random() * 2,
          life: 0,
          maxLife: 30 + Math.random() * 20,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        const progress = ss.life / ss.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        // Trail
        const gradient = ctx!.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        gradient.addColorStop(0, `rgba(232, 224, 255, ${alpha * 0.9})`);
        gradient.addColorStop(1, 'rgba(232, 224, 255, 0)');
        ctx!.beginPath();
        ctx!.moveTo(ss.x, ss.y);
        ctx!.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        // Head
        ctx!.beginPath();
        ctx!.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.fill();
        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return <canvas id="starfield" ref={canvasRef} aria-hidden="true" />;
}
