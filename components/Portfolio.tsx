'use client';
import {useEffect, useState, useRef, useCallback} from 'react';
import {motion, useInView, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform} from 'framer-motion';
import {Mail, MessageCircle, Send, CheckCircle, AlertCircle, Sparkles, ArrowUpRight, X, ExternalLink, Monitor, Smartphone, ChevronUp} from 'lucide-react';
import dynamic from 'next/dynamic';
import {projects} from '@/data/projects';

const SpaceBackground = dynamic(() => import('./SpaceBackground'), {ssr: false});
const LoadingScreen = dynamic(() => import('./LoadingScreen'), {ssr: false});

/* ─── Data ─── */
const skills = [
  {name: 'HTML', icon: '🌐', color: '#e34c26'},
  {name: 'CSS', icon: '🎨', color: '#1572b6'},
  {name: 'JavaScript', icon: '⚡', color: '#f7df1e'},
  {name: 'TypeScript', icon: '📘', color: '#3178c6'},
  {name: 'React', icon: '⚛️', color: '#61dafb'},
  {name: 'Next.js', icon: '▲', color: '#ffffff'},
  {name: 'Tailwind CSS', icon: '💨', color: '#06b6d4'},
  {name: 'Node.js', icon: '🟢', color: '#68a063'},
  {name: 'PostgreSQL', icon: '🐘', color: '#336791'},
  {name: 'MongoDB', icon: '🍃', color: '#47a248'},
  {name: 'Supabase', icon: '⚡', color: '#3ecf8e'},
  {name: 'Git', icon: '🔀', color: '#f05032'},
  {name: 'OpenAI', icon: '🤖', color: '#10a37f'},
  {name: 'Three.js', icon: '🎮', color: '#049ef4'},
  {name: 'Framer Motion', icon: '🎬', color: '#bb4bff'},
];

/* ─── Animated counter hook ─── */
function useCountUp(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      {threshold: 0.3}
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return {count, ref};
}

/* ─── Stats Section ─── */
const stats = [
  {label: 'Projects Completed', value: 3, suffix: '+'},
  {label: 'Happy Clients', value: 3, suffix: '+'},
  {label: 'Technologies', value: 15, suffix: '+'},
  {label: 'Client Rating', value: 5, suffix: '/5', prefix: '★'},
];

