'use client';
import {useEffect, useState, useRef} from 'react';
import {motion, useInView, useScroll, useTransform, AnimatePresence} from 'framer-motion';
import {ArrowUpRight, Mail, MessageCircle, Send, CheckCircle, AlertCircle, Code2, Globe, ShoppingCart, Brain, Wrench, Layers, ChevronDown, Menu, X, ExternalLink} from 'lucide-react';
import dynamic from 'next/dynamic';
import {projects} from '@/data/projects';

const Planet = dynamic(() => import('./Planet'), {ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><div className="text-6xl text-purple-400 animate-pulse">🌍</div></div>});
const Starfield = dynamic(() => import('./Starfield'), {ssr: false});

/* ─── Data ─── */
const services = [
  {icon: Globe, title: 'Business Websites', desc: 'Professional responsive sites that establish trust and create a clear path to enquiry.', color: '#6c3ce0'},
  {icon: Code2, title: 'Web Applications', desc: 'Modern interfaces and connected product features for practical ideas.', color: '#3b82f6'},
  {icon: ShoppingCart, title: 'E-commerce', desc: 'Clear shopping experiences built around product discovery and action.', color: '#ec4899'},
  {icon: Wrench, title: 'Custom Tools', desc: 'Dashboards and workflows shaped around a real operational need.', color: '#06b6d4'},
  {icon: Brain, title: 'AI Integrations', desc: 'Useful AI features connected to products and business workflows.', color: '#a78bfa'},
  {icon: Layers, title: 'Product Refinement', desc: 'Responsive improvements and thoughtful evolution of an existing site.', color: '#f59e0b'},
];

const tech = [
  {name: 'HTML', color: '#e34c26'}, {name: 'CSS', color: '#1572b6'},
  {name: 'JavaScript', color: '#f7df1e'}, {name: 'TypeScript', color: '#3178c6'},
  {name: 'React', color: '#61dafb'}, {name: 'Next.js', color: '#ffffff'},
  {name: 'Tailwind CSS', color: '#06b6d4'}, {name: 'Node.js', color: '#68a063'},
  {name: 'PostgreSQL', color: '#336791'}, {name: 'MongoDB', color: '#47a248'},
  {name: 'Supabase', color: '#3ecf8e'}, {name: 'Git', color: '#f05032'},
  {name: 'OpenAI', color: '#10a37f'}, {name: 'Gemini', color: '#8b5cf6'},
  {name: 'Three.js', color: '#049ef4'},
];

