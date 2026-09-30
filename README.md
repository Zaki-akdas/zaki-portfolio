# Cosmic Portfolio — 3D Animated Freelance Web Developer Portfolio

A premium, 3D-animated portfolio with a real-time WebGL universe background, cinematic
preloader, scroll-driven camera storytelling, micro-interactions, and a full admin panel.

## Stack

- **Next.js 14 (App Router) + TypeScript**
- **Three.js via React Three Fiber** — starfield, nebula, ringed planet, scroll-driven camera rig
- **Tailwind CSS** with CSS-variable theming (accent color editable from admin)
- **Tri-mode content store** — Postgres (`DATABASE_URL`) in production, Upstash
  Redis for messages/rate-limits, JSON files (`data/*.json`) for local dev & e2e.
  Media uploads go to **Supabase Storage** (public `media` bucket).
- Cookie-based admin auth (HMAC-signed session, **scrypt**-hashed password)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Admin panel

- URL: `/admin`
- Password: set the `ADMIN_PASSWORD` environment variable (required in
  production), or change it in Settings → Change admin password
- Modules: Dashboard, Projects (CRUD + reorder + featured), Blog (markdown posts,
  draft/publish, per-post SEO), Skills, Testimonials (publish/draft), Media
  (image/PDF upload to Supabase Storage), Inbox (contact submissions), Settings
  (identity, theme accent, 3D kill-switch, preloader toggle, availability, SEO
  meta, password change)

## Deployment

Production runs on **Vercel** (auto-deploys every push to `main`) with
**Supabase Postgres** for durable content/messages and **Supabase Storage** for
media. See [`DEPLOY.md`](./DEPLOY.md) for env vars and alternatives.

## Performance & accessibility

- Capability detection: full 3D on desktop, lite scene on mobile, CSS starfield on
  low-end devices / no WebGL / `prefers-reduced-motion`
- DPR capped (1.75 desktop / 1.5 mobile), additive-blend particles, no postprocessing on mobile
- All content is real DOM text (SEO-indexable), canvas is decorative
- Keyboard focus states, 44px touch targets, reduced-motion support, mobile-first breakpoints

## Content model

Content (profile, settings, skills, projects, services, process, testimonials,
blog posts) is one JSONB document per key. In production it lives in the
`portfolio_content` Postgres table, seeded from the bundled `data/*.json`;
locally (no `DATABASE_URL`) the JSON files under `data/` are the store. Contact
submissions and rate limits go to `portfolio_messages` (Postgres) / Upstash
Redis, falling back to `data/messages.json`. Admin credentials in `data/auth.json`
(auto-generated, salted **scrypt** hash) — never seeded into deployments.

## Roadmap (next phases)

- GSAP ScrollTrigger pinned storytelling + Lenis smooth scroll
- 2FA for the admin login
- Draco-compressed GLB assets and LOD pipeline