function StatsSection() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-5">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="stats-grid">
            {stats.map((s, i) => {
              const {count, ref} = useCountUp(s.value, 1800 + i * 200);
              return (
                <div key={s.label} ref={ref} className="stat-card">
                  <div className="stat-value">
                    {s.prefix ?? ''}{count}{s.suffix}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Theme config ─── */
const themeConfig: Record<string, {gradient: string; brandBg: string; brandBorder: string; emoji: string}> = {
  food: {gradient: 'from-red-700 to-red-950', brandBg: 'bg-gradient-to-br from-red-600 to-red-900', brandBorder: 'border-red-500/40', emoji: '🍔'},
  night: {gradient: 'from-blue-700 to-indigo-950', brandBg: 'bg-gradient-to-br from-blue-600/80 to-indigo-900', brandBorder: 'border-blue-400/30', emoji: '🌙'},
  fashion: {gradient: 'from-rose-700 to-pink-950', brandBg: 'bg-gradient-to-br from-rose-600 to-pink-900', brandBorder: 'border-rose-400/30', emoji: '✦'},
  design: {gradient: 'from-amber-700 to-orange-950', brandBg: 'bg-gradient-to-br from-amber-600 to-orange-900', brandBorder: 'border-amber-400/30', emoji: '✧'},
};

/* ─── Project Card ─── */
function ProjectCard({project, index, onPreview}: {project: typeof projects[number]; index: number; onPreview: (url: string, title: string) => void}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const [hovered, setHovered] = useState(false);

  const tc = themeConfig[project.theme] ?? themeConfig.night;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  return (
    <Reveal delay={index * 0.15}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{rotateX, rotateY, transformPerspective: 1200}}
        className="project-card block group relative"
      >
        {/* Shimmer sweep overlay */}
        <div className="project-card-shimmer" />

        {/* Browser mockup header */}
        <div className={`relative h-44 sm:h-56 flex flex-col justify-end p-4 sm:p-5 ${tc.gradient} overflow-hidden`}>
          {/* Browser chrome frame */}
          <div className="absolute top-3 left-3 right-3 rounded-lg overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-black/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-400/80" />
              <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
              <span className="w-2 h-2 rounded-full bg-green-400/80" />
              <div className="flex-1 mx-2 h-4 rounded bg-white/10 flex items-center px-2">
                <span className="text-[9px] text-white/40 font-mono truncate">{project.url.replace('https://', '')}</span>
              </div>
            </div>
            {/* Fake page content area */}
            <div className={`relative ${tc.brandBg} border ${tc.brandBorder} border-t-0 rounded-b-lg p-4 sm:p-5`}>
              <span className="text-white/50 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1">{tc.emoji} {project.subtitle}</span>
              <span className="text-white text-xl sm:text-2xl font-black leading-tight">{project.title}</span>
              {/* CTA pill */}
              <div className="mt-3 inline-block">
                <span className="text-[10px] tracking-widest text-white/80 border border-white/30 rounded-full px-3 py-1 font-semibold">{project.cta}</span>
              </div>
            </div>
          </div>
          {/* Glow behind mockup */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
        </div>

        {/* Card body */}
        <div className="relative p-4 sm:p-5">
          <p className="text-[11px] text-[#9d8bed] tracking-wider uppercase font-bold mb-1.5">{project.kind}</p>
          <h3 className="text-xl font-semibold text-white">{project.title}</h3>
          <p className="mt-2 text-gray-300 text-sm leading-relaxed line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.map(t => (
              <span key={t} className="project-tag text-xs border border-[#2A0E61] rounded-full px-3 py-1 text-gray-400">
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreview(project.url, project.title); }}
              className="flex items-center gap-1.5 text-sm font-bold text-[#7042f8] hover:text-[#b49bff] transition-colors cursor-pointer"
            >
              <Monitor size={14} /> Preview
            </button>
            <span className="flex items-center gap-1.5 text-sm font-bold text-[#7042f8] group-hover:text-[#b49bff] transition-colors">
              View live
              <ArrowUpRight size={15} className="project-card-arrow transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── Reveal wrapper ─── */
function Reveal({children, className = '', delay = 0}: {children: React.ReactNode; className?: string; delay?: number}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {once: true, margin: '-50px'});
  return (
    <motion.div ref={ref} initial={{opacity: 0, y: 40}} animate={isInView ? {opacity: 1, y: 0} : {opacity: 0, y: 40}} transition={{duration: 0.6, delay, ease: [0.16, 1, 0.3, 1]}} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Welcome Badge ─── */
function WelcomeBadge({text}: {text: string}) {
  return (
    <div className="welcome-box">
      <Sparkles size={18} className="text-[#b49bff]" />
      <span className="welcome-text">{text}</span>
    </div>
  );
}

/* ─── Contact Form ─── */
function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({name: '', email: '', type: 'Business website', budget: "Let's discuss", message: ''});
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('https://formspree.io/f/mnpawgla', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      if (res.ok) { setStatus('success'); setFormData({name: '', email: '', type: 'Business website', budget: "Let's discuss", message: ''}); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };
  const set = (f: string, v: string) => setFormData(p => ({...p, [f]: v}));

  if (status === 'success') return (
    <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="glass-card p-8 text-center">
      <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Message sent!</h3>
      <p className="text-gray-400 mb-4">Thanks for reaching out. I&apos;ll get back to you soon.</p>
      <button onClick={() => setStatus('idle')} className="text-[#7042f8] hover:text-[#b49bff] text-sm font-semibold cursor-pointer">Send another →</button>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Name</label><input required type="text" placeholder="Your name" value={formData.name} onChange={e => set('name', e.target.value)} className="w-full bg-[rgba(3,0,20,0.5)] border border-[#2A0E61] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#7042f8] transition-all" /></div>
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Email</label><input required type="email" placeholder="you@company.com" value={formData.email} onChange={e => set('email', e.target.value)} className="w-full bg-[rgba(3,0,20,0.5)] border border-[#2A0E61] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#7042f8] transition-all" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Project type</label><select value={formData.type} onChange={e => set('type', e.target.value)} className="w-full bg-[rgba(3,0,20,0.5)] border border-[#2A0E61] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#7042f8] cursor-pointer"><option>Business website</option><option>Web application</option><option>E-commerce</option><option>AI integration</option><option>Other</option></select></div>
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Budget range</label><select value={formData.budget} onChange={e => set('budget', e.target.value)} className="w-full bg-[rgba(3,0,20,0.5)] border border-[#2A0E61] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#7042f8] cursor-pointer"><option>Let&apos;s discuss</option><option>Under ₹25,000</option><option>₹25,000–₹75,000</option><option>₹75,000+</option></select></div>
      </div>
      <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Project description</label><textarea required rows={5} placeholder="What would you like to build?" value={formData.message} onChange={e => set('message', e.target.value)} className="w-full bg-[rgba(3,0,20,0.5)] border border-[#2A0E61] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#7042f8] transition-all resize-vertical min-h-[120px]" /></div>
      <button type="submit" disabled={status === 'submitting'} className="button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        {status === 'submitting' ? 'Sending…' : <>Send inquiry <Send size={16} /></>}
      </button>
      {status === 'error' && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle size={16} /> Something went wrong. Please try again or email me directly.</div>}
    </form>
  );
}

/* ─── Section Wrapper with slide-in effect ─── */
function SectionReveal({children, className = '', direction = 'up'}: {children: React.ReactNode; className?: string; direction?: 'up' | 'left' | 'right'}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {once: true, margin: '-80px'});
  const variants = {
    up: {hidden: {opacity: 0, y: 60}, visible: {opacity: 1, y: 0}},
    left: {hidden: {opacity: 0, x: -60}, visible: {opacity: 1, x: 0}},
    right: {hidden: {opacity: 0, x: 60}, visible: {opacity: 1, x: 0}},
  };
  return (
    <motion.section ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Project Preview Modal ─── */
function ProjectPreviewModal({url, title, onClose}: {url: string; title: string; onClose: () => void}) {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.25}}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${title}`}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
      />

      {/* Modal chrome */}
      <motion.div
        initial={{opacity: 0, scale: 0.92, y: 30}}
        animate={{opacity: 1, scale: 1, y: 0}}
        exit={{opacity: 0, scale: 0.95, y: 20}}
        transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
        className="relative z-10 w-full max-w-[1100px] h-[80vh] max-h-[700px] rounded-2xl overflow-hidden border border-[#2A0E61] bg-[#0a0a14] shadow-2xl shadow-[#7042f8]/10 flex flex-col"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111120] border-b border-[#2A0E61]">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition cursor-pointer" aria-label="Close preview" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            {/* URL bar */}
            <div className="hidden sm:flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5 max-w-[400px]">
              <Monitor size={12} className="text-gray-500 shrink-0" />
              <span className="text-xs text-gray-400 font-mono truncate">{url}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-black/30 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'desktop' ? 'bg-[#7042f8] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                aria-label="Desktop view"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'mobile' ? 'bg-[#7042f8] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                aria-label="Mobile view"
              >
                <Smartphone size={14} />
              </button>
            </div>

            {/* Open in new tab */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
            >
              <ExternalLink size={12} /> Live site
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Iframe area */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {/* Loading skeleton */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a14]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#7042f8] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-500 font-mono">Loading preview…</span>
              </div>
            </div>
          )}
          <iframe
            src={url}
            title={`Preview of ${title}`}
            className="w-full h-full border-0 transition-all duration-300"
            style={viewMode === 'mobile' ? {width: '375px', maxWidth: '100%', height: '100%', margin: '0 auto', display: 'block', borderLeft: '1px solid #2A0E61', borderRight: '1px solid #2A0E61'} : {}}
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Portfolio ─── */
export default function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preview, setPreview] = useState<{url: string; title: string} | null>(null);
  const {scrollYProgress} = useScroll();
  const scaleX = useSpring(scrollYProgress, {stiffness: 100, damping: 30, restDelta: 0.001});

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    const fn = () => setScrolled((window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) > 50);
    window.addEventListener('scroll', fn, {passive: true});
    document.addEventListener('scroll', fn, {passive: true});
    document.body.addEventListener('scroll', fn, {passive: true});
    return () => {
      window.removeEventListener('scroll', fn);
      document.removeEventListener('scroll', fn);
      document.body.removeEventListener('scroll', fn);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (preview) setPreview(null);
        else if (navOpen) setNavOpen(false);
      }
    };
    addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [navOpen, preview]);

  return (
    <>
      {/* ── Loading Screen ── */}
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* ── Scroll Progress Bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(to right, #7042f8, #06b6d4)',
          boxShadow: '0 0 10px rgba(112,66,248,0.5)',
        }}
      />
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Animated Space Background ── */}
      <SpaceBackground />

      {/* ── NAV ── */}
      <nav className={`w-full h-[65px] fixed top-0 z-50 px-5 md:px-10 transition-all ${scrolled ? 'bg-[#03001499] backdrop-blur-md shadow-lg shadow-[#2A0E61]/50' : ''}`} aria-label="Main navigation">
        <div className="w-full h-full flex items-center justify-between m-auto max-w-[1400px]">
          <a href="#home" className="flex items-center gap-2.5" aria-label="Home">
            <span className="text-2xl font-black text-white">ZA<span className="text-[#7042f8]">.</span></span>
            <span className="hidden md:block font-bold text-gray-300">Zaki Akdas</span>
          </a>

          {/* Desktop nav pill */}
          <div className="hidden md:flex nav-pill">
            <a href="#skills" className="px-3">About me</a>
            <a href="#skills" className="px-3">Skills</a>
            <a href="#work" className="px-3">Projects</a>
            <a href="#contact" className="px-3">Contact</a>
          </div>

          {/* Social icons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://github.com/Zaki-akdas" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#7042f8] transition" aria-label="GitHub">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#7042f8] transition" aria-label="LinkedIn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="mailto:zakiakdas703@gmail.com" className="text-gray-400 hover:text-[#7042f8] transition" aria-label="Email">
              <Mail size={22} />
            </a>
          </div>

          <button onClick={() => setNavOpen(!navOpen)} className="md:hidden text-white text-2xl w-11 h-11 flex items-center justify-center rounded-lg focus:outline-none hover:bg-white/10 transition" aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen}>
            {navOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {navOpen && (
          <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} className="fixed top-[70px] left-4 right-4 z-50 glass-card p-5 md:hidden" role="menu" aria-label="Mobile navigation">              {['About', 'Skills', 'Projects', 'Contact'].map((x, i) => {
                const href = x === 'About' ? '#skills' : x === 'Projects' ? '#work' : `#${x.toLowerCase()}`;
                return (
                  <motion.a key={x} initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: i * 0.05}} href={href} onClick={() => setNavOpen(false)} role="menuitem" className="block py-4 min-h-[44px] text-base text-gray-300 hover:text-[#7042f8] font-medium border-b border-[#2A0E61] last:border-0">{x}</motion.a>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="h-full w-full overflow-hidden" id="main-content">
        <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20">

          {/* ═══ HERO ═══ */}
          <div id="home" className="relative flex flex-col h-full w-full overflow-hidden">
            {/* Decorative radial glow */}
            <div className="absolute top-[20%] left-0 sm:left-[10%] w-[250px] sm:w-[400px] lg:w-[500px] h-[250px] sm:h-[400px] lg:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.12),transparent_70%)] blur-[80px] pointer-events-none -z-[1]" />
            <div className="absolute top-[40%] right-0 sm:right-[5%] w-[200px] sm:w-[350px] lg:w-[400px] h-[200px] sm:h-[350px] lg:h-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08),transparent_70%)] blur-[80px] pointer-events-none -z-[1]" />

            <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-20 mt-24 sm:mt-28 lg:mt-40 w-full max-w-[1400px] m-auto z-[10]">
              <div className="h-full w-full flex flex-col gap-5 justify-center items-center text-center">
                <Reveal>
                  <WelcomeBadge text="Fullstack Developer Portfolio" />
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="flex flex-col gap-2 mt-4 sm:mt-6 font-bold text-white max-w-[700px]">
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Providing <span className="gradient-text-cyan">the best</span> project experience.</span>
                  </div>
                </Reveal>

                <Reveal delay={0.2}>
                  <p className="text-sm sm:text-base md:text-lg text-gray-400 my-3 sm:my-5 max-w-[600px] leading-relaxed">
                    I&apos;m Zaki Akdas Choudhary, a web developer creating professional, modern websites for businesses of every kind — from a strong first online presence to custom digital experiences that support growth.
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <a href="#work" className="button-primary text-center text-white cursor-pointer w-full sm:w-auto">View projects</a>
                    <a href="#contact" className="py-2.5 px-6 text-center text-gray-300 cursor-pointer rounded-lg border border-[#2A0E61] hover:border-[#7042f8] transition font-semibold w-full sm:w-auto">Contact me</a>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          {/* ═══ STATS ═══ */}
          <StatsSection />

          {/* ═══ SKILLS ═══ */}
          <section id="skills" className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden py-12 sm:py-20 px-4 sm:px-5" style={{opacity: 1}}>
            <Reveal className="flex flex-col items-center justify-center gap-3">
              <WelcomeBadge text="Think better with Next.js" />
              <div className="text-lg sm:text-xl md:text-[30px] text-white font-medium mt-2 sm:mt-[10px] text-center mb-3 sm:mb-[15px] px-4">Making apps with modern technologies.</div>
              <div className="text-sm sm:text-lg md:text-[20px] text-gray-200 mb-6 sm:mb-10 mt-1 sm:mt-[10px] text-center italic px-4">Never miss a task, deadline or idea.</div>
            </Reveal>

            <div className="flex flex-row justify-center flex-wrap mt-4 gap-4 sm:gap-6 items-center max-w-[1000px] px-2">
              {skills.map((skill, i) => (
                <Reveal key={skill.name} delay={i * 0.04}>
                  <div className="skill-icon flex flex-col items-center gap-2 cursor-default">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[rgba(3,0,20,0.5)] border border-[#2A0E61] flex items-center justify-center text-3xl md:text-4xl hover:border-[#7042f8] transition-all">
                      {skill.icon}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{skill.name}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ═══ PROJECTS ═══ */}
          <section id="work" className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-5" style={{opacity: 1}}>
            <Reveal className="w-full max-w-[1200px]">
              <h2 className="text-3xl sm:text-4xl md:text-[40px] font-semibold gradient-text-cyan py-6 sm:py-10 text-center">My Projects</h2>
            </Reveal>

            <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.map((p, i) => (
                <a key={p.title} href={p.url} target="_blank" rel="noreferrer" className="block">
                  <ProjectCard project={p} index={i} onPreview={(url, title) => setPreview({url, title})} />
                </a>
              ))}
            </div>
          </section>

          {/* ═══ CONTACT ═══ */}
          <section id="contact" className="py-12 sm:py-20 px-4 sm:px-5" style={{opacity: 1}}>
            <div className="max-w-[800px] mx-auto">
              <Reveal className="flex flex-col items-center mb-12">
                <WelcomeBadge text="Get in Touch" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-4 sm:mt-6 text-center px-2">Have an idea? <span className="gradient-text-cyan">Let&apos;s build it.</span></h2>
                <p className="text-sm sm:text-base text-gray-400 mt-3 sm:mt-4 text-center max-w-lg px-4">Tell me what you&apos;re building and I&apos;ll review the details.</p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 w-full sm:w-auto px-4 sm:px-0">
                  <a href="mailto:zakiakdas703@gmail.com" className="flex items-center justify-center gap-2 border border-[#2A0E61] text-gray-300 font-bold px-5 py-3 rounded-lg hover:border-[#7042f8] hover:text-white transition">
                    <Mail size={18} /> Email Zaki
                  </a>
                  <a href="https://wa.me/919131957419" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border border-[#2A0E61] text-gray-300 font-bold px-5 py-3 rounded-lg hover:border-[#7042f8] hover:text-white transition">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <ContactForm />
              </Reveal>
            </div>
          </section>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full bg-[#030014] border-t border-[#2A0E61] py-8 sm:py-12 px-4 sm:px-5" role="contentinfo">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="footer-col flex flex-col items-center md:items-start">
            <h3 className="text-white">Social Media</h3>
            <a href="https://github.com/Zaki-akdas" target="_blank" rel="noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://wa.me/919131957419" target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
          </div>
          <div className="footer-col flex flex-col items-center md:items-start">
            <h3 className="text-white">About</h3>
            <a href="#skills">My Skills</a>
            <a href="#work">Projects</a>
            <a href="mailto:zakiakdas703@gmail.com"><Mail size={16} /> Contact Me</a>
          </div>
          <div className="footer-col flex flex-col items-center md:items-start">
            <h3 className="text-white">Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#skills">About Me</a>
            <a href="#contact">Let&apos;s Talk</a>
          </div>
        </div>
        <div className="mt-6 sm:mt-10 text-center text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} Zaki Akdas Choudhary. All rights reserved.
        </div>
      </footer>

      {/* ═══ SCROLL TO TOP ═══ */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{opacity: 0, scale: 0.8, y: 20}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.8, y: 20}}
            transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="scroll-to-top"
            aria-label="Scroll to top"
          >
            <ChevronUp size={22} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══ PROJECT PREVIEW MODAL ═══ */}
      <AnimatePresence>
        {preview && (
          <ProjectPreviewModal
            url={preview.url}
            title={preview.title}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
