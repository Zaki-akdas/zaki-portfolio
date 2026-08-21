'use client';
import dynamic from 'next/dynamic';
import {useEffect, useState, useRef, useCallback} from 'react';
import {ArrowUpRight, Menu, X, Mail, MessageCircle, Send, CheckCircle, AlertCircle} from 'lucide-react';
import {projects} from '@/data/projects';

const DigitalCore = dynamic(() => import('./DigitalCore'), {ssr: false, loading: () => <div className="corefallback">&lt;/&gt;</div>});

const services = ['Business Websites', 'Web Applications', 'E-commerce', 'Custom Business Tools', 'AI Integrations', 'Product Refinement'];
const tech = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'APIs', 'PostgreSQL', 'MongoDB', 'Supabase', 'Git & GitHub', 'OpenAI', 'Gemini'];

/* ─── Reveal hook ─── */
function useReveal<T extends HTMLElement = HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
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

/* ─── 3D Tilt hook ─── */
function useTilt<T extends HTMLElement = HTMLElement>(maxTilt = 8) {
  const ref = useRef<T>(null);
  const onMove = useCallback((e: PointerEvent) => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) translateY(-5px)`;
  }, [maxTilt]);
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = ''; }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, [onMove, onLeave]);
  return ref;
}

/* ─── Parallax hook ─── */
function useParallax<T extends HTMLElement = HTMLElement>(speed = 0.12) {
  const ref = useRef<T>(null);
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

/* ─── Particle canvas ─── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let W: number, H: number;
    const dpr = window.devicePixelRatio || 1;
    let particles: {x: number; y: number; vx: number; vy: number; r: number; a: number}[] = [];

    function resize() {
      W = canvas!.width = innerWidth * dpr;
      H = canvas!.height = innerHeight * dpr;
      canvas!.style.width = innerWidth + 'px';
      canvas!.style.height = innerHeight + 'px';
      const count = innerWidth < 700 ? 25 : 50;
      particles = Array.from({length: count}, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.25 + 0.08,
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
            ctx!.strokeStyle = `rgba(100,80,200,${(1 - d / 120) * 0.07})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);
  return <canvas id="particles" ref={canvasRef} aria-hidden="true" />;
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
        body: JSON.stringify({name: formData.name, email: formData.email, projectType: formData.type, budget: formData.budget, message: formData.message}),
      });
      if (res.ok) { setStatus('success'); setFormData({name: '', email: '', type: 'Business website', budget: "Let's discuss", message: ''}); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };
  const set = (field: string, value: string) => setFormData(p => ({...p, [field]: value}));

  if (status === 'success') return (
    <div className="form-success reveal-scale visible">
      <CheckCircle size={28} /><h3>Message sent!</h3><p>Thanks for reaching out. I&apos;ll get back to you soon.</p>
      <button className="form-reset" onClick={() => setStatus('idle')}>Send another message</button>
    </div>
  );

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field"><label htmlFor="c-name">Name</label><input id="c-name" type="text" required placeholder="Your name" value={formData.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="form-field"><label htmlFor="c-email">Email</label><input id="c-email" type="email" required placeholder="you@company.com" value={formData.email} onChange={e => set('email', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="c-type">Project type</label><select id="c-type" value={formData.type} onChange={e => set('type', e.target.value)}><option>Business website</option><option>Web application</option><option>E-commerce</option><option>AI integration</option><option>Other</option></select></div>
        <div className="form-field"><label htmlFor="c-budget">Budget range</label><select id="c-budget" value={formData.budget} onChange={e => set('budget', e.target.value)}><option>Let&apos;s discuss</option><option>Under ₹25,000</option><option>₹25,000–₹75,000</option><option>₹75,000+</option></select></div>
      </div>
      <div className="form-field"><label htmlFor="c-message">Project description</label><textarea id="c-message" required rows={5} placeholder="What would you like to build?" value={formData.message} onChange={e => set('message', e.target.value)} /></div>
      <button className="primary magnetic" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Sending…' : <>Send inquiry <Send size={16} /></>}</button>
      {status === 'error' && <div className="form-error"><AlertCircle size={16} /> Something went wrong. Please try again or email me directly.</div>}
    </form>
  );
}

