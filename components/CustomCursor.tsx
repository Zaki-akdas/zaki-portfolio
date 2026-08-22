'use client';
import {useEffect, useRef, useState} from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isProject, setIsProject] = useState(false);
  const pos = useRef({x: 0, y: 0});
  const target = useRef({x: 0, y: 0});

  useEffect(() => {
    // Only on desktop
    if (window.innerWidth < 768 || matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      target.current = {x: e.clientX, y: e.clientY};
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('a, button, [role="button"], select, input, textarea')) {
        setHovering(true);
      }
      if (el.closest('.project-card')) {
        setIsProject(true);
      }
    };

    const onOut = () => {
      setHovering(false);
      setIsProject(false);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    let raf: number;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.15;
      pos.current.y += (target.current.y - pos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x - 4}px, ${target.current.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x - (hovering ? 24 : 16)}px, ${pos.current.y - (hovering ? 24 : 16)}px) scale(${hovering ? 1 : 1})`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${pos.current.x + 20}px, ${pos.current.y - 10}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    // Hide default cursor
    document.body.style.cursor = 'none';
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = 'a, button, [role="button"], select, input, textarea, .project-card { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
      document.body.style.cursor = '';
      style.remove();
    };
  }, [visible, hovering]);

  if (!visible) return null;

  return (
    <>
      {/* Glow dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(180,155,255,0.9), rgba(112,66,248,0.4))',
          boxShadow: '0 0 8px rgba(112,66,248,0.6), 0 0 20px rgba(112,66,248,0.3)',
          willChange: 'transform',
        }}
      />
      {/* Hover ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border transition-all duration-200 ease-out"
        style={{
          width: hovering ? 48 : 32,
          height: hovering ? 48 : 32,
          borderColor: hovering ? 'rgba(180,155,255,0.6)' : 'rgba(112,66,248,0.3)',
          background: hovering ? 'rgba(112,66,248,0.06)' : 'transparent',
          boxShadow: hovering ? '0 0 15px rgba(112,66,248,0.2)' : 'none',
          willChange: 'transform',
        }}
      />
      {/* Project label */}
      <div
        ref={labelRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200"
        style={{opacity: isProject ? 1 : 0, willChange: 'transform'}}
      >
        <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(112,66,248,0.15)',
            border: '1px solid rgba(112,66,248,0.3)',
            color: '#b49bff',
            backdropFilter: 'blur(4px)',
          }}>
          View project
        </span>
      </div>
    </>
  );
}
