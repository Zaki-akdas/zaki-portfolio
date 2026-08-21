'use client';
import {useEffect, useState, useRef} from 'react';
import {motion, useInView, useScroll, useTransform, AnimatePresence} from 'framer-motion';
import {ArrowUpRight, Mail, MessageCircle, Send, CheckCircle, AlertCircle, Menu, X, Star, ExternalLink, Sparkles} from 'lucide-react';
import dynamic from 'next/dynamic';
import {projects} from '@/data/projects';

const Planet = dynamic(() => import('./Planet'), {ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><div className="text-6xl text-purple-400 animate-pulse">🌍</div></div>});
const Starfield = dynamic(() => import('./Starfield'), {ssr: false});

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
      <button onClick={() => setStatus('idle')} className="text-purple-400 hover:text-purple-300 text-sm font-semibold cursor-pointer">Send another →</button>
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

/* ─── Main Portfolio ─── */
export default function Portfolio() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    addEventListener('scroll', fn, {passive: true});
    return () => removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navOpen) setNavOpen(false);
    };
    addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [navOpen]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Background */}
      <Starfield />
      <div className="nebula-1" aria-hidden="true" />
      <div className="nebula-2" aria-hidden="true" />

      {/* ─── NAV ─── */}
      <nav className={`w-full h-[65px] fixed top-0 z-50 px-5 md:px-10 transition-all ${scrolled ? 'bg-[#03001427] backdrop-blur-md shadow-lg shadow-[#2A0E61]/50' : ''}`} aria-label="Main navigation">
        <div className="w-full h-full flex items-center justify-between m-auto max-w-[1400px]">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5" aria-label="Home">
            <span className="text-2xl font-black text-white">ZA<span className="text-[#7042f8]">.</span></span>
            <span className="hidden md:block font-bold text-gray-300">Zaki Akdas</span>
          </a>

          {/* Desktop nav pill */}
          <div className="hidden md:flex nav-pill">
            <a href="#about" className="px-3">About me</a>
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

          {/* Mobile hamburger */}
          <button onClick={() => setNavOpen(!navOpen)} className="md:hidden text-white text-3xl focus:outline-none" aria-label={navOpen ? 'Close menu' : 'Open menu'} aria-expanded={navOpen}>
            {navOpen ? <X size={28} /> : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {navOpen && (
          <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} className="fixed top-[70px] left-4 right-4 z-50 glass-card p-5 md:hidden" role="menu" aria-label="Mobile navigation">
            {['About', 'Skills', 'Projects', 'Contact'].map((x, i) => (
              <motion.a key={x} initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: i * 0.05}} href={`#${x === 'Projects' ? 'work' : x.toLowerCase()}`} onClick={() => setNavOpen(false)} role="menuitem" className="block py-3 text-gray-300 hover:text-[#7042f8] font-medium border-b border-[#2A0E61] last:border-0">{x}</motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="h-full w-full" id="main-content">
        <div className="flex flex-col gap-20">

          {/* ═══ HERO ═══ */}
          <div className="relative flex flex-col h-full w-full">
            {/* Animated background circles */}
            <div className="absolute top-[-200px] left-0 w-full h-full overflow-hidden -z-10">
              <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(112,66,248,0.15),transparent_70%)] blur-[60px] animate-drift" />
              <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)] blur-[60px] animate-drift" style={{animationDelay: '-10s'}} />
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center px-5 lg:px-20 mt-28 lg:mt-40 w-full max-w-[1400px] m-auto z-[10]">
              {/* Left: Text */}
              <div className="h-full w-full flex flex-col gap-5 justify-center text-start">
                <Reveal>
                  <WelcomeBadge text="Web Developer Portfolio" />
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="flex flex-col gap-2 mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-[600px]">
                    <span>Providing <span className="gradient-text-cyan">the best</span> project experience.</span>
                  </div>
                </Reveal>

                <Reveal delay={0.2}>
                  <p className="text-lg text-gray-400 my-5 max-w-[600px]">
                    I&apos;m Zaki Akdas Choudhary, a web developer creating professional, modern websites for businesses of every kind — from a strong first online presence to custom digital experiences that support growth.
                  </p>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="flex gap-4">
                    <a href="#work" className="button-primary text-center text-white cursor-pointer">View projects</a>
                    <a href="#contact" className="py-2 px-6 text-center text-gray-300 cursor-pointer rounded-lg border border-[#2A0E61] hover:border-[#7042f8] transition font-semibold">Contact me</a>
                  </div>
                </Reveal>
              </div>

              {/* Right: Planet */}
              <Reveal className="w-full lg:w-1/2 h-[350px] md:h-[450px] lg:h-[550px]" delay={0.2}>
                <Planet />
              </Reveal>
            </div>
          </div>

          {/* ═══ SKILLS ═══ */}
          <section id="skills" className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden py-20 px-5">
            <Reveal className="flex flex-col items-center justify-center gap-3">
              <WelcomeBadge text="Tech Stack" />
              <div className="text-[30px] text-white font-medium mt-[10px] text-center mb-[15px]">Making apps with modern technologies.</div>
              <div className="text-[20px] text-gray-200 mb-10 mt-[10px] text-center italic">Never miss a task, deadline or idea.</div>
            </Reveal>

            {/* Skills grid */}
            <div className="flex flex-row justify-center flex-wrap mt-4 gap-6 items-center max-w-[1000px]">
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
          <section id="work" className="flex flex-col items-center justify-center py-20 px-5">
            <Reveal className="w-full max-w-[1200px]">
              <h2 className="text-[40px] font-semibold gradient-text-cyan py-10 text-center">My Projects</h2>
            </Reveal>

            <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.15}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="project-card block group">
                    <div className={`h-48 flex flex-col justify-end p-5 ${p.theme === 'food' ? 'bg-gradient-to-br from-red-700 to-red-950' : 'bg-gradient-to-br from-blue-700 to-indigo-950'}`}>
                      <span className="text-white/70 text-xs font-bold tracking-widest uppercase">{p.theme === 'food' ? 'Fast Food · Home Delivery' : 'Your Night · Your Essentials'}</span>
                      <span className="text-white text-2xl font-black">{p.title}</span>
                    </div>
                    <div className="relative p-4">
                      <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                      <p className="mt-2 text-gray-300 text-sm leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {p.tags.map(t => <span key={t} className="text-xs border border-[#2A0E61] rounded-full px-3 py-1 text-gray-400">{t}</span>)}
                      </div>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-[#7042f8] group-hover:text-[#b49bff] transition mt-3">View live <ExternalLink size={14} /></span>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ═══ CONTACT ═══ */}
          <section id="contact" className="py-20 px-5">
            <div className="max-w-[800px] mx-auto">
              <Reveal className="flex flex-col items-center mb-12">
                <WelcomeBadge text="Get in Touch" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-6 text-center">Have an idea? <span className="gradient-text-cyan">Let&apos;s build it.</span></h2>
                <p className="text-gray-400 mt-4 text-center max-w-lg">Tell me what you&apos;re building and I&apos;ll review the details.</p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="flex gap-4 justify-center mb-8">
                  <a href="mailto:zakiakdas703@gmail.com" className="flex items-center gap-2 border border-[#2A0E61] text-gray-300 font-bold px-5 py-3 rounded-lg hover:border-[#7042f8] hover:text-white transition">
                    <Mail size={18} /> Email Zaki
                  </a>
                  <a href="https://wa.me/919131957419" target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-[#2A0E61] text-gray-300 font-bold px-5 py-3 rounded-lg hover:border-[#7042f8] hover:text-white transition">
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
      <footer className="w-full bg-[#030014] border-t border-[#2A0E61] py-12 px-5" role="contentinfo">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Social Media */}
          <div className="footer-col flex flex-col items-center md:items-start">
            <h3 className="text-white">Social Media</h3>
            <a href="mailto:zakiakdas703@gmail.com"><Mail size={16} /> Instagram</a>
            <a href="https://github.com/Zaki-akdas" target="_blank" rel="noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://wa.me/919131957419" target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
          </div>

          {/* About */}
          <div className="footer-col flex flex-col items-center md:items-start">
            <h3 className="text-white">About</h3>
            <a href="#skills">My Skills</a>
            <a href="#work">Projects</a>
            <a href="mailto:zakiakdas703@gmail.com"><Mail size={16} /> Contact Me</a>
          </div>

          {/* Quick Links */}
          <div className="footer-col flex flex-col items-center md:items-start">
            <h3 className="text-white">Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#about">About Me</a>
            <a href="#contact">Let&apos;s Talk</a>
          </div>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Zaki Akdas Choudhary. All rights reserved.
        </div>
      </footer>
    </>
  );
}
