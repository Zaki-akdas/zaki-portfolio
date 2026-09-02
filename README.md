# Cosmic Portfolio — 3D Animated Freelance Web Developer Portfolio

A premium, 3D-animated portfolio with a real-time WebGL universe background, cinematic
preloader, scroll-driven camera storytelling, micro-interactions, and a full admin panel.

## Stack

- **Next.js 14 (App Router) + TypeScript**
- **Three.js via React Three Fiber** — starfield, nebula, ringed planet, scroll-driven camera rig
- **Tailwind CSS** with CSS-variable theming (accent color editable from admin)
- **JSON file store** (`data/*.json`) — swap for PostgreSQL/Prisma later without touching the UI
- Cookie-based admin auth (HMAC-signed session, hashed password)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Admin panel

- URL: `/admin`
- Default password: `admin123` → **change it in Settings after first login**
- Modules: Dashboard, Projects (CRUD + reorder + featured), Skills, Testimonials
  (publish/draft), Inbox (contact submissions), Settings (identity, theme accent,
  3D kill-switch, preloader toggle, availability, SEO meta, password change)

## Performance & accessibility

- Capability detection: full 3D on desktop, lite scene on mobile, CSS starfield on
  low-end devices / no WebGL / `prefers-reduced-motion`
- DPR capped (1.75 desktop / 1.5 mobile), additive-blend particles, no postprocessing on mobile
- All content is real DOM text (SEO-indexable), canvas is decorative
- Keyboard focus states, 44px touch targets, reduced-motion support, mobile-first breakpoints

## Content model

All content lives in `data/content.json` (profile, settings, skills, projects, services,
process, testimonials). Contact submissions append to `data/messages.json`.
Admin credentials in `data/auth.json` (auto-generated, salted SHA-256).

## Roadmap (next phases)

- GSAP ScrollTrigger pinned storytelling + Lenis smooth scroll
- Blog / case-study module (MDX) with per-post SEO
- Media library with image upload + compression
- Prisma/PostgreSQL adapter, NextAuth, 2FA
- Draco-compressed GLB assets and LOD pipeline