/* ─── Reveal wrapper ─── */
function Reveal({children, className = '', delay = 0, direction = 'up'}: {children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right'}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {once: true, margin: '0px 0px -20px 0px'});
  const variants = {
    up: {hidden: {opacity: 0, y: 50}, visible: {opacity: 1, y: 0}},
    down: {hidden: {opacity: 0, y: -50}, visible: {opacity: 1, y: 0}},
    left: {hidden: {opacity: 0, x: -50}, visible: {opacity: 1, x: 0}},
    right: {hidden: {opacity: 0, x: 50}, visible: {opacity: 1, x: 0}},
  };
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={variants[direction]} transition={{duration: 0.7, delay, ease: [0.16, 1, 0.3, 1]}} className={className}>
      {children}
    </motion.div>
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
      <button onClick={() => setStatus('idle')} className="text-purple-400 hover:text-purple-300 text-sm font-semibold cursor-pointer">Send another →</button>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Name</label><input required type="text" placeholder="Your name" value={formData.name} onChange={e => set('name', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" /></div>
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Email</label><input required type="email" placeholder="you@company.com" value={formData.email} onChange={e => set('email', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Project type</label><select value={formData.type} onChange={e => set('type', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 cursor-pointer appearance-none"><option>Business website</option><option>Web application</option><option>E-commerce</option><option>AI integration</option><option>Other</option></select></div>
        <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Budget range</label><select value={formData.budget} onChange={e => set('budget', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 cursor-pointer appearance-none"><option>Let&apos;s discuss</option><option>Under ₹25,000</option><option>₹25,000–₹75,000</option><option>₹75,000+</option></select></div>
      </div>
      <div><label className="block text-xs font-bold text-gray-400 mb-1.5 tracking-wider uppercase">Project description</label><textarea required rows={5} placeholder="What would you like to build?" value={formData.message} onChange={e => set('message', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-vertical min-h-[120px]" /></div>
      <button type="submit" disabled={status === 'submitting'} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
        {status === 'submitting' ? 'Sending…' : <>Send inquiry <Send size={16} /></>}
      </button>
      {status === 'error' && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle size={16} /> Something went wrong. Please try again or email me directly.</div>}
    </form>
  );
}

/* ─── Main Portfolio ─── */
export default function Portfolio() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const {scrollYProgress} = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    addEventListener('scroll', fn, {passive: true});
    return () => removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navOpen) {
        setNavOpen(false);
      }
    };
    addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [navOpen]);

  return (
    <>
      {/* Skip to content link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Background layers */}
      <Starfield />
      <div className="nebula-1" aria-hidden="true" />
      <div className="nebula-2" aria-hidden="true" />
      <div className="nebula-3" aria-hidden="true" />

      {/* Scroll progress */}
      <motion.div className="fixed top-0 left-0 h-[2px] z-50 bg-gradient-to-r from-purple-500 via-blue-400 to-cyan-400" style={{width: progressWidth}} role="progressbar" aria-label="Page scroll progress" />

      {/* Nav */}
      <motion.nav initial={{y: -80, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.8, delay: 0.2}} className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-[1100px] px-5 py-3 flex items-center justify-between rounded-2xl transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/20' : ''}`} aria-label="Main navigation">
        <a href="#home" className="font-black text-lg tracking-tight" aria-label="Zaki Akdas Choudhary - Home">ZA<span className="text-purple-400">.</span></a>
        <div className="hidden md:flex items-center gap-7 text-sm text-gray-400" role="menubar">
          {['Work', 'Skills', 'About', 'Contact'].map(x => (
            <a key={x} href={`#${x.toLowerCase()}`} role="menuitem" className="hover:text-white transition-colors">{x}</a>
          ))}
        </div>
        <a href="#contact" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all">
          Let&apos;s talk <ArrowUpRight size={14} />
        </a>
        <button onClick={() => setNavOpen(!navOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white" aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen} aria-controls="mobile-menu">
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {navOpen && (
          <motion.div id="mobile-menu" role="menu" initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} className="fixed top-20 left-4 right-4 z-40 glass rounded-2xl p-5 md:hidden" aria-label="Mobile navigation">
            {['Work', 'Skills', 'About', 'Contact'].map((x, i) => (
              <motion.a key={x} initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: i * 0.05}} href={`#${x.toLowerCase()}`} onClick={() => setNavOpen(false)} className="block py-3 text-gray-300 hover:text-white font-medium border-b border-white/5 last:border-0">{x}</motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10" id="main-content">
        {/* ═══ HERO ═══ */}
        <section id="home" aria-label="Hero" className="min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16">
          <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <motion.div initial={{opacity: 0, x: -40}} animate={{opacity: 1, x: 0}} transition={{duration: 0.9, delay: 0.4}} className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Bhopal, India · Web Developer
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight mb-6">
                I build <span className="gradient-text">digital experiences</span> with purpose.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                Professional, modern websites for businesses of every kind — from a strong first online presence to custom digital experiences that support growth.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a href="#contact" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:-translate-y-0.5">
                  Start a project <ArrowUpRight size={18} />
                </a>
                <a href="#work" className="flex items-center gap-2 border border-white/10 text-gray-300 font-bold px-6 py-3.5 rounded-xl hover:border-purple-500/40 hover:text-white transition-all">
                  View work ↓
                </a>
              </div>
              <div className="flex gap-8 mt-10 text-gray-500 text-xs">
                <div><span className="block text-white text-sm font-bold mb-1">WEB DEVELOPER</span>Designing & building</div>
                <div><span className="block text-white text-sm font-bold mb-1">AVAILABLE</span>For freelance projects</div>
              </div>
            </motion.div>

            {/* Right: Planet */}
            <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} transition={{duration: 1, delay: 0.6}} className="order-1 lg:order-2 h-[350px] md:h-[450px] lg:h-[520px]">
              <Planet />
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div animate={{y: [0, 8, 0]}} transition={{duration: 2, repeat: Infinity}} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown size={24} className="text-gray-500" />
          </motion.div>
        </section>

        {/* ═══ STATEMENT ═══ */}
        <section className="py-20 md:py-32 px-5 border-t border-b border-white/5" aria-label="Approach">
          <div className="max-w-[1100px] mx-auto">
            <Reveal>
              <p className="text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">A considered approach</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                I don&apos;t just make pages.<br />I shape <span className="gradient-text-accent">useful digital products.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">From concept to launch, I focus on thoughtful interfaces, responsive development and the details that make a digital experience feel credible.</p>
            </Reveal>
          </div>
        </section>

        {/* ═══ WORK ═══ */}
        <section id="work" aria-label="Selected work" className="py-20 md:py-32 px-5">
          <div className="max-w-[1100px] mx-auto">
            <Reveal>
              <p className="text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">Selected work</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Live products for<br />real businesses.</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-gray-400 mb-12 max-w-lg">Each card opens a published client website.</p>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.15}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="glass-card block p-6 group">
                    <div className={`h-48 rounded-xl mb-5 flex flex-col justify-end p-5 ${p.theme === 'food' ? 'bg-gradient-to-br from-red-600 to-red-900' : 'bg-gradient-to-br from-blue-600 to-indigo-950'}`}>
                      <span className="text-white/80 text-xs font-bold tracking-widest uppercase">{p.theme === 'food' ? 'Fast Food · Home Delivery' : 'Your Night · Your Essentials'}</span>
                      <span className="text-white text-2xl font-black tracking-tight">{p.title}</span>
                    </div>
                    <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">{p.kind}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.tags.map(t => <span key={t} className="text-xs border border-white/10 rounded-full px-3 py-1 text-gray-400">{t}</span>)}
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-purple-400 group-hover:text-purple-300 transition-colors">View live <ExternalLink size={14} /></span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SERVICES ═══ */}
        <section id="skills" aria-label="Services" className="py-20 md:py-32 px-5 border-t border-white/5">
          <div className="max-w-[1100px] mx-auto">
            <Reveal>
              <p className="text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">What I can build</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12">Useful technology,<br />thoughtfully applied.</h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="glass-card p-6 h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{background: `${s.color}15`, border: `1px solid ${s.color}30`}}>
                      <s.icon size={22} style={{color: s.color}} />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TECH STACK ═══ */}
        <section className="py-20 md:py-32 px-5 border-t border-white/5" aria-label="Technology stack">
          <div className="max-w-[1100px] mx-auto">
            <Reveal>
              <p className="text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">Technology ecosystem</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12">A modern web toolkit.</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-3 justify-center">
                {tech.map((t, i) => (
                  <motion.div key={t.name} initial={{opacity: 0, scale: 0.8}} whileInView={{opacity: 1, scale: 1}} viewport={{once: true}} transition={{delay: i * 0.04}} whileHover={{y: -5, scale: 1.08}} className="glass-card px-5 py-3 flex items-center gap-2.5 cursor-default">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background: t.color}} />
                    <span className="text-sm font-medium text-gray-300">{t.name}</span>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <section id="about" aria-label="About Zaki" className="py-20 md:py-32 px-5 border-t border-white/5">
          <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Monogram */}
            <Reveal direction="left">
              <div className="aspect-square max-w-[380px] mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/30 to-blue-900/20 flex items-center justify-center relative overflow-hidden">
                <span className="text-[10rem] font-black tracking-tighter text-white/5">ZA</span>
                <div className="absolute bottom-6 left-0 right-0 text-center text-xs font-bold text-gray-500 tracking-[0.15em] uppercase">Bhopal · India</div>
              </div>
            </Reveal>

            {/* Text */}
            <div>
              <Reveal>
                <p className="text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">About Zaki</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">The developer behind<br />the interface.</h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-gray-400 leading-relaxed mb-4">I&apos;m Zaki Akdas Choudhary, a web developer based in Bhopal with a BCA background in Information Technology. I value clear communication, structured problem-solving and steady refinement.</p>
              </Reveal>
              <Reveal delay={0.3}>
                <p className="text-gray-400 leading-relaxed mb-8">Every project starts by understanding what needs to work — then turns that clarity into an experience people can actually use.</p>
              </Reveal>

              {/* Timeline */}
              <Reveal delay={0.35}>
                <div className="border-t border-white/10 pt-6 space-y-5">
                  {[
                    {label: 'NOW', title: 'Web Developer', desc: 'Creating professional, modern websites for businesses of every kind.'},
                    {label: 'FOUNDATION', title: 'BCA · Information Technology', desc: 'Developing the technical foundation behind thoughtful web experiences.'},
                    {label: 'NEXT', title: 'Freelance & digital products', desc: 'Growing a body of client work with clear outcomes and useful experiences.'},
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase mt-1 shrink-0 w-20">{item.label}</span>
                      <div className="border-l border-white/10 pl-4">
                        <h4 className="text-white font-bold text-sm">{item.title}</h4>
                        <p className="text-gray-500 text-xs leading-relaxed mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══ CONTACT ═══ */}
        <section id="contact" aria-label="Contact" className="py-20 md:py-32 px-5">
          <div className="max-w-[1100px] mx-auto">
            <div className="glass-card p-8 md:p-12 lg:p-16 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <Reveal>
                  <p className="text-xs font-bold text-purple-400 tracking-[0.15em] uppercase mb-5">Start a conversation</p>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                    Have an idea?<br /><span className="gradient-text-accent">Let&apos;s build it.</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="text-gray-400 text-lg max-w-lg mb-8">Tell me what you&apos;re building, what it needs to achieve and where you want to take it.</p>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="flex flex-wrap gap-3 mb-10">
                    <a href="mailto:zakiakdas703@gmail.com" className="flex items-center gap-2 border border-white/10 text-gray-300 font-bold px-5 py-3 rounded-xl hover:border-purple-500/40 hover:text-white transition-all">
                      <Mail size={18} /> Email Zaki
                    </a>
                    <a href="https://wa.me/919131957419" target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-white/10 text-gray-300 font-bold px-5 py-3 rounded-xl hover:border-purple-500/40 hover:text-white transition-all">
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                  </div>
                </Reveal>
                <Reveal delay={0.25}>
                  <ContactForm />
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-gray-600 text-xs" role="contentinfo">
        © {new Date().getFullYear()} Zaki Akdas Choudhary · Built with intent.
      </footer>
    </>
  );
}