/* ─── Section Header ─── */
function Header({tag, title, text}: {tag: string; title: string; text: string}) {
  const ref = useReveal<HTMLDivElement>();
  return <div className="header" ref={ref}><div><p className="eyebrow">{tag}</p><h2>{title}</h2></div><p>{text}</p></div>;
}

/* ─── Main Portfolio ─── */
export default function Portfolio() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 1100); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const fn = () => setProgress(scrollY / (document.documentElement.scrollHeight - innerHeight) * 100);
    addEventListener('scroll', fn, {passive: true});
    return () => removeEventListener('scroll', fn);
  }, []);

  /* Reveal refs */
  const statementRef = useReveal<HTMLDivElement>();
  const skillsRef = useReveal<HTMLDivElement>();
  const aboutRef = useReveal<HTMLDivElement>();
  const journeyRef = useReveal<HTMLDivElement>();
  const contactRef = useReveal<HTMLDivElement>();
  const heroRef = useReveal<HTMLDivElement>(0.05);

  /* Tilt refs */
  const projectTilt = useTilt<HTMLAnchorElement>(6);
  const serviceTilt = useTilt<HTMLDivElement>(5);

  /* Parallax refs */
  const parallaxBg = useParallax<HTMLDivElement>(0.08);

  return (<>
    {/* Particle background */}
    <Particles />

    {/* Loader */}
    <div className={loaded ? 'loader done' : 'loader'}>
      <div>
        <b>ZAKI AKDAS<br />CHOUDHARY</b>
        <span>WEB DEVELOPER · BHOPAL</span>
        <i>100%</i>
      </div>
    </div>

    {/* Progress bar */}
    <div className="progress" style={{width: `${progress}%`}} />

    {/* Nav */}
    <nav>
      <a className="logo" href="#home">ZA<span>.</span><small>WEB SYSTEMS</small></a>
      <div className={open ? 'links open' : 'links'}>
        {['Work', 'Services', 'Skills', 'About', 'Contact'].map(x => (
          <a onClick={() => setOpen(false)} key={x} href={'#' + x.toLowerCase()}>{x}</a>
        ))}
      </div>
      <a className="talk magnetic" href="#contact">Let&apos;s talk <ArrowUpRight size={15} /></a>
      <button className="menu" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </nav>

    <main>
      {/* Marquee */}
      <div className="marquee"><div>WEB DEVELOPER <b>✦</b> BUSINESS WEBSITES <b>✦</b> DIGITAL EXPERIENCES <b>✦</b> WEB DEVELOPER <b>✦</b> BUSINESS WEBSITES <b>✦</b> DIGITAL EXPERIENCES <b>✦</b></div></div>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="heroCopy hero-stagger" ref={heroRef}>
          <p className="eyebrow">Hello, I&apos;m Zaki · Bhopal, India</p>
          <p className="role">WEB DEVELOPER <span>/</span> BUSINESS WEBSITE BUILDER</p>
          <h1>I build <i>digital experiences</i> with purpose.</h1>
          <p className="lead">I&apos;m Zaki Akdas Choudhary, a web developer creating professional, modern websites for businesses of every kind — from a strong first online presence to custom digital experiences that support growth.</p>
          <div className="actions">
            <a className="primary magnetic" href="#contact">Start a project <ArrowUpRight /></a>
            <a className="secondary magnetic" href="#work">View work ↓</a>
          </div>
          <div className="micro">
            <span><b>WEB DEVELOPER</b>Designing & building for the web</span>
            <span><b>AVAILABLE TO CONNECT</b>For selected freelance projects</span>
          </div>
        </div>
        <DigitalCore />
      </section>

      {/* Statement */}
      <section className="statement" ref={statementRef}>
        <p className="eyebrow">A considered approach</p>
        <h2>I don&apos;t just make pages.<br />I shape <i>useful digital products.</i></h2>
        <p>From concept to launch, I focus on thoughtful interfaces, responsive development and the details that make a digital experience feel credible.</p>
      </section>

      {/* Work */}
      <section id="work">
        <Header tag="Selected work" title="Live products for real businesses." text="Each card opens a published client website. No invented statistics or fictional outcomes." />
        <div className="projects">
          {projects.map(p => (
            <a className={`project ${p.theme} tilt-card`} key={p.title} href={p.url} target="_blank" ref={projectTilt}>
              <div className="browser">
                <b>{p.theme === 'food' ? 'AL-BAIK ZAYKA' : '☾ NIGHT CORNER'}</b>
                <span>{p.theme === 'food' ? 'FAST FOOD · HOME DELIVERY' : 'YOUR NIGHT · YOUR ESSENTIALS'}</span>
              </div>
              <small>{p.kind}</small>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
              <em>View live <ArrowUpRight size={18} /></em>
            </a>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services">
        <Header tag="What I can build" title="Useful technology, thoughtfully applied." text="Services shaped around the problems a growing business needs to solve." />
        <div className="serviceGrid">
          {services.map((x, i) => (
            <article key={x} className="tilt-card" ref={serviceTilt}>
              <small>0{i + 1} / BUILD</small>
              <h3>{x}</h3>
              <p>{['Professional responsive sites that establish trust and create a clear path to enquiry.', 'Modern interfaces and connected product features for practical ideas.', 'Clear shopping experiences built around product discovery and action.', 'Dashboards and workflows shaped around a real operational need.', 'Useful AI features connected to products and business workflows.', 'Responsive improvements and thoughtful evolution of an existing site.'][i]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="skills" ref={skillsRef}>
        <div>
          <p className="eyebrow">Technology ecosystem</p>
          <h2>A modern web toolkit.</h2>
          <p>Frontend interfaces, backend logic, databases and AI APIs — selected for the job, not added for noise.</p>
        </div>
        <div className="cloud stagger">
          {tech.map(x => <span key={x}>{x}</span>)}
        </div>
      </section>

      {/* About */}
      <section id="about" className="about" ref={aboutRef}>
        <div className="monogram float" ref={parallaxBg}>
          ZA<small>BHOPAL · INDIA</small>
        </div>
        <div>
          <p className="eyebrow">About Zaki</p>
          <h2>The developer behind the interface.</h2>
          <p>I&apos;m Zaki Akdas Choudhary, a web developer based in Bhopal with a BCA background in Information Technology. I value clear communication, structured problem-solving and steady refinement.</p>
          <p>Every project starts by understanding what needs to work — then turns that clarity into an experience people can actually use.</p>
        </div>
      </section>

      {/* Journey */}
      <section className="journey" ref={journeyRef}>
        <p className="eyebrow">Career &amp; approach</p>
        <h2>Learning. Building.<br /><i>Improving.</i></h2>
        <div className="timeline stagger">
          <article>
            <small>NOW</small>
            <b>Web Developer</b>
            <p>Creating professional, modern websites for businesses of every kind.</p>
          </article>
          <article>
            <small>FOUNDATION</small>
            <b>BCA · Information Technology</b>
            <p>Developing the technical foundation behind thoughtful web experiences.</p>
          </article>
          <article>
            <small>NEXT</small>
            <b>Freelance &amp; digital products</b>
            <p>Growing a body of client work with clear outcomes and useful experiences.</p>
          </article>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact glow-pulse" ref={contactRef}>
        <p className="eyebrow">Start a conversation</p>
        <h2>Have an idea?<br /><i>Let&apos;s build it.</i></h2>
        <p>Tell me what you&apos;re building, what it needs to achieve and where you want to take it.</p>
        <div className="contact-links">
          <a className="secondary magnetic" href="mailto:zakiakdas703@gmail.com"><Mail />Email Zaki</a>
          <a className="secondary magnetic" href="https://wa.me/919131957419" target="_blank"><MessageCircle /> WhatsApp</a>
        </div>
        <ContactForm />
      </section>
    </main>

    <footer>© {new Date().getFullYear()} Zaki Akdas Choudhary · Built with intent.</footer>
  </>);
}
